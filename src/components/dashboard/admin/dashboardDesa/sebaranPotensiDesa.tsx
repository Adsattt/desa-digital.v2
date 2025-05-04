import {
    Box,
    Flex,
    Text,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
} from "@chakra-ui/react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    LabelList,
    Cell,
} from "recharts";
import { DownloadIcon } from "@chakra-ui/icons";

type ChartData = {
    valueAsli: any;
    name: string;
    value: number;
    rank: string;
};

type CustomLabelProps = {
    x: number;
    y: number;
    width: number;
    value: string;
};

const CustomLabel: React.FC<CustomLabelProps> = ({ x, y, width, value }) => {
    return (
        <text
            x={x + width / 2}
            y={y + 25}
            fill="#FFFFFF"
            fontSize={12}
            textAnchor="middle"
            fontWeight="bold"
        >
            {value}
        </text>
    );
};

const SebaranPotensiDesa: React.FC = () => {
    const [barData, setBarData] = useState<ChartData[]>([]);
    const [allPotensiData, setAllPotensiData] = useState<Record<string, number>>({});
    const [kondisiData, setKondisiData] = useState<{ kategori: string; jumlah: number }[]>([]);
    const ITEMS_PER_PAGE = 5;
    const [currentPage, setCurrentPage] = useState(1);

    const fetchPotensiData = async () => {
        try {
            const db = getFirestore();
            const villagesRef = collection(db, "villages");
            const snapshot = await getDocs(villagesRef);

            const potensiCount: Record<string, number> = {};

            snapshot.forEach((doc) => {
                const data = doc.data();
                if (Array.isArray(data.potensiDesa)) {
                    data.potensiDesa.forEach((potensi: string) => {
                        const formattedPotensi =
                            potensi.charAt(0).toUpperCase() + potensi.slice(1).toLowerCase();
                        potensiCount[formattedPotensi] = (potensiCount[formattedPotensi] || 0) + 1;
                    });
                }
            });

            setAllPotensiData({ ...potensiCount });

            const kondisiArray = Object.keys(potensiCount)
                .map((key) => ({
                    kategori: key,
                    jumlah: potensiCount[key],
                }))
                .sort((a, b) => b.jumlah - a.jumlah);

            setKondisiData(kondisiArray);

            const sortedPotensi = Object.keys(potensiCount)
                .map((name) => ({
                    name,
                    value: potensiCount[name],
                }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5);

            const customOrder = [3, 1, 0, 2, 4];
            const customHeights = [20, 40, 50, 35, 15];
            const customRanks = ["4th", "2nd", "1st", "3rd", "5th"];

            const rankedData = customOrder.map((index, rankIndex) => ({
                name: sortedPotensi[index]?.name || "",
                value: customHeights[rankIndex],
                valueAsli: sortedPotensi[index]?.value || 0,
                rank: customRanks[rankIndex],
            }));

            setBarData(rankedData);
        } catch (error) {
            console.error("Error fetching potensi data:", error);
        }
    };

    const handleDownload = () => {
        const sorted = Object.entries(allPotensiData)
            .map(([name, count]) => ({ name, value: count as number }))
            .sort((a, b) => b.value - a.value);

        const excelData = sorted.map((item, index) => ({
            No: index + 1,
            Kategori: item.name,
            "Jumlah Desa": item.value,
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "PotensiDesa");

        XLSX.writeFile(workbook, "sebaran_potensi_desa.xlsx");
    };

    useEffect(() => {
        fetchPotensiData();
    }, []);

    const totalPages = Math.ceil(kondisiData.length / ITEMS_PER_PAGE);

    return (
        <Box>
            {/* 🔹 Header */}
            <Flex justify="space-between" align="center" mt="24px" mx="15px">
                <Text fontSize="sm" fontWeight="bold" color="gray.800">
                    Sebaran Potensi Desa
                </Text>
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
                    _hover={{ bg: "gray.100" }}
                    cursor="pointer"
                    onClick={handleDownload}
                >
                    <DownloadIcon boxSize={3} color="black" />
                </Button> */}
            </Flex>

            {/* 🔹 Chart */}
            <Box
                bg="white"
                borderRadius="xl"
                pt="10px"
                pb="1px"
                mx="15px"
                boxShadow="md"
                border="2px solid"
                borderColor="gray.200"
                mt={4}
                overflow="visible"
            >
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barData} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} hide />
                        <Tooltip cursor={{ fill: "transparent" }} />
                        <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#1E5631">
                            <LabelList
                                dataKey="name"
                                position="top"
                                fontSize="10px"
                                formatter={(name: string) => name.replace(/^Desa\s+/i, "")}
                            />
                            <LabelList
                                dataKey="rank"
                                content={<CustomLabel x={0} y={0} width={0} value={""} />}
                            />
                            {barData.map((_, index) => (
                                <Cell key={`cell-${index}`} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Box>

            {/* 🔹 Table */}
            <Box
                bg="white"
                borderRadius="xl"
                pt={0}
                pb={3}
                mx="15px"
                boxShadow="md"
                border="0px solid"
                borderColor="gray.200"
                mt={4}
            >
                <TableContainer maxWidth="100%" width="auto" borderRadius="md">
                    <Table variant="simple" size="sm">
                        <Thead bg="#C6D8D0">
                            <Tr>
                                <Th p={3} fontSize="8px" textAlign="center">No</Th>
                                <Th p={1} fontSize="8px" textAlign="center">Kategori Potensi</Th>
                                <Th p={1} fontSize="8px" textAlign="center">Jumlah</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {kondisiData
                                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                                .map((row, index) => (
                                    <Tr key={index}>
                                        <Td p={1} fontSize="8px" textAlign="center" fontWeight="bold">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                        </Td>
                                        <Td p={1} fontSize="8px" textAlign="center">{row.kategori}</Td>
                                        <Td p={1} fontSize="8px" textAlign="center">{row.jumlah}</Td>
                                    </Tr>
                                ))}
                        </Tbody>
                    </Table>
                </TableContainer>

                {/* 🔹 Pagination */}
                <Flex justify="center" mt={3} gap={2}>
                    {[...Array(totalPages)].map((_, index) => (
                        <Button
                            key={index}
                            size="xs"
                            borderRadius="full"
                            bg={currentPage === index + 1 ? "gray.800" : "white"}
                            color={currentPage === index + 1 ? "white" : "gray.800"}
                            onClick={() => setCurrentPage(index + 1)}
                            _hover={{ bg: "gray.300" }}
                        >
                            {index + 1}
                        </Button>
                    ))}
                </Flex>
            </Box>
        </Box>
    );
};

export default SebaranPotensiDesa;
