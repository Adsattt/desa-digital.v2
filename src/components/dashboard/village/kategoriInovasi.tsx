import { Box, Flex, Text, Button } from "@chakra-ui/react";
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, useDisclosure, ModalOverlay, Modal, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Select, ModalFooter } from "@chakra-ui/react";
import { getFirestore, collection, getDocs, where, query } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, LabelList, Cell } from "recharts";
import { DownloadIcon } from "@chakra-ui/icons";
import { TooltipProps } from "recharts";
import { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

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

// 🔹 Custom label persis kayak DesaDigitalUnggulan
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
                <p style={{ margin: 0 }}>Total Inovasi : {data.valueAsli}</p>
            </div>
        );
    }

    return null;
};

const KategoriInovasiDesa: React.FC = () => {
    const [barData, setBarData] = useState<ChartData[]>([]);
    const [allKategoriData, setAllKategoriData] = useState<Record<string, number>>({});
    const [kondisiData, setKondisiData] = useState<{ kategori: string; jumlah: number }[]>([]);
    const ITEMS_PER_PAGE = 5;
    const [currentPage, setCurrentPage] = useState(1);


    const fetchKategoriData = async () => {
        try {
            const db = getFirestore();
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                console.error("User belum login");
                return;
            }

            // 1. Ambil namaDesa dari villages berdasarkan userId
            const desaQuery = query(
                collection(db, "villages"),
                where("userId", "==", user.uid)
            );
            const desaSnap = await getDocs(desaQuery);

            let namaDesa = "";
            if (!desaSnap.empty) {
                const desaData = desaSnap.docs[0].data();
                namaDesa = desaData?.namaDesa?.trim().toLowerCase() || "";
            } else {
                console.warn("Desa tidak ditemukan");
                return;
            }

            // 2. Ambil data claimInnovations yang terverifikasi terkait dengan desa
            const claimQuery = query(
                collection(db, "claimInnovations"),
                where("desaId", "==", user.uid)
            );
            const claimSnap = await getDocs(claimQuery);

            // 3. Ambil inovasiId yang terkait dengan klaim desa ini
            const inovasiIds = claimSnap.docs.map(doc => doc.data().inovasiId);

            // 4. Ambil inovasi yang terkait dengan klaim desa
            const inovasiSnap = await getDocs(
                query(collection(db, "innovations"), where("__name__", "in", inovasiIds))
            );

            // 5. Tampilkan kategori dari inovasi yang diterapkan pada desa
            const kategoriCount: Record<string, number> = {};

            inovasiSnap.forEach((doc) => {
                const data = doc.data();
                const kategori = data.kategori;

                if (kategori && typeof kategori === "string" && kategori.trim()) {
                    const formatted = kategori.charAt(0).toUpperCase() + kategori.slice(1).toLowerCase();
                    kategoriCount[formatted] = (kategoriCount[formatted] || 0) + 1;
                }
            });

            console.log("Kategori yang diterapkan pada desa:", kategoriCount);

            // 6. Set kategori data
            setAllKategoriData(kategoriCount); // set as object

            const kondisiArray = Object.entries(kategoriCount).map(([kategori, jumlah]) => ({
                kategori,
                jumlah
            }));

            setKondisiData(kondisiArray);

            // 7. Buat top kategori jika ada
            const sortedKategori = Object.entries(kategoriCount)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);

            // 8. Sesuaikan jumlah kategori yang akan ditampilkan
            const displayedKategori = sortedKategori.slice(0, 5); // Menampilkan hingga 5 kategori

            // 9. Handle jika data < 5 (tambah dummy untuk kategori yang kosong)
            while (displayedKategori.length < 5) {
                displayedKategori.push({
                    name: "",  // Nama kosong untuk kategori yang tidak ada
                    value: 0,  // Nilai kosong untuk kategori yang tidak ada
                });
            }

            // 10. Rank kategori berdasarkan urutan dan atur data bar
            const customOrder = [3, 1, 0, 2, 4];
            const customHeights = [20, 40, 50, 35, 15];  // Menjaga tinggi tetap sesuai urutan
            const customRanks = ["4th", "2nd", "1st", "3rd", "5th"];

            // 11. Rank kategori berdasarkan urutan dan atur data bar
            const rankedData = customOrder.map((index, rankIndex) => {
                const item = displayedKategori[index];
                return {
                    name: item?.name || "-",
                    value: item?.value || 0,
                    valueAsli: item?.value || 0,
                    rank: customRanks[rankIndex],
                    isEmpty: item?.name === "" // Tandai kategori kosong
                };
            });

            // 12. Set bar data untuk ditampilkan
            setBarData(rankedData);


        } catch (error) {
            console.error("Error fetching kategori data:", error);
        }
    };


    useEffect(() => {
        fetchKategoriData();
    }, []);


    const totalPages = Math.ceil(kondisiData.length / ITEMS_PER_PAGE);

    return (
        <Box>
            {/* 🔹 Header */}
            <Flex justify="space-between" align="center" mt="24px" mx="15px">
                <Text fontSize="sm" fontWeight="bold" color="gray.800">
                    Kategori Inovasi yang Diterapkan
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
                    <BarChart data={barData} margin={{ top: 50, right: 20, left: 20, bottom: -10 }}>
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
                            {barData.map((_, index) => (
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
            >
                {/* Table Container */}
                <TableContainer maxWidth="100%" width="auto" borderRadius="md">
                    <Table variant="simple" size="sm"> {/* Mengurangi ukuran tabel */}
                        {/* Header Tabel */}
                        <Thead bg="#C6D8D0">
                            <Tr>
                                <Th p={3} fontSize="8px" textAlign="center">No</Th>
                                <Th p={1} fontSize="8px" textAlign="center">Kategori Potensi</Th>
                                <Th p={1} fontSize="8px" textAlign="center">Jumlah</Th>
                            </Tr>
                        </Thead>

                        {/* Body Tabel */}
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

export default KategoriInovasiDesa;