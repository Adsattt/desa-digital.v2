import { Box, Flex, Grid, Text, Stack, Image } from "@chakra-ui/react";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";
import DesaIcon from "Assets/icons/village-active.svg"; // sesuaikan path

const ScoreCardDashboardInovator: React.FC = () => {
  const [totalInovators, setTotalInovators] = useState(0);
  const [totalDesaDampingan, setTotalDesaDampingan] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore();

        // ✅ 1. Ambil inovators dengan namaInovator tidak kosong
        const innovatorsRef = collection(db, "innovators");
        const innovatorsQuery = query(innovatorsRef, where("namaInovator", "!=", ""));
        const innovatorsSnap = await getDocs(innovatorsQuery);
        setTotalInovators(innovatorsSnap.size);

        // ✅ 2. Ambil desa dari villages dengan jumlahInovasi > 0
        const villagesRef = collection(db, "villages");
        const villagesSnap = await getDocs(villagesRef);

        let desaCount = 0;
        villagesSnap.forEach((doc) => {
          const data = doc.data();
          if (typeof data.jumlahInovasiDiterapkan === "number" && data.jumlahInovasiDiterapkan > 0) {
            desaCount++;
          }
        });
        setTotalDesaDampingan(desaCount);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      label: "Inovator",
      value: totalInovators,
      iconType: "react-icon",
      icon: FaUsers,
      iconBg: "#C6D8D0",
    },
    {
      label: "Desa Digital",
      value: totalDesaDampingan,
      iconType: "image",
      icon: DesaIcon,
      iconBg: "#C6D8D0",
    },
  ];

  return (
    <Stack>
      <Box p={4}>
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          {stats.map((stat, index) => (
            <Box
              key={index}
              p={3}
              borderRadius="lg"
              boxShadow="md"
              border="1px solid"
              borderColor="gray.200"
              bg="white"
              minW={0}
              overflow="hidden"
              minH="90px"
              display="flex"
              alignItems="center"
            >
              <Flex align="center">
                <Box
                  bg={stat.iconBg}
                  borderRadius="full"
                  p={1}
                  w="35px"
                  h="35px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                  mr={3}
                >
                  {stat.iconType === "react-icon" ? (
                    <stat.icon size={16} color="#357357" />
                  ) : (
                    <Image src={stat.icon} w={4} h={4} alt={`${stat.label} icon`} />
                  )}
                </Box>
                <Box>
                  <Text fontSize="20px" fontWeight="bold" color="green.700" lineHeight="1">
                    {stat.value}
                  </Text>
                  <Text fontSize="12px" color="gray.600">
                    {stat.label}
                  </Text>
                </Box>
              </Flex>
            </Box>
          ))}
        </Grid>
      </Box>
    </Stack>
  );
};

export default ScoreCardDashboardInovator;