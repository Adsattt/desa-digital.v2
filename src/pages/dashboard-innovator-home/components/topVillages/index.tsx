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
        let desaDocs: { namaDesa?: string }[] = [];

        for (const chunk of chunks) {
          const desaQuery = query(
            collection(db, "claimInnovations"),
            where("inovasiId", "in", chunk)
          );
          const snapshot = await getDocs(desaQuery);
          desaDocs.push(...snapshot.docs.map((doc) => doc.data()));
        }

        const countMap: Record<string, number> = {};
        desaDocs.forEach((item) => {
          const namaDesa = item.namaDesa;
          if (namaDesa) {
            countMap[namaDesa] = (countMap[namaDesa] || 0) + 1;
          }
        });

        const sorted = Object.entries(countMap)
          .sort((a, b) => {
            if (b[1] === a[1]) return a[0].localeCompare(b[0]);
            return b[1] - a[1];
          })
          .slice(0, 3)
          .map(([name, count]) => ({ name, count }));

        if (sorted.length === 0) {
          setTopVillages([]);
          setLoading(false);
          return;
        }

        // Detect if all counts are the same
        const allSameCount = sorted.every((item) => item.count === sorted[0].count);

        let ranked: TopItem[];

        if (allSameCount) {
          ranked = sorted.map((item) => ({
            ...item,
            rank: 1,
            label: "1st",
          }));
        } else {
          // Assign equal ranks where applicable
          let currentRank = 1;
          let lastCount: number | null = null;
          let sameRankCount = 0;

          ranked = sorted.map((item, index) => {
            if (lastCount === null || item.count !== lastCount) {
              currentRank += sameRankCount;
              sameRankCount = 1;
            } else {
              sameRankCount++;
            }

            lastCount = item.count;

            return {
              ...item,
              rank: currentRank,
              label: `${currentRank}${["st", "nd", "rd"][currentRank - 1] || "th"}`,
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
            justify={
              topVillages.length === 1
                ? "center"
                : topVillages.length === 2
                ? "space-around"
                : "center"
            }
          >
            {topVillages.map((item, _, arr) => {
              const allSameRank = arr.every((el) => el.rank === 1);

              const height = allSameRank
                ? "100px"
                : item.rank === 1
                ? "120px"
                : item.rank === 2
                ? "100px"
                : "80px";

              // Terapkan order hanya jika ada 3 item
              const order =
                arr.length === 3
                  ? item.rank === 1
                    ? 2
                    : item.rank === 2
                    ? 1
                    : 3
                  : undefined;

              const bgColor =
                item.rank === 1
                  ? "#244E3B"
                  : item.rank === 2
                  ? "#347357"
                  : "#568A73";

              return (
                <Flex
                  key={item.name}
                  direction="column"
                  align="center"
                  {...(order ? { order } : {})}
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