import { Box, Flex, Grid, Text, Stack, Image } from "@chakra-ui/react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";

import ProvinceIcon from "Assets/icons/province.svg";
import RegencyIcon from "Assets/icons/regency.svg";
import SubdistrictIcon from "Assets/icons/subdistrict.svg";
import VillageIcon from "Assets/icons/village-active.svg";

const ScoreCardDashboardDesa: React.FC = () => {
  const [totalVillage, setTotalVillage] = useState(0);
  const [totalProvince, setTotalProvince] = useState(0);
  const [totalKabupaten, setTotalKabupaten] = useState(0);
  const [totalKecamatan, setTotalKecamatan] = useState(0);

  const fetchData = async () => {
    try {
      const db = getFirestore();
      const villagesRef = collection(db, "villages");
      const snapshot = await getDocs(villagesRef);

      const villageSet = new Set();
      const provinceSet = new Set();
      const kabupatenSet = new Set();
      const kecamatanSet = new Set();

      snapshot.docs.forEach((doc) => {
        const data = doc.data();

        if (typeof data.namaDesa === "string" && data.namaDesa.length > 1) {
          villageSet.add(data.namaDesa);
        } else if (
          data.namaDesa?.label &&
          typeof data.namaDesa.label === "string" &&
          data.namaDesa.label.length > 1
        ) {
          villageSet.add(data.namaDesa.label);
        }

        if (data.lokasi) {
          if (data.lokasi.provinsi?.label)
            provinceSet.add(data.lokasi.provinsi.label);
          if (data.lokasi.kabupatenKota?.label)
            kabupatenSet.add(data.lokasi.kabupatenKota.label);
          if (data.lokasi.kecamatan?.label)
            kecamatanSet.add(data.lokasi.kecamatan.label);
        }
      });

      setTotalVillage(villageSet.size);
      setTotalProvince(provinceSet.size);
      setTotalKabupaten(kabupatenSet.size);
      setTotalKecamatan(kecamatanSet.size);
    } catch (error) {
      console.error("Error fetching village data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = [
    {
      label: "Provinsi",
      value: totalProvince,
      icon: ProvinceIcon,
      iconBg: "#F0FFF4",
    },
    {
      label: "Kabupaten",
      value: totalKabupaten,
      icon: RegencyIcon,
      iconBg: "#F0FFF4",
    },
    {
      label: "Kecamatan",
      value: totalKecamatan,
      icon: SubdistrictIcon,
      iconBg: "#F0FFF4",
    },
    {
      label: "Desa Digital",
      value: totalVillage,
      icon: VillageIcon,
      iconBg: "#F0FFF4",
    },
  ];

  return (
    <Stack>
      <Box p={4}>
        <Grid templateColumns="repeat(2, 1fr)" gap={3}>
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
              alignItems="center" // memastikan konten di tengah secara vertikal
            >
              <Flex align="center">
                <Box
                  bg={stat.iconBg}
                  borderRadius="full"
                  p={2}
                  w="35px"
                  h="35px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                  mr={3}
                >
                  <Image src={stat.icon} w={4} h={4} alt={`${stat.label} icon`} />
                </Box>
                <Box overflow="hidden">
                  <Text
                    fontSize="25"
                    fontWeight="bold"
                    color="green.700"
                    lineHeight="1"
                  >
                    {stat.value}
                  </Text>
                  <Text
                    fontSize="14"
                    color="gray.600"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
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

export default ScoreCardDashboardDesa;
