import { useEffect, useState } from "react";
import { Box, Text, Flex, Link, Spinner } from "@chakra-ui/react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { NavLink } from "react-router-dom";
import { paths } from "Consts/path";
import {
  podiumWrapperStyle,
  cardStyle,
  rankText,
  titleText,
  linkText,
  podiumContainerStyle,
} from "./_topVillagesStyle";

type TopItem = {
  name: string;
  count: number;
  rank: number;
  label: string;
};

const TopVillages = () => {
  const [topVillages, setTopVillages] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [inovatorProfile, setInovatorProfile] = useState<{ namaInovator?: string } | null>(null);

  useEffect(() => {
    const fetchTopVillages = async () => {
      setLoading(true);
      const db = getFirestore();
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) return console.warn("User not authenticated");

      try {
        const innovatorQuery = query(
          collection(db, "innovators"),
          where("id", "==", currentUser.uid)
        );
        const innovatorSnapshot = await getDocs(innovatorQuery);

        if (innovatorSnapshot.empty) {
          setTopVillages([]);
          setLoading(false);
          return;
        }

        const profilDoc = innovatorSnapshot.docs[0];
        const inovatorId = profilDoc.id;
        setInovatorProfile(profilDoc.data());

        const inovasiQuery = query(
          collection(db, "innovations"),
          where("innovatorId", "==", inovatorId)
        );
        const inovasiSnapshot = await getDocs(inovasiQuery);

        if (inovasiSnapshot.empty) {
          setTopVillages([]);
          setLoading(false);
          return;
        }

        const inovasiIds = inovasiSnapshot.docs.map((doc) => doc.id);

        const chunkArray = <T,>(arr: T[], size: number): T[][] => {
          const chunks: T[][] = [];
          for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
          }
          return chunks;
        };

        const chunks = chunkArray(inovasiIds, 10);
        let desaDocs: { desaId: string; namaDesa: string }[] = [];

        for (const chunk of chunks) {
          const desaQuery = query(
            collection(db, "claimInnovations"),
            where("inovasiId", "in", chunk)
          );
          const snapshot = await getDocs(desaQuery);
          desaDocs.push(
            ...snapshot.docs.map(
              (doc) => doc.data() as { desaId: string; namaDesa: string }
            )
          );
        }

        const countMap: Record<string, { namaDesa: string; count: number }> = {};
        desaDocs.forEach((item) => {
          if (item.desaId) {
            if (!countMap[item.desaId]) {
              countMap[item.desaId] = { namaDesa: item.namaDesa, count: 0 };
            }
            countMap[item.desaId].count++;
          }
        });

        const sorted = Object.entries(countMap)
          .sort((a, b) => {
            if (b[1].count === a[1].count) {
              return a[1].namaDesa.localeCompare(b[1].namaDesa);
            }
            return b[1].count - a[1].count;
          })
          .slice(0, 3)
          .map(([desaId, value]) => ({
            id: desaId,
            name: value.namaDesa,
            count: value.count,
          }));

        if (sorted.length === 0) {
          setTopVillages([]);
          setLoading(false);
          return;
        }

        const topThree = sorted.slice(0, 3);

        // Cek apakah semua count sama
        const allSameCount = topThree.every(item => item.count === topThree[0].count);

        let ranked;

        if (allSameCount) {
          // Semua rank 1
          ranked = topThree.map((item) => ({
            ...item,
            rank: 1,
            label: "1st",
          }));
        } else {
          // Saat nilai count berbeda
          let currentRank = 1;
          let lastCount: number | null = null;

          ranked = topThree.map((item) => {
            if (lastCount !== null && item.count !== lastCount) {
              currentRank++;
            }
            lastCount = item.count;

            return {
              ...item, //spread operator, menyalin data dalam ke dalam data baru
              rank: currentRank,
              label: `${currentRank}${["st", "nd", "rd"][currentRank - 1] || "th"}`
            };
          });
        }

        setTopVillages(ranked);
      } catch (error) {
        console.error("Error fetching top villages:", error);
        setTopVillages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopVillages();
  }, []);

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb="10px">
        <Text {...titleText}>Desa Unggulan {inovatorProfile?.namaInovator || "Inovator"}</Text>
        <Link as={NavLink} to={paths.DASHBOARD_INNOVATOR_VILLAGE} {...linkText}>
          Lihat Dashboard
        </Link>
      </Flex>

      <Box {...podiumContainerStyle}>
        {loading ? (
          <Flex justify="center" align="center" h="100%">
            <Spinner size="lg" />
          </Flex>
        ) : (
          <Flex
            {...podiumWrapperStyle}
            justify="center"
          >
            {topVillages.map((item, idx, arr) => {
              const allSameRank = arr.every(el => el.rank === arr[0].rank);
              let height = "100px";

              // Tinggi podium
              if (arr.length === 1) {
                height = "120px";
              } else if (arr.length === 2) {
                if (allSameRank) {
                  height = "100px";
                } else {
                  height = item.rank === 1 ? "120px" : "100px";
                }
              } else if (arr.length === 3) {
                if (allSameRank) {
                  height = "100px";
                } else {
                  height =
                    item.rank === 1 ? "120px" :
                    item.rank === 2 ? "100px" : "80px";
                }
              }

              // Urutan/order untuk posisi podium
              let order: number | undefined;
              if (arr.length === 1) {
                // Kasus satu data
                order = 2; // tengah
              } else if (arr.length === 2) {
                // Kasus dua data
                if (allSameRank) {
                  // Data sama, di kiri & kanan
                  order = idx === 0 ? 1 : 3;
                } else {
                  // #1 di kiri, #2 di kanan
                  order = item.rank === 1 ? 1 : 3;
                }
              } else if (arr.length === 3) {
                // Kasus tiga data
                if (allSameRank) {
                  // 3 data #1
                  order = idx + 1; // urut default kiri-tengah-kanan
                } else {
                  const rank1Count = arr.filter(el => el.rank === 1).length;
                  if (rank1Count === 1) {
                    // 1 data #1 di tengah
                    if (item.rank === 1) {
                      order = 2;
                    } else {
                      // 2 data #2: satu di kiri (1) dan satu di kanan (3)
                      const rank2Items = arr.filter(el => el.rank === 2);
                      const thisIndexInRank2 = rank2Items.indexOf(item);
                      order = thisIndexInRank2 === 0 ? 1 : 3;
                    }
                  } else if (rank1Count === 2) {
                    // 2 data #1 di kiri & tengah
                    if (item.rank === 1) {
                      order = arr.indexOf(item) === 0 ? 1 : 2;
                    } else {
                      order = 3; // 1 data #2 di kanan
                    }
                  } else {
                    // Rank 1, 2, 3 berbeda semua
                    order =
                      item.rank === 1
                        ? 2 // tengah
                        : item.rank === 2
                        ? 1 // kiri
                        : 3 // kanan
                  }
                }
              }

              const bgColor =
                item.rank === 1 ? "#244E3B" :
                item.rank === 2 ? "#347357" : "#568A73";

              return (
                <Flex
                  key={item.name}
                  direction="column"
                  align="center"
                  {...(order ? { order } : {})}
                  mx={arr.length === 1 ? 4 : 2}
                >
                  <Text fontWeight="semibold" mb={2} textAlign="center" fontSize="15">
                    {item.name}
                  </Text>
                  <Box {...cardStyle(item.rank)} height={height} bg={bgColor}>
                    <Text {...rankText}>
                      <Box as="span" fontSize="25" fontWeight="bold">
                        {item.rank}
                      </Box>
                      <Box as="span" fontSize="15" fontWeight="bold">
                        {item.label.slice(-2)}
                      </Box>
                    </Text>
                  </Box>
                </Flex>
              );
            })}
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export default TopVillages;