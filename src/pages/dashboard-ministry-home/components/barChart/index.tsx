import {
  Box,
  Text,
  Flex,
  Image,
  Spinner,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import YearRangeFilter from "./dateFilter";
import filterIcon from "../../../../assets/icons/icon-filter.svg";
import downloadIcon from "../../../../assets/icons/icon-download.svg";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  yAxisLabelStyle,
  yAxisWrapperStyle,
  chartBarContainerStyle,
  barAndLineWrapperStyle,
  xAxisStyle,
  yAxisStyle,
} from "./_barChartStyle";

const getYAxisLabels = (max: number, step: number): number[] => {
  const roundedMax = Math.ceil(max / step) * step;
  const labels: number[] = [];
  for (let i = roundedMax; i >= 0; i -= step) {
    labels.push(i);
  }
  return labels;
};

const BarChartInovasi = () => {
  const db = getFirestore();
  const [showFilter, setShowFilter] = useState(false);
  const [yearRange, setYearRange] = useState<[number, number]>([2015, 2025]);
  const [dataByYear, setDataByYear] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [detailedData, setDetailedData] = useState<
    { namaDesa: string; namaInovasi: string; namaInovator: string; year: number }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const profilDesaSnap = await getDocs(collection(db, "villages"));
        const menerapkanSnap = await getDocs(collection(db, "claimInnovations"));
        const inovasiSnap = await getDocs(collection(db, "innovations"));

        const menerapkanData = menerapkanSnap.docs.map((doc) => doc.data());
        const inovasiData = inovasiSnap.docs.map((doc) => doc.data());

        const counts: Record<number, number> = {};
        const detailed: {
          namaDesa: string;
          namaInovasi: string;
          namaInovator: string;
          year: number;
        }[] = [];

        profilDesaSnap.forEach((desaDoc) => {
          const desaData = desaDoc.data();
          const namaDesa = desaData.namaDesa;
          const year = Number(desaData.tahunData);

          if (!isNaN(year) && year >= yearRange[0] && year <= yearRange[1]) {
            // Count per year
            counts[year] = (counts[year] || 0) + 1;

            const foundMenerapkan = menerapkanData.find((m) => m.namaDesa === namaDesa);
            const namaInovasi = foundMenerapkan?.namaInovasi || "-";

            const foundInovasi = inovasiData.find((i) => i.namaInovasi === namaInovasi);
            const namaInovator = foundInovasi?.namaInovator || "-";

            detailed.push({
              namaDesa,
              namaInovasi,
              namaInovator,
              year,
            });
          }
        });

        setDataByYear(counts);
        setDetailedData(detailed);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }

      setLoading(false);
    };

    fetchData();
  }, [yearRange]);

  const maxValue = Math.max(...Object.values(dataByYear), 10);
  const rotateLabels = Object.keys(dataByYear).length > 8;

  const exportToExcel = (data: any[]) => {
    const wsData = [
      ["Nama Desa", "Nama Inovasi", "Nama Inovator", "Tahun"],
      ...data.map((item) => [item.namaDesa, item.namaInovasi, item.namaInovator, item.year]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Perkembangan Desa Digital");
    XLSX.writeFile(workbook, "data-perkembangan-desa-digital.xlsx");
  };

  const exportToPDF = (data: any[]) => {
      const doc = new jsPDF;
      const downloadDate = new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
      });

      // Green header background
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

      // Reset text styles for table content
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");

      // Add section title
      let y = 42;
      const labelX = 14;
      doc.setFont("helvetica", "bold");
      doc.text(`Data Perkembangan Desa Digital`, labelX, y);
      y += 6;

      // Sort data by year
      const sortedData = [...data].sort((a, b) => a.year - b.year);

      // @ts-ignore
      autoTable(doc, {
        startY: y,
        head: [[
          "No",
          "Nama Desa",
          "Nama Inovasi",
          "Nama Inovator",
          "Tahun Pendataan",
        ]],
        body: sortedData.map((item, index) => [
          index + 1,
          item.namaDesa,
          item.namaInovasi,
          item.namaInovator,
          item.year,
        ]),
        headStyles: {
          fillColor: [0, 128, 0],
          textColor: 255,
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 40 },
          2: { cellWidth: 40 },
          3: { cellWidth: 40 },
        },
        styles: {
          fontSize: 12,
        },
      } as any);

      doc.save("data-perkembangan-desa-digital.pdf");
  };

  return (
    <Box p={4} maxW="100%" mx="auto">
      <Flex justify="space-between" align="center" mb={2}>
        <Text {...titleStyle}>Perkembangan Desa Digital</Text>
        <Flex align="center" gap={2}>
          <Image
            onClick={() => setShowFilter(true)}
            src={filterIcon}
            alt="Filter"
            boxSize="16px"
            cursor="pointer"
            ml={2}
          />

          <Menu>
            <MenuButton as={Box} cursor="pointer" marginRight={2} _hover={{ opacity: 0.8 }}>
              <Image src={downloadIcon} alt="Download" boxSize="16px" />
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => exportToPDF(detailedData)}>Download PDF</MenuItem>
              <MenuItem onClick={() => exportToExcel(detailedData)}>Download Excel</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      <Box {...chartContainerStyle}>
        <Flex {...legendContainerStyle}>
          <Flex {...legendItemStyle}>
            <Box {...legendDotStyle} bg="#4C73C7" />
            <Text>Jumlah Pertumbuhan Desa</Text>
          </Flex>
        </Flex>

        <Box {...chartWrapperStyle}>
          <Flex {...yAxisWrapperStyle}>
            {getYAxisLabels(maxValue, 10).map((label) => (
              <Text key={label} {...yAxisLabelStyle}>
                {label === 0 ? "" : label}
              </Text>
            ))}
          </Flex>

          <Flex {...chartBarContainerStyle}>
            <Box {...yAxisStyle} />
            <Flex {...barAndLineWrapperStyle}>
              {loading ? (
                <Spinner mt={10} />
              ) : (
                Object.keys(dataByYear)
                  .sort((a, b) => Number(a) - Number(b))
                  .map((year) => (
                    <Box key={year} {...barGroupStyle}>
                      <Tooltip
                        label={`Tahun ${year}: ${dataByYear[Number(year)]} desa`}
                        hasArrow
                        placement="top"
                        bg="gray.700"
                        color="white"
                        fontSize="sm"
                      >
                        <Box
                          {...barStyle}
                          height={`${(dataByYear[Number(year)] / maxValue) * 100}%`}
                          bg="#4C73C7"
                          _hover={{ opacity: 0.8 }}
                          transition="all 0.2s"
                        />
                      </Tooltip>
                      <Text
                        {...labelStyle}
                        sx={
                          rotateLabels
                            ? { transform: "rotate(-45deg)", transformOrigin: "left bottom" }
                            : {}
                        }
                        whiteSpace="nowrap"
                      >
                        {year}
                      </Text>
                    </Box>
                  ))
              )}
              <Box {...xAxisStyle} />
            </Flex>
          </Flex>
        </Box>
      </Box>

      <YearRangeFilter
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={(from, to) => setYearRange([from, to])}
      />
    </Box>
  );
};

export default BarChartInovasi;