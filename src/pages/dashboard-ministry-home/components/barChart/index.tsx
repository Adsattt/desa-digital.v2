import { Box, Text, Flex, Image, Spinner, Tooltip, Menu, MenuButton, MenuList, MenuItem, Button } from "@chakra-ui/react";
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

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const snapshot = await getDocs(collection(db, "profilDesa"));
            const counts: Record<number, number> = {};

            snapshot.forEach((doc) => {
                const data = doc.data();
                const year = Number(data.tahunData);
                const desa = data.namaDesa;

                if (!isNaN(year) && desa) {
                if (year >= yearRange[0] && year <= yearRange[1]) {
                    counts[year] = (counts[year] || 0) + 1;
                }
                }
            });

            setDataByYear(counts);
            setLoading(false);
        };

        fetchData();
    }, [yearRange]);

    const maxValue = Math.max(...Object.values(dataByYear), 10);
    const rotateLabels = Object.keys(dataByYear).length > 8;

    // Export Excel function
    const exportToExcel = (data: any[]) => {
        const wsData = [
            ["Tahun", "Jumlah Desa"],
            ...data.map((item) => [item.year, item.count]),
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(wsData);
        const workbook = XLSX.utils.book_new();

        // Set the sheet name
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Perkembangan Desa Digital");

        XLSX.writeFile(workbook, "data-perkembangan-desa-digital.xlsx");
    };

    // Export PDF function
    const exportToPDF = (data: any[]) => {
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.text("Data Perkembangan Desa Digital", 14, 20);

        // Add table below title
        autoTable(doc, {
            startY: 30, // prevent overlap with title
            head: [['Tahun', 'Jumlah Desa']],
            body: data.map((item) => [item.year, item.count]),
            styles: { fontSize: 10 },
        });

        doc.save("data-perkembangan-desa-digital.pdf");
    };

    const formattedData = Object.entries(dataByYear).map(([year, count]) => ({
        year: Number(year),
        count,
    }));

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

                {/* Download menu */}
                <Menu>
                <MenuButton
                    as={Box}
                    cursor="pointer"
                    display="inline-block"
                    marginRight={2}
                    _hover={{ opacity: 0.8 }}
                >
                    <Image src={downloadIcon} alt="Download" boxSize="16px" />
                </MenuButton>
                <MenuList>
                    <MenuItem onClick={() => exportToPDF(formattedData)}>Download PDF</MenuItem>
                    <MenuItem onClick={() => exportToExcel(formattedData)}>Download Excel</MenuItem>
                </MenuList>
                </Menu>
            </Flex>
        </Flex>

        <Box {...chartContainerStyle}>
            <Flex {...legendContainerStyle}>
            <Flex {...legendItemStyle}>
                <Box {...legendDotStyle} bg="#4C73C7" />
                <Text>Jumlah Desa</Text>
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
            onApply={(from, to) => {
            setYearRange([from, to]);
            }}
        />
        </Box>
    );
};

export default BarChartInovasi;