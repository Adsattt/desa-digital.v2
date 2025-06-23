import { Box, Flex, Grid, Text, Stack, Image } from "@chakra-ui/react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import InnovationActive from "Assets/icons/innovation3.svg";
import { FaUsers } from "react-icons/fa";

const ScoreCardDashboardInnovations: React.FC = () => {
  const [totalInnovations, setTotalInnovations] = useState(0);
  const [totalInovators, setTotalInovators] = useState(0);

  const fetchData = async () => {
    try {
      const db = getFirestore();

      // Fetch innovations
      const innovationsRef = collection(db, "innovations");
      const innovationsSnapshot = await getDocs(innovationsRef);
      setTotalInnovations(innovationsSnapshot.size);

      // Fetch innovators
      const innovatorsRef = collection(db, "innovators");
      const innovatorsSnapshot = await getDocs(innovatorsRef);
      let inovatorCount = 0;

      innovatorsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.namaInovator) {
          inovatorCount++;
        }
      });

      setTotalInovators(inovatorCount);
    } catch (error) {
      console.error("❌ Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = [
    {
      label: "Inovasi",
      value: totalInnovations,
      iconType: "image",
      icon: InnovationActive,
      iconBg: "#C6D8D0",
    },
    {
      label: "Inovator",
      value: totalInovators,
      iconType: "react-icon",
      icon: FaUsers,
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

export default ScoreCardDashboardInnovations;
