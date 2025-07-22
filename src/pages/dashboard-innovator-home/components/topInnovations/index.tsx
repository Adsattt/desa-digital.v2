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
} from "./_topInnovationsStyle";

const TopInnovations = () => {
  const [topInnovations, setTopInnovations] = useState<
    { name: string; count: number; rank: number; label: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopInnovations = async () => {
      setLoading(true);
      const db = getFirestore();
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) return console.warn("User not authenticated");

      try {
        const profilQuery = query(
          collection(db, "innovators"),
          where("id", "==", currentUser.uid)
        );
        const profilSnapshot = await getDocs(profilQuery);

        if (profilSnapshot.empty) {
          console.warn("Inovator tidak ditemukan");
          setTopInnovations([]);
          setLoading(false);
          return;
        }

        const profilDoc = profilSnapshot.docs[0];
        const inovatorId = profilDoc.id;

        const inovasiQuery = query(
          collection(db, "innovations"),
          where("innovatorId", "==", inovatorId)
        );
        const inovasiSnapshot = await getDocs(inovasiQuery);

        const inovasiData = inovasiSnapshot.docs.map((doc) => doc.data());

        const countInovasi = inovasiData
          .filter((item) => item.namaInovasi && typeof item.jumlahKlaim === "number")
          .map((item) => ({
            name: item.namaInovasi,
            count: item.jumlahKlaim,
          }));

        const sortedByFrequency = countInovasi
          .sort((a, b) => {
            if (b.count === a.count) {
              return a.name.localeCompare(b.name);
            }
            return b.count - a.count;
          })
          .slice(0, 3)
          .map((item, index) => ({
            ...item,
            rank: index + 1,
            label: `${index + 1}${["st", "nd", "rd"][index] || "th"}`,
          }));

          console.log("Inovator ID:", inovatorId);
          console.log("Inovasi Data:", inovasiSnapshot);
          console.log("Inovasi Data:", inovasiData);

        setTopInnovations(sortedByFrequency);
      } catch (error) {
        console.error("Error fetching innovations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopInnovations();
  }, []);

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb="10px">
        <Text {...titleText}>Inovasi Unggulan</Text>
        <Link as={NavLink} to={paths.DASHBOARD_INNOVATOR_INNOVATION} {...linkText}>
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
            {topInnovations.map((item) => {
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

export default TopInnovations;
