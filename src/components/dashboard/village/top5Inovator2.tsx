import { Box, Flex, Stack, Text, Grid, Badge, IconButton, Link as ChakraLink, Button, Table, Thead, Tbody, Tr, Th, Td, TableContainer } from "@chakra-ui/react";
import { ArrowUpRight, ArrowDownRight, Leaf, Users, Phone, Icon } from "lucide-react";
import TopBar from "Components/topBar";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList, ScatterChart, Scatter, ZAxis, Pie, PieChart, Legend } from "recharts";
import VillageActive from 'Assets/icons/village-active.svg';
import { FaUser } from "react-icons/fa";
import { getFirestore, collection, getDocs, doc, getDoc, query, where, Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { paths } from "Consts/path";
import { getAuth } from "firebase/auth";
import { FaSeedling } from "react-icons/fa6";
import redinesImg from "@public/images/rediness.svg";
import { Filter } from "lucide-react";
import { DownloadIcon } from "@chakra-ui/icons";
import * as XLSX from "xlsx";
import { TooltipProps } from "recharts";
import { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";


const ITEMS_PER_PAGE = 5; // Jumlah data per halaman

const CustomTooltip = ({
    active,
    payload,
    label,
}: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length > 0) {
        const data = payload[0].payload;

        return (
            <div style={{ background: "white", padding: "10px", border: "1px solid #ccc" }}>
                <p style={{ margin: 0, fontWeight: "bold" }}>{data.name}</p>
                <p style={{ margin: 0 }}>Total Inovasi: {data.valueAsli}</p>
            </div>
        );
    }

    return null;
};


const Top5InovatorVillage: React.FC = () => {
    const [chartData, setChartData] = useState<{ name: string; value: number; rank: string }[]>([]);

    // 🔹 Ambil Data Inovator Unggulan dari Firestore
    useEffect(() => {
        const fetchTopInovatorTanpaId = async () => {
            try {
                const db = getFirestore();
                const auth = getAuth();
                const user = auth.currentUser;

                if (!user) {
                    console.error("User belum login");
                    return;
                }

                // Ambil nama desa dari user login
                const desaQuery = query(
                    collection(db, "villages"),
                    where("userId", "==", user.uid)
                );
                const desaSnap = await getDocs(desaQuery);

                let namaDesa = "";
                if (!desaSnap.empty) {
                    const desaData = desaSnap.docs[0].data() as { namaDesa: string };
                    namaDesa = desaData.namaDesa?.toLowerCase().trim() || "";
                } else {
                    console.warn("Desa tidak ditemukan untuk user ini");
                    return;
                }

                // Ambil semua inovasi
                const innovationsSnap = await getDocs(collection(db, "innovations"));

                // Hitung jumlah inovasi berdasarkan namaInovator
                const inovatorCount: Record<string, number> = {};

                innovationsSnap.docs.forEach((doc) => {
                    const data = doc.data();
                    const input = data.inputDesaMenerapkan;
                    const namaInovator = data.namaInovator;

                    let cocok = false;

                    if (Array.isArray(input)) {
                        cocok = input.some(
                            (nama: string) =>
                                nama?.toLowerCase().trim() === namaDesa
                        );
                    } else if (typeof input === "string") {
                        cocok = input.toLowerCase().trim() === namaDesa;
                    }

                    if (cocok && typeof namaInovator === "string") {
                        const key = namaInovator.trim();
                        inovatorCount[key] = (inovatorCount[key] || 0) + 1;
                    }
                });

                // Konversi ke array dan sort
                const inovators = Object.entries(inovatorCount)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value);

                // Tambah dummy jika kurang dari 5
                while (inovators.length < 5) {
                    inovators.push({ name: "-", value: 0 });
                }

                // Custom bar layout
                const customOrder = [3, 1, 0, 2, 4];
                const customHeights = [20, 40, 50, 35, 15];
                const customRanks = ["4th", "2nd", "1st", "3rd", "5th"];

                const rankedInovators = customOrder.map((index, rankIndex) => {
                    const item = inovators[index];
                    return {
                        name: item?.name || "",
                        value: customHeights[rankIndex],
                        valueAsli: item?.value || 0,
                        rank: customRanks[rankIndex],
                    };
                });

                console.log("✅ Ranked Top Inovators:", rankedInovators);
                setChartData(rankedInovators);
            } catch (error) {
                console.error("❌ Error:", error);
            }
        };

        // PANGGIL dengan nama yang BENAR
        fetchTopInovatorTanpaId();
    }, []);



    type CustomLabelProps = {
        x: number;
        y: number;
        width: number;
        value: string;
    };

    // 🔹 Custom label untuk Chart
    const CustomLabel: React.FC<CustomLabelProps> = ({ x, y, width, value }) => {
        return (
            <text
                x={x + width / 2}
                y={y + 25} // Padding dari atas
                fill="#FFFFFF"
                fontSize={12}
                textAnchor="middle"
                fontWeight="bold"
            >
                {value}
            </text>
        );
    };

    //-----------------DATA TABLE-------------------

    // State untuk data inovator
    const [inovatorData, setInovatorData] = useState<
        {
            namaDesaDampingan: any;
            namaInovasi: any; no: number; namaInovator: string; jumlahInovasi: number; jumlahDesaDampingan: number
        }[]
    >([]);
    const [currentPage, setCurrentPage] = useState(1);

    // Ambil data dari Firestore
    useEffect(() => {
        const fetchInovatorData = async () => {
            try {
                const db = getFirestore();
                const auth = getAuth();
                const user = auth.currentUser;

                if (!user) {
                    console.error("User belum login");
                    return;
                }

                // Ambil namaDesa dari collection villages
                const desaQuery = query(
                    collection(db, "villages"),
                    where("userId", "==", user.uid)
                );
                const desaSnap = await getDocs(desaQuery);

                let namaDesa = "";
                if (!desaSnap.empty) {
                    const desaData = desaSnap.docs[0].data() as { namaDesa: string };
                    namaDesa = desaData.namaDesa?.toLowerCase().trim() || "";
                } else {
                    console.warn("Desa tidak ditemukan");
                    return;
                }

                // Ambil semua inovasi
                const innovationsSnap = await getDocs(collection(db, "innovations"));

                type InovatorRow = {
                    namaInovator: string;
                    namaInovasi: string;
                    namaDesaDampingan: string;
                    jumlahDesaDampingan: number;
                    jumlahInovasi: number;
                    no: number;
                };

                const countMap: Record<string, InovatorRow> = {};

                innovationsSnap.docs.forEach((doc) => {
                    const data = doc.data();
                    const input = data.inputDesaMenerapkan;
                    const namaInovator = data.namaInovator;
                    const namaInovasi = data.namaInovasi;
                    const jumlahDesaDampingan = data.jumlahDesaKlaim || 0;

                    let cocok = false;
                    if (Array.isArray(input)) {
                        cocok = input.some(
                            (nama: string) =>
                                nama?.toLowerCase().trim() === namaDesa
                        );
                    } else if (typeof input === "string") {
                        cocok = input.toLowerCase().trim() === namaDesa;
                    }

                    if (
                        cocok &&
                        typeof namaInovator === "string" &&
                        typeof namaInovasi === "string"
                    ) {
                        const key = namaInovator.trim();
                        if (!countMap[key]) {
                            countMap[key] = {
                                namaInovator: key,
                                namaInovasi: namaInovasi,
                                namaDesaDampingan: namaDesa,
                                jumlahDesaDampingan: jumlahDesaDampingan,
                                jumlahInovasi: 1,
                                no: 0,
                            };
                        } else {
                            countMap[key].jumlahInovasi += 1;
                        }
                    }
                });

                // Ubah ke array, urutkan, beri nomor urut
                const result = Object.values(countMap)
                    .sort((a, b) => b.jumlahInovasi - a.jumlahInovasi)
                    .map((item, index) => ({
                        ...item,
                        no: index + 1,
                    }));

                setInovatorData(result);
            } catch (error) {
                console.error("❌ Error fetching innovator data:", error);
            }
        };

        fetchInovatorData();
    }, []);

    const handleDownload = () => {
        const excelData = inovatorData.map((item) => ({
            No: item.no,
            "Nama Inovator": item.namaInovator,
            "Jumlah Inovasi": item.jumlahInovasi,
            "Jumlah Desa Dampingan": item.jumlahDesaDampingan,
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "SemuaInovator");

        XLSX.writeFile(workbook, "Semua_Inovator.xlsx");
    };


    // Hitung total halaman
    const totalPages = Math.ceil(inovatorData.length / ITEMS_PER_PAGE);

    // Data yang akan ditampilkan di halaman saat ini
    const currentData = inovatorData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <Box>
            {/* 🔹 Header Inovator Unggulan */}
            <Flex justify="space-between" align="center" mt="24px" mx="15px">
                <Text fontSize="m" fontWeight="bold" color="gray.800">
                    Top 5 Inovator Terbaik
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
                    gap={2}
                    _hover={{ bg: "gray.100" }}
                    cursor="pointer"
                    onClick={handleDownload}
                ><DownloadIcon boxSize={3} color="black" />
                </Button> */}
            </Flex>

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
                    <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} hide />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#1E5631">
                            <LabelList
                                dataKey="name"
                                position="top"
                                fontSize="10px"
                                formatter={(name: string) => name.replace(/^Desa\s+/i, "")}
                            />
                            <LabelList dataKey="rank" content={<CustomLabel x={0} y={0} width={0} value={""} />} />
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Box>

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
                mb={5}
            >
                {/* Table Container */}
                <TableContainer maxWidth="100%" width="auto" borderRadius="md">
                    <Table variant="simple" size="sm" > {/* Mengurangi ukuran tabel */}
                        {/* Header Tabel */}
                        <Thead bg="#C6D8D0">
                            <Tr>
                                <Th p={3} fontSize="8px" textAlign="center">No</Th>
                                <Th p={1} fontSize="8px" textAlign="center">Nama Inovator</Th>
                                <Th p={1} fontSize="8px" textAlign="center">Jumlah Inovasi</Th>
                                <Th p={1} fontSize="8px" textAlign="center">Jumlah Desa Dampingan</Th>
                            </Tr>
                        </Thead>

                        {/* Body Tabel */}
                        <Tbody>
                            {currentData.map((row) => (
                                <Tr key={row.no}>
                                    <Td p={1} fontSize="8px" textAlign="center" fontWeight="bold">{row.no}</Td>
                                    <Td p={1} fontSize="8px" textAlign="center">{row.namaInovator}</Td>
                                    <Td p={1} fontSize="8px" textAlign="center">{row.jumlahInovasi}</Td>
                                    <Td p={1} fontSize="8px" textAlign="center">{row.jumlahDesaDampingan}</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </TableContainer>

                {/* Paginasi */}
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

export default Top5InovatorVillage;
