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
  MenuItem,
  IconButton,
  Tooltip,
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
  barAndLineWrapperStyle,
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
  const [desaDetails, setDesaDetails] = useState<any[]>([]);
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

      const desaData: any[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const yearRaw = data.tahunData?.toString()?.trim();
        const category = data.kategoriDesa;

        if (!yearRaw || yearRaw === "-" || yearRaw.toUpperCase() === "ND") return;
        const yearNum = parseInt(yearRaw);
        if (isNaN(yearNum) || yearNum > selectedYear) return;
        if (!categories.includes(category)) return;

        categoryCounts[category]++;
        desaData.push(data); // Save full data for export
      });

      const formattedData = categories.map((category, index) => ({
        category,
        value: categoryCounts[category],
        color: colors[index],
      }));

      formattedData.sort((a, b) => b.value - a.value);
      const values = formattedData.map((d) => d.value);
      const max = Math.max(...values, 10);
      setMaxValue(Math.ceil(max / 10) * 10);
      setBarData(formattedData);
      setDesaDetails(desaData); // Save for export
    }

    fetchData();
  }, [selectedYear]);

  const handleFilterApply = (year: number) => {
    setSelectedYear(year);
  };

  const isEmpty = barData.every((data) => data.value === 0);

  const exportToXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      barData.map(({ category, value }) => ({ category, value }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Data_${selectedYear}`);
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `perkembangan_desa_${selectedYear}.xlsx`);
  };

  const exportToPDF = (data: any[], selectedYear: number) => {
    const doc = new jsPDF();
    const downloadDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    doc.setFillColor(0, 128, 0);
    doc.rect(0, 0, 1000, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Dokumen Laporan Kementerian", 14, 13);
    doc.text("KMS Inovasi Desa Digital", 190, 13, { align: "right" });

    doc.setFontSize(12);
    doc.text("Diambil dari: Grafik Perkembangan Desa Digital", 14, 22);
    doc.text(`Diunduh pada: ${downloadDate}`, 190, 22, { align: "right" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");

    let y = 42;
    const labelX = 14;

    const grouped: Record<string, any[]> = data.reduce((acc, curr) => {
      const key = curr.kategoriDesa || "Tidak Diketahui";
      if (!acc[key]) acc[key] = [];
      acc[key].push(curr);
      return acc;
    }, {});

    for (const [kategori, entries] of Object.entries(grouped)) {
      const sortedEntries = entries.sort((a, b) => a.tahunData - b.tahunData);
      doc.setFont("helvetica", "bold");
      doc.text(`Data Perkembangan Desa Digital Tahun ${selectedYear} Kategori: ${kategori}`, labelX, y);
      y += 6;

      autoTable(doc, {
        startY: y,
        head: [
          ["No", "Nama Desa", "Kecamatan", "Kabupaten", "Provinsi", "IDM", "Tahun Data"],
        ],
        body: sortedEntries.map((item, i) => [
          i + 1,
          item.namaDesa,
          item.kecamatan,
          item.kabupaten,
          item.provinsi,
          item.idm,
          item.tahunData,
        ]),
        headStyles: {
          fillColor: [0, 128, 0],
          textColor: 255,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 10,
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 35 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 },
        },
        margin: { top: 10 },
      } as any);

      y = (doc as any).lastAutoTable.finalY + 15;
    }

    doc.save(`perkembangan_desa_detail_${selectedYear}.pdf`);
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center">
        <Text {...titleStyle}>Perkembangan Desa Digital - Tahun {selectedYear}</Text>
        <Flex justify="flex-end" align="center">
          <Image src={filterIcon} alt="Filter" boxSize="16px" cursor="pointer" ml={2} onClick={onOpen} />
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Download Options"
              icon={<Image src={downloadIcon} alt="Download" boxSize="16px" />}
              variant="ghost"
              ml={2}
            />
            <MenuList fontSize="sm">
              <MenuItem onClick={() => exportToPDF(desaDetails, selectedYear)}>
                Download PDF
              </MenuItem>
              <MenuItem onClick={exportToXLSX}>Download Excel</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      <Box {...chartContainerStyle}>
        <Flex {...legendContainerStyle}>
          {barData.map((d, idx) => (
            <Flex key={d.category} {...legendItemStyle}>
              <Box {...legendDotStyle} bg={d.color} />
              <Text>{d.category}</Text>
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
                    <Tooltip label={`${data.category}: ${data.value} desa`} hasArrow placement="top">
                      <Box
                        {...barStyle}
                        height={`${(data.value / maxValue) * 100}%`}
                        bg={data.color}
                        width="24px"
                      />
                    </Tooltip>
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