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
    const [chartData, setChartData] = useState<{ name: string; value: number; rank: string; isEmpty: boolean; }[]>([]);

    // 🔹 Ambil Data Inovator Unggulan dari Firestore
    // Ambil data dari Firestore
    useEffect(() => {
        const fetchTopInovator = async () => {
            try {
                const db = getFirestore();
                const auth = getAuth();
                const user = auth.currentUser;

                if (!user) {
                    console.error("User belum login");
                    return;
                }

                // 1. Ambil nama desa berdasarkan userId
                const desaQuery = query(
                    collection(db, "villages"),
                    where("userId", "==", user.uid)
                );
                const desaSnap = await getDocs(desaQuery);

                let namaDesa = "";
                if (!desaSnap.empty) {
                    const desaData = desaSnap.docs[0].data();
                    namaDesa = desaData?.namaDesa?.toLowerCase().trim() || "";
                } else {
                    console.warn("Desa tidak ditemukan untuk user ini");
                    return;
                }

                // 2. Ambil data claimInnovations berdasarkan desaId
                const claimQuery = query(
                    collection(db, "claimInnovations"),
                    where("desaId", "==", desaSnap.docs[0].id) // desaId dari document
                );
                const claimSnap = await getDocs(claimQuery);

                // 3. Ambil inovatorId yang terkait dengan klaim desa ini
                const inovatorIds = claimSnap.docs.map((doc) => doc.data().inovatorId);

                // 4. Ambil data inovator berdasarkan inovatorId
                const inovatorQuery = query(
                    collection(db, "innovators"),
                    where("id", "in", inovatorIds)
                );
                const inovatorSnap = await getDocs(inovatorQuery);

                // 5. Hitung jumlah inovasi berdasarkan inovatorId
                const inovatorCount: Record<string, number> = {};

                inovatorSnap.forEach((doc) => {
                    const data = doc.data();
                    const namaInovator = data?.namaInovator;
                    const jumlahInovasi = data?.jumlahInovasi || 0;

                    if (namaInovator && typeof namaInovator === "string") {
                        inovatorCount[namaInovator.trim()] = (inovatorCount[namaInovator.trim()] || 0) + jumlahInovasi;
                    }
                });

                // Konversi ke array dan sort
                const sortedInovators = Object.entries(inovatorCount)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value);

                // Tambah dummy jika kurang dari 5
                while (sortedInovators.length < 5) {
                    sortedInovators.push({ name: "-", value: 0 });
                }

                // 6. Custom bar layout
                const customOrder = [3, 1, 0, 2, 4];
                const customHeights = [20, 40, 50, 35, 15];  // Menjaga tinggi tetap sesuai urutan
                const customRanks = ["4th", "2nd", "1st", "3rd", "5th"];

                const rankedData = customOrder.map((index, rankIndex) => {
                    const item = sortedInovators[index];
                    return {
                        name: item?.name || "",
                        value: item?.value || 0,
                        valueAsli: item?.value || 0,
                        rank: customRanks[rankIndex],
                        isEmpty: item?.name === "" // Tandai kategori kosong
                    };
                });

                // 7. Set data untuk bar chart
                setChartData(rankedData);

            } catch (error) {
                console.error("❌ Error:", error);
            }
        };

        fetchTopInovator();
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

                // 1. Ambil namaDesa berdasarkan userId dari collection villages
                const desaQuery = query(
                    collection(db, "villages"),
                    where("userId", "==", user.uid)
                );
                const desaSnap = await getDocs(desaQuery);

                let namaDesa = "";
                if (!desaSnap.empty) {
                    const desaData = desaSnap.docs[0].data();
                    namaDesa = desaData?.namaDesa?.toLowerCase().trim() || "";
                } else {
                    console.warn("Desa tidak ditemukan");
                    return;
                }

                // 2. Ambil data claimInnovations yang terverifikasi terkait dengan desa
                const claimQuery = query(
                    collection(db, "claimInnovations"),
                    where("desaId", "==", desaSnap.docs[0].id) // Menggunakan id desa
                );
                const claimSnap = await getDocs(claimQuery);

                // 3. Ambil inovatorId yang terkait dengan klaim desa ini
                const inovatorIds = claimSnap.docs.map(doc => doc.data().inovatorId);

                // 4. Ambil data inovator berdasarkan inovatorId
                const inovatorQuery = query(
                    collection(db, "innovators"),
                    where("id", "in", inovatorIds)
                );
                const inovatorSnap = await getDocs(inovatorQuery);

                // 5. Hitung jumlah inovasi dan desa dampingannya berdasarkan inovatorId
                const inovatorCount: Record<string, { namaInovator: string, jumlahInovasi: number, jumlahDesaDampingan: number, namaDesaDampingan: string, namaInovasi: string }> = {};

                inovatorSnap.forEach((doc) => {
                    const data = doc.data();
                    const namaInovator = data.namaInovator;
                    const jumlahInovasi = data.jumlahInovasi || 0;
                    const jumlahDesaDampingan = data.jumlahDesaDampingan || 0;
                    const namaDesaDampingan = data.namaDesaDampingan || "";
                    const namaInovasi = data.namaInovasi || "";

                    if (namaInovator && typeof namaInovator === "string") {
                        const key = namaInovator.trim();
                        if (!inovatorCount[key]) {
                            inovatorCount[key] = {
                                namaInovator: key,
                                jumlahInovasi: jumlahInovasi,
                                jumlahDesaDampingan: jumlahDesaDampingan,
                                namaDesaDampingan: namaDesaDampingan,
                                namaInovasi: namaInovasi
                            };
                        } else {
                            inovatorCount[key].jumlahInovasi += jumlahInovasi;
                            inovatorCount[key].jumlahDesaDampingan += jumlahDesaDampingan;
                        }
                    }
                });

                // Konversi ke array dan urutkan berdasarkan jumlahInovasi
                const sortedInovators = Object.values(inovatorCount)
                    .sort((a, b) => b.jumlahInovasi - a.jumlahInovasi)
                    .map((item, index) => ({
                        ...item,
                        no: index + 1,  // Memberikan nomor urut
                    }));

                setInovatorData(sortedInovators);  // Set data inovator

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
                    <BarChart data={chartData} margin={{ top: 50, right: 20, left: 20, bottom: -10 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} hide />
                        <Tooltip content={<CustomTooltip />} />
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
                            {chartData.map((_, index) => (
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