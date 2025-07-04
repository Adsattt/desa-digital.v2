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

import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";

import {
  chartContainerStyle, chartWrapperStyle,
  barGroupStyle, barStyle, labelStyle,
  legendContainerStyle, legendItemStyle, legendDotStyle,
  titleStyle, xAxisStyle, yAxisStyle,
  yAxisLabelStyle, yAxisWrapperStyle,
  chartBarContainerStyle, barAndLineWrapperStyle,
} from "./_chartInnovationStyle";
import YearFilter from "./dateFilter";

import filterIcon from "../../../../assets/icons/icon-filter.svg";
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

const getYAxisLabels = (max: number, step: number): number[] => {
  const roundedMax = Math.ceil(max / step) * step;
  const labels: number[] = [];
  for (let i = roundedMax; i >= 0; i -= step) {
    labels.push(i);
  }
  return labels;
};

const truncateLabel = (label: string, maxLength = 5): string => {
  return label.length > maxLength ? label.slice(0, maxLength) + "..." : label;
};

const ChartInnovation3 = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartData, setChartData] = useState<ChartGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxValue, setMaxValue] = useState(0);
  const [inovasiDetails, setInovasiDetails] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "innovations"));
      const countPerCategory: Record<string, number> = {};
      const allData: any[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.kategoriInovasi || !data.tahunDibuat) return;
        if (data.tahunDibuat > selectedYear) return;

        const kategori = data.kategoriInovasi;
        countPerCategory[kategori] = (countPerCategory[kategori] || 0) + 1;

        allData.push(data); // Save full data for export
      });

      const sortedEntries = Object.entries(countPerCategory).sort(
        (a, b) => b[1] - a[1]
      );

      const formattedData = sortedEntries.map(
        ([category, count], index) => ({
          category,
          values: [
            {
              id: 1,
              value: count,
              color: "#568A73",
            },
          ],
        })
      );

      const maxCount = Math.max(...Object.values(countPerCategory), 10);

      setChartData(formattedData);
      setMaxValue(maxCount);
      setInovasiDetails(allData); // Store full data for export
      setLoading(false);
    };

    fetchData();
  }, [selectedYear]);

  const isEmpty =
    chartData.length === 0 ||
    chartData.every(group =>
      group.values.every(item => item.value === 0)
    );

  // Export to PDF
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
    doc.text("Diambil dari: Grafik Jumlah Inovasi per Kategori", 14, 22);
    doc.text(`Diunduh pada: ${downloadDate}`, 190, 22, { align: "right" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");

    let y = 42;
    const labelX = 14;

    const grouped: Record<string, any[]> = data.reduce((acc, curr) => {
      const key = curr.kategoriInovasi || "Tidak Diketahui";
      if (!acc[key]) acc[key] = [];
      acc[key].push(curr);
      return acc;
    }, {});

    for (const [kategori, entries] of Object.entries(grouped)) {
      doc.setFont("helvetica", "bold");
      doc.text(`Data Inovasi Tahun ${selectedYear}, Kategori: ${kategori}`, labelX, y);
      y += 6;

      autoTable(doc, {
        startY: y,
        head: [
          ["No", "Nama Inovasi", "Nama Inovator", "Tahun Dibuat"],
        ],
        body: entries.map((item, i) => [
          i + 1,
          item.namaInovasi || "-",
          item.namaInovator || "-",
          item.tahunDibuat || "-",
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
          1: { cellWidth: 70 },
          2: { cellWidth: 60 },
          3: { cellWidth: 30 },
        },
        margin: { top: 10 },
      } as any);

      y = (doc as any).lastAutoTable.finalY + 15;
    }

    doc.save(`inovasi_per_kategori_${selectedYear}.pdf`);
  };

  // Export to Excel
  const exportToXLSX = () => {
    const worksheetData = chartData.map((group) => ({
      Kategori: group.category,
      Jumlah: group.values[0].value,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inovasi");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `inovasi_desa_${selectedYear}.xlsx`);
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={2}>
        <Text {...titleStyle}>Perkembangan Inovasi Tahun {selectedYear}</Text>
        <Flex justify="flex-end" align="center">
          <Image
            src={filterIcon}
            alt="Filter"
            boxSize="16px"
            cursor="pointer"
            ml={2}
            onClick={() => setIsFilterOpen(true)}
          />
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Download Options"
              icon={<Image src={downloadIcon} alt="Download" boxSize="16px" />}
              variant="ghost"
              ml={2}
            />
            <MenuList fontSize="sm">
              <MenuItem onClick={() => exportToPDF(inovasiDetails, selectedYear)}>
                Download PDF
              </MenuItem>
              <MenuItem onClick={exportToXLSX}>Download Excel</MenuItem>
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
          <Flex {...legendContainerStyle}>
            <Flex {...legendItemStyle}>
              <Box {...legendDotStyle} bg="#568A73" />
              <Text>Jumlah Inovasi</Text>
            </Flex>
          </Flex>

          {isEmpty ? (
            <Text textAlign="center" mt={10} fontWeight="medium" fontSize="15">
              Belum ada data untuk tahun yang dipilih.
            </Text>
          ) : (
            <Box {...chartWrapperStyle}>
              <Flex {...yAxisWrapperStyle}>
                {getYAxisLabels(maxValue, 5).map((label, index) => (
                  <Text key={index} {...yAxisLabelStyle}>
                    {label}
                  </Text>
                ))}
              </Flex>

              <Flex {...chartBarContainerStyle}>
                <Box {...yAxisStyle} />
                <Flex {...barAndLineWrapperStyle}>
                  {chartData.map((group, groupIndex) => (
                    <Box key={groupIndex} {...barGroupStyle}>
                      {group.values.map((item: BarValue) => (
                        <Tooltip
                          key={item.id}
                          label={`${group.category}: ${item.value} inovasi`}
                          placement="top"
                          openDelay={300}
                          hasArrow
                        >
                          <Box
                            {...barStyle}
                            height={`${(item.value / maxValue) * 100}%`}
                            bg={item.color}
                            cursor="pointer"
                          />
                        </Tooltip>
                      ))}
                      <Text {...labelStyle}>{truncateLabel(group.category)}</Text>
                    </Box>
                  ))}
                  <Box {...xAxisStyle} />
                </Flex>
              </Flex>
            </Box>
          )}
        </Box>
      )}

      <YearFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(year) => setSelectedYear(year)}
      />
    </Box>
  );
};

export default ChartInnovation3;