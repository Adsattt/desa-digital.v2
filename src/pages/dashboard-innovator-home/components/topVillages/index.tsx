import { useEffect, useState } from "react";
import { Box, Text, Flex, Link, Spinner } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { paths } from "Consts/path";
import {
  podiumWrapperStyle,
  cardStyle,
  rankText,
  titleText,
  linkText,
  podiumContainerStyle,
} from "./_topVillagesStyle";

// Optional type for better clarity
type TopItem = {
  name: string;
  count: number;
  rank: number;
  label: string;
};

const TopVillages = () => {
  const [topVillages, setTopVillages] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopVillages = async () => {
      setLoading(true);
      const db = getFirestore();
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setTopVillages([]);
        setLoading(false);
        return;
      }

      try {
        // Get profilInovator for current user
        const profilQuery = query(
          collection(db, "innovators"),
          where("id", "==", currentUser.uid)
        );
        const profilSnapshot = await getDocs(profilQuery);

        if (profilSnapshot.empty) {
          setTopVillages([]);
          setLoading(false);
          return;
        }

        const profilDoc = profilSnapshot.docs[0];
        const inovatorId = profilDoc.id;

        // Get inovasi where inovatorId matches
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

        // Chunk inovasiIds into groups of 10
        const chunkArray = <T,>(arr: T[], size: number): T[][] => {
          const chunks: T[][] = [];
          for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
          }
          return chunks;
        };

        const chunks = chunkArray(inovasiIds, 10);
        let menerapkanDocs: { namaDesa?: string }[] = [];

        for (const chunk of chunks) {
          const menerapkanQuery = query(
            collection(db, "claimInnovations"),
            where("inovasiId", "in", chunk)
          );
          const snapshot = await getDocs(menerapkanQuery);
          menerapkanDocs.push(...snapshot.docs.map((doc) => doc.data()));
        }

        // Count namaDesa occurrences
        const countMap: Record<string, number> = {};
        menerapkanDocs.forEach((item) => {
          const namaDesa = item.namaDesa;
          if (namaDesa) {
            countMap[namaDesa] = (countMap[namaDesa] || 0) + 1;
          }
        });

        // Sort and get top 3
        const sortedByFrequency = Object.entries(countMap)
          .sort((a, b) => {
            if (b[1] === a[1]) {
              return a[0].localeCompare(b[0]); // Alphabetical ascending
            }
            return b[1] - a[1]; // Descending by count
          })
          .slice(0, 3)
          .map(([name, count], index) => ({
            name,
            count,
            rank: index + 1,
            label: `${index + 1}${["st", "nd", "rd"][index] || "th"}`,
          }));

        setTopVillages(sortedByFrequency);
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
        <Text {...titleText}>Desa Unggulan</Text>
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
          <Flex {...podiumWrapperStyle}>
            {topVillages.map((item) => {
              const height = item.rank === 1 ? "120px" : item.rank === 2 ? "100px" : "80px";
              const order = item.rank === 1 ? 2 : item.rank === 2 ? 1 : 3;

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
                  order={order}
                >
                  <Text fontWeight="semibold" mb={2} textAlign="center" fontSize="15">
                    {item.name}
                  </Text>
                  <Box
                    {...cardStyle(item.rank)}
                    height={height}
                    bg={bgColor}
                  >
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