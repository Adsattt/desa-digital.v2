import {
  Box,
  Flex,
  Text,
  Button,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerCloseButton,
  Checkbox,
  SimpleGrid,
} from "@chakra-ui/react";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Filter } from "lucide-react";
import * as XLSX from "xlsx";
import { DownloadIcon } from "@chakra-ui/icons";

const PerkembanganInovasiDesa: React.FC = () => {
  const [barData, setBarData] = useState<{ name: string; value: number }[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [allYears, setAllYears] = useState<string[]>([]);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchInovasiData = async () => {
    try {
      const db = getFirestore();
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("User belum login");
        return;
      }

      // 1. Ambil namaDesa berdasarkan userId
      const desaQuery = query(
        collection(db, "villages"),
        where("userId", "==", user.uid)
      );
      const desaSnap = await getDocs(desaQuery);

      let namaDesa = "";
      if (!desaSnap.empty) {
        const desaData = desaSnap.docs[0].data();
        namaDesa = desaData?.namaDesa || "";
      } else {
        console.warn("Desa tidak ditemukan untuk user ini");
        return;
      }

      // 2. Ambil semua inovasi
      const innovationsRef = collection(db, "innovations");
      const snapshot = await getDocs(innovationsRef);

      const yearCount: Record<string, number> = {};

      // 3. Filter inovasi berdasarkan inputDesaMenerapkan
      snapshot.forEach((doc) => {
        const data = doc.data();
        const inputDesaMenerapkan = data.inputDesaMenerapkan;

        const cocok = Array.isArray(inputDesaMenerapkan) &&
          inputDesaMenerapkan.some((nama: string) =>
            nama?.toLowerCase().trim() === namaDesa.toLowerCase().trim()
          );

        if (cocok && data.createdAt) {
          const year = new Date(data.createdAt.toDate()).getFullYear().toString();
          yearCount[year] = (yearCount[year] || 0) + 1;
        }
      });

      const allYearsList = Object.keys(yearCount).sort();
      setAllYears(allYearsList);

      const filteredYears = selectedYears.length > 0 ? selectedYears : allYearsList;

      const chartData = filteredYears.map((year) => ({
        name: year,
        value: yearCount[year] || 0,
      }));

      setBarData(chartData);
    } catch (error) {
      console.error("Error fetching innovation data:", error);
    }
  };

  useEffect(() => {
    fetchInovasiData();
  }, [selectedYears]);

  const handleCheckboxChange = (year: string) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const applyFilter = () => {
    onClose();
  };

  const handleDownload = () => {
    const excelData = barData.map((item, index) => ({
      No: index + 1,
      Tahun: item.name,
      "Jumlah Inovasi": item.value,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Perkembangan Inovasi");

    XLSX.writeFile(workbook, "perkembangan_inovasi_desa.xlsx");
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mt="24px" mx="15px">
        <Text fontSize="sm" fontWeight="bold" color="gray.800">
          Perkembangan Inovasi Desa
        </Text>
        <Flex gap={2}>
          {/* <Button
            size="sm"
            bg="white"
            boxShadow="md"
            border="2px solid"
            borderColor="gray.200"
            px={2}
            py={2}
            display="flex"
            alignItems="center"
            gap={2}
            _hover={{ bg: "gray.100" }}
            cursor="pointer"
            onClick={handleDownload}
          >
            <DownloadIcon boxSize={3} color="gray.700" />
          </Button> */}
          <Button
            size="sm"
            bg="white"
            boxShadow="md"
            border="2px solid"
            borderColor="gray.200"
            px={2}
            py={2}
            display="flex"
            alignItems="center"
            _hover={{ bg: "gray.100" }}
            cursor="pointer"
            leftIcon={<Filter size={12} stroke="#1E5631" fill="#1E5631" />}
            onClick={onOpen}
          >
            <Text fontSize="10px" fontWeight="medium" color="black" mr={1}>
              Tahun
            </Text>
          </Button>
        </Flex>
      </Flex>

      <Box
        bg="white"
        borderRadius="xl"
        pt="5px"
        pb="1px"
        mx="15px"
        boxShadow="md"
        border="2px solid"
        borderColor="gray.200"
        mt={4}
        overflow="visible"
      >
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={barData}
            margin={{ top: 20, right: 40, left: 1, bottom: 15 }}
            barSize={25}
          >
            <XAxis
              label={{
                value: "Tahun",
                position: "insideBottom",
                fontSize: 10,
                dx: 3,
                dy: 5,
              }}
              dataKey="name"
              tick={{ fontSize: 8 }}
              angle={0}
              textAnchor="middle"
              interval={0}
            />
            <YAxis
              label={{
                value: "Jumlah Inovasi",
                angle: -90,
                position: "insideLeft",
                fontSize: 10,
                dx: 15,
                dy: 40,
              }}
              tick={{ fontSize: 10 }}
            />
            <Tooltip />
            <Bar dataKey="value" fill="#1E5631" radius={[0, 0, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent
          sx={{
            borderTopRadius: "lg",
            width: "360px",
            my: "auto",
            mx: "auto",
          }}
        >
          <DrawerHeader>
            <Flex justify="space-between" align="center">
              <Text fontWeight="bold">Filter Tahun</Text>
              <DrawerCloseButton />
            </Flex>
          </DrawerHeader>
          <DrawerBody>
            <SimpleGrid columns={2} spacing={2}>
              {allYears.map((year) => (
                <Checkbox
                  key={year}
                  isChecked={selectedYears.includes(year)}
                  onChange={() => handleCheckboxChange(year)}
                >
                  {year}
                </Checkbox>
              ))}
            </SimpleGrid>
          </DrawerBody>
          <DrawerFooter>
            <Button
              bg="#1E5631"
              color="white"
              width="100%"
              _hover={{ bg: "#16432D" }}
              onClick={applyFilter}
            >
              Terapkan Filter
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default PerkembanganInovasiDesa;
