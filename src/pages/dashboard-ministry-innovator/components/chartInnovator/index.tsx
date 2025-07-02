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
  IconButton,
} from "@chakra-ui/react";

import { useEffect, useState, useRef } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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
} from "./_chartInnovatorStyle";

import downloadIcon from "../../../../assets/icons/icon-download.svg";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const db = getFirestore();

type BarValue = {
  id: number;
  value: number;
  color: string;
};

type ChartGroup = {
  category: string;
  values: BarValue[];
};

const truncateLabel = (label: string, maxLength = 3): string =>
  label.length > maxLength ? label.slice(0, maxLength) + "..." : label;

const exportToPDF = async (selectedYear: number) => {
  const snapshot = await getDocs(collection(db, "profilInovator"));
  const allData = snapshot.docs.map((doc) => doc.data());

  const doc = new jsPDF({ orientation: "landscape" });
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
  doc.text("KMS Inovasi Desa Digital", 280, 13, { align: "right" });

  doc.setFontSize(12);
  doc.text("Diambil dari: Grafik Jumlah Inovator per Kategori", 14, 22);
  doc.text(`Diunduh pada: ${downloadDate}`, 280, 22, { align: "right" });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");

  let y = 42;
  const labelX = 14;

  const grouped = allData.reduce((acc: Record<string, any[]>, item) => {
    const kategori = item.kategoriInovator || "Tidak Diketahui";
    if (!acc[kategori]) acc[kategori] = [];
    acc[kategori].push(item);
    return acc;
  }, {});

  for (const [kategori, entries] of Object.entries(grouped)) {
    doc.text(`Data Inovator Tahun ${selectedYear}, Kategori: ${kategori}`, labelX, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [
        [
          "No",
          "Nama Inovator",
          "Kategori Inovator",
          "Jumlah Inovasi",
          "Jumlah Desa Dampingan",
          "Target Pengguna",
          "Model Bisnis",
        ],
      ],
      body: entries.map((item, i) => [
        i + 1,
        item.namaInovator || "-",
        item.kategoriInovator || "-",
        item.jumlahInovasi ?? 0,
        item.jumlahDesaDampingan ?? 0,
        item.targetPengguna || "-",
        item.modelBisnis || "-",
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
        1: { cellWidth: 45 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 },
        5: { cellWidth: 50 },
        6: { cellWidth: 80 },
      },
      margin: { top: 10 },
    } as any);

    y = (doc as any).lastAutoTable.finalY + 15;
  }

  doc.save(`inovator_per_kategori_${selectedYear}.pdf`);
};

const exportToExcel = async (selectedYear: number) => {
  const snapshot = await getDocs(collection(db, "profilInovator"));
  const allData = snapshot.docs.map((doc) => doc.data());

  const grouped = allData.reduce((acc: Record<string, any[]>, item) => {
    const kategori = item.kategoriInovator || "Tidak Diketahui";
    if (!acc[kategori]) acc[kategori] = [];
    acc[kategori].push(item);
    return acc;
  }, {});

  const worksheetData: any[] = [];

  for (const [kategori, entries] of Object.entries(grouped)) {
    worksheetData.push({ Kategori: `Data Inovator Tahun ${selectedYear}, Kategori: ${kategori}` });
    worksheetData.push({
      No: "No",
      NamaInovator: "Nama Inovator",
      KategoriInovator: "Kategori Inovator",
      JumlahInovasi: "Jumlah Inovasi",
      JumlahDesaDampingan: "Jumlah Desa Dampingan",
      TargetPengguna: "Target Pengguna",
      ModelBisnis: "Model Bisnis",
    });

    entries.forEach((item, i) => {
      worksheetData.push({
        No: i + 1,
        NamaInovator: item.namaInovator || "-",
        KategoriInovator: item.kategoriInovator || "-",
        JumlahInovasi: item.jumlahInovasi ?? 0,
        JumlahDesaDampingan: item.jumlahDesaDampingan ?? 0,
        TargetPengguna: item.targetPengguna || "-",
        ModelBisnis: item.modelBisnis || "-",
      });
    });

    worksheetData.push({});
  }

  const worksheet = XLSX.utils.json_to_sheet(worksheetData, { skipHeader: true });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inovator");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

  saveAs(blob, `inovator_per_kategori_${selectedYear}.xlsx`);
};

const ChartInnovator = () => {
  const [chartData, setChartData] = useState<ChartGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxValue, setMaxValue] = useState(10);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const chartBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "profilInovator"));

      const categoryMap: Record<string, { count: number }> = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.kategoriInovator) return;

        const kategori = data.kategoriInovator;
        if (!categoryMap[kategori]) {
          categoryMap[kategori] = { count: 0 };
        }
        categoryMap[kategori].count += 1;
      });

      const formattedData: ChartGroup[] = Object.entries(categoryMap)
        .map(([category, { count }]) => ({
          category,
          values: [{ id: 1, value: count, color: "#568A73" }],
        }))
        .sort((a, b) => b.values[0].value - a.values[0].value);

      const maxCount = Math.max(...formattedData.map((g) => g.values[0].value), 10);

      setChartData(formattedData);
      setMaxValue(maxCount);
      setLoading(false);
    };

    fetchData();
  }, []);

  const isEmpty = chartData.length === 0 || chartData.every((group) => group.values[0].value === 0);

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={2}>
        <Text {...titleStyle}>Perkembangan Inovator</Text>
        <Flex justify="flex-end" align="center">
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Download Options"
              icon={<Image src={downloadIcon} alt="Download" boxSize="16px" />}
              variant="ghost"
              ml={2}
            />
            <MenuList fontSize="sm">
              <MenuItem onClick={() => exportToPDF(selectedYear)}>Download PDF</MenuItem>
              <MenuItem onClick={() => exportToExcel(selectedYear)}>Download Excel</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      {loading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="lg" />
        </Flex>
      ) : (
        <Box {...chartContainerStyle}>
          <Flex {...legendContainerStyle} mb={2}>
            <Flex {...legendItemStyle}>
              <Box {...legendDotStyle} bg="#568A73" />
              <Text>Jumlah Inovator</Text>
            </Flex>
          </Flex>

          {isEmpty ? (
            <Text textAlign="center" mt={10} fontWeight="medium" fontSize="15">
              Belum ada data.
            </Text>
          ) : (
            <Box {...chartWrapperStyle}>
              <Flex {...yAxisWrapperStyle}>
                {Array.from({ length: Math.ceil(maxValue / 5) + 1 }, (_, i) => maxValue - i * 5).map(
                  (label, idx) => (
                    <Text key={idx} {...yAxisLabelStyle}>
                      {label >= 0 ? label : 0}
                    </Text>
                  )
                )}
              </Flex>

              <Flex {...chartBarContainerStyle} ref={chartBarRef} position="relative">
                <Flex width="100%" justify="space-between" align="flex-end" height="150px">
                  {chartData.map((group, i) => {
                    const barValue = group.values.find((v) => v.id === 1);
                    return (
                      <Box key={i} {...barGroupStyle} position="relative">
                        {barValue && (
                          <Tooltip
                            label={`${group.category}: ${barValue.value} inovator`}
                            placement="top"
                            openDelay={300}
                            hasArrow
                          >
                            <Box
                              {...barStyle}
                              height={`${(barValue.value / maxValue) * 100}%`}
                              bg={barValue.color}
                              cursor="pointer"
                            />
                          </Tooltip>
                        )}
                        <Text {...labelStyle}>{truncateLabel(group.category)}</Text>
                      </Box>
                    );
                  })}
                </Flex>
              </Flex>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ChartInnovator;