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
  values: BarValue[]; // [0] = count of docs (bar)
};

const getYAxisLabels = (max: number, step: number): number[] => {
  const roundedMax = Math.ceil(max / step) * step;
  const labels: number[] = [];
  for (let i = roundedMax; i >= 0; i -= step) {
    labels.push(i);
  }
  return labels;
};

// Crop label to 3 letters + "..."
const truncateLabel = (label: string, maxLength = 3): string => {
  return label.length > maxLength ? label.slice(0, maxLength) + "..." : label;
};

const ChartInnovator = () => {
  const [chartData, setChartData] = useState<ChartGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxValue, setMaxValue] = useState(10);

  const chartBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "profilInovator"));

      // Map kategoriInovator -> count of documents
      const categoryMap: Record<string, { count: number }> = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.kategoriInovator) return;

        const kategori = data.kategoriInovator;

        if (!categoryMap[kategori]) {
          categoryMap[kategori] = {
            count: 0,
          };
        }

        categoryMap[kategori].count += 1;
      });

      const formattedData: ChartGroup[] = Object.entries(categoryMap)
        .map(([category, { count }]) => ({
          category,
          values: [
            {
              id: 1,
              value: count, // bar: count of docs per category
              color: "#568A73", // bar color
            },
          ],
        }))
        // Sort descending by count (bar value)
        .sort((a, b) => {
          const aCount = a.values.find((v) => v.id === 1)?.value || 0;
          const bCount = b.values.find((v) => v.id === 1)?.value || 0;
          return bCount - aCount;
        });

      // Find max bar value to scale Y-axis
      const maxCount = Math.max(
        ...formattedData.map((group) => group.values[0].value),
        10
      );

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
              <MenuItem
                onClick={() => {
                  const doc = new jsPDF();
                  doc.text(`Data Inovasi Desa`, 14, 10);
                  const tableData = chartData.map((group) => [
                    group.category,
                    group.values[0].value,
                  ]);
                  autoTable(doc, {
                    head: [["Kategori", "Jumlah Inovator"]],
                    body: tableData,
                  });
                  doc.save(`inovasi_desa.pdf`);
                }}
              >
                Download PDF
              </MenuItem>
              <MenuItem
                onClick={() => {
                  const worksheetData = chartData.map((group) => ({
                    Kategori: group.category,
                    JumlahDokumen: group.values[0].value,
                  }));

                  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
                  const workbook = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(workbook, worksheet, "Inovasi");

                  const excelBuffer = XLSX.write(workbook, {
                    bookType: "xlsx",
                    type: "array",
                  });

                  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
                  saveAs(blob, `inovasi_desa.xlsx`);
                }}
              >
                Download Excel
              </MenuItem>
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
                            label={`${group.category}: ${barValue.value} dokumen`}
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