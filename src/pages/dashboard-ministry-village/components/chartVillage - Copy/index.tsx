import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Flex,
  Image,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from "@chakra-ui/react";
import {
  chartContainerStyle,
  chartWrapperStyle,
  barGroupStyle,
  barStyle,
  labelStyle,
  legendContainerStyle,
  legendItemStyle,
  legendDotStyle,
  titleStyle,
  xAxisStyle,
  yAxisStyle,
  yAxisLabelStyle,
  yAxisWrapperStyle,
  chartBarContainerStyle,
  barAndLineWrapperStyle
} from "./_chartVillageStyle";

import filterIcon from "../../../../assets/icons/icon-filter.svg";
import downloadIcon from "../../../../assets/icons/icon-download.svg";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import YearFilter from "./dateFilter";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const categories = ["Maju", "Mandiri", "Berkembang", "Tertinggal", "Sangat Tertinggal"];
const colors = ["#568A73", "#88A0CA", "#4C73C7", "#215B59", "#ECC600"];

const ChartVillage = () => {
  const [barData, setBarData] = useState<any[]>([]);
  const [maxValue, setMaxValue] = useState(100);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedYear, setSelectedYear] = useState<number>(2020);

  useEffect(() => {
    async function fetchData() {
      const db = getFirestore();
      const snapshot = await getDocs(collection(db, "villages"));

      const categoryCounts: Record<string, number> = {
        Maju: 0,
        Mandiri: 0,
        Berkembang: 0,
        Tertinggal: 0,
        "Sangat Tertinggal": 0,
      };

      snapshot.forEach((doc) => {
        const data = doc.data();
        const yearRaw = data.tahunData?.toString()?.trim();
        const category = data.kategoriDesa;

        if (!yearRaw || yearRaw === "-" || yearRaw.toUpperCase() === "ND") return;
        const yearNum = parseInt(yearRaw);
        if (isNaN(yearNum) || yearNum !== selectedYear) return;
        if (!categories.includes(category)) return;

        categoryCounts[category]++;
      });

      const formattedData = categories.map((category) => ({
        category,
        value: categoryCounts[category],
      }));

      const values = Object.values(categoryCounts);
      const max = Math.max(...values, 10);
      setMaxValue(Math.ceil(max / 10) * 10);
      setBarData(formattedData);
    }

    fetchData();
  }, [selectedYear]);

  const handleFilterApply = (year: number) => {
    setSelectedYear(year);
  };

  const isEmpty = barData.every((data) => data.value === 0);

  const exportToXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(barData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Data_${selectedYear}`);
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `perkembangan_desa_${selectedYear}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Perkembangan Desa Digital - ${selectedYear}`, 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [["Kategori", "Jumlah"]],
      body: barData.map((d) => [d.category, d.value]),
    });
    doc.save(`perkembangan_desa_${selectedYear}.pdf`);
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={2}>
        <Text {...titleStyle}>Perkembangan Desa Digital</Text>
        <Flex justify="flex-end" align="center">
          <Image src={filterIcon} alt="Filter" boxSize="16px" cursor="pointer" ml={2} onClick={onOpen} />

          <Menu>
            <MenuButton>
              <Image src={downloadIcon} alt="Download" boxSize="16px" cursor="pointer" ml={2} />
            </MenuButton>
            <MenuList fontSize="sm">
              <MenuItem onClick={exportToPDF}>Download PDF</MenuItem>
              <MenuItem onClick={exportToXLSX}>Download Excel</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      <Box {...chartContainerStyle}>
        <Flex {...legendContainerStyle}>
          {categories.map((cat, idx) => (
            <Flex key={cat} {...legendItemStyle}>
              <Box {...legendDotStyle} bg={colors[idx]} />
              <Text>{cat}</Text>
            </Flex>
          ))}
        </Flex>

        {isEmpty ? (
          <Text textAlign="center" mt={10} fontWeight="medium">
            Belum ada data untuk tahun yang dipilih.
          </Text>
        ) : (
          <Box {...chartWrapperStyle}>
            <Flex {...yAxisWrapperStyle}>
              {[4, 3, 2, 1, 0].map((i) => {
                const label = Math.round((maxValue / 4) * i);
                return (
                  <Text key={i} {...yAxisLabelStyle}>
                    {label === 0 ? "" : label}
                  </Text>
                );
              })}
            </Flex>

            <Flex {...chartBarContainerStyle}>
              <Box {...yAxisStyle} />
              <Flex {...barAndLineWrapperStyle}>
                {barData.map((data, idx) => (
                  <Flex key={data.category} flexDir="column" align="center" justify="flex-end" {...barGroupStyle}>
                    <Box
                      {...barStyle}
                      height={`${(data.value / maxValue) * 100}%`}
                      bg={colors[idx]}
                      width="24px"
                    />
                    <Text {...labelStyle}>{data.category}</Text>
                  </Flex>
                ))}
                <Box {...xAxisStyle} />
              </Flex>
            </Flex>
          </Box>
        )}
      </Box>

      <YearFilter isOpen={isOpen} onClose={onClose} onApply={handleFilterApply} />
    </Box>
  );
};

export default ChartVillage;