import { Box, Flex, Text, Icon, Link as ChakraLink } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, LabelList, Cell } from "recharts";
import { NavLink } from "react-router-dom";
import { paths } from "Consts/path";

type CustomLabelProps = {
    x: number;
    y: number;
    width: number;
    value: string;
};

interface VillageData {
    rank: string;
    name: string;
    value: number;
}

// 🔹 Custom label untuk Chart
const CustomLabel: React.FC<CustomLabelProps> = ({ x, y, width, value }) => {
    return (
        <text
            x={x + width / 2}
            y={y + 25} // Padding dari atas
            fill="#FFFFFF"
            fontSize={14}
            textAnchor="middle"
            fontWeight="bold"
        >
            {value}
        </text>
    );
};

// 🔹 Komponen utama
const InovasiUnggulan: React.FC = () => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState<string | null>(null); // Perbaikan tipe state
    const [chartData, setChartData] = useState<VillageData[]>([]);

    useEffect(() => {
        const fetchTopInnovation = async () => {
            try {
                const db = getFirestore();
                const innovationRef = collection(db, "innovations"); // ✅ Ambil dari collection "innovations"
                const snapshot = await getDocs(innovationRef);

                // Ambil data inovasi dan urutkan berdasarkan jumlahDesaKlaim (desc)
                const innovations = snapshot.docs
                    .map((doc) => ({
                        name: doc.data().namaInovasi as string, // ✅ Ganti "namaDesa" ke "namaInovasi"
                        value: doc.data().jumlahDesaKlaim as number || 0, // ✅ Ganti "jumlahInovasi" ke "jumlahDesaKlaim"
                    }))
                    .sort((a, b) => b.value - a.value) // Urutkan dari terbesar ke terkecil
                    .slice(0, 5); // Ambil top 5 inovasi

                // Urutan khusus untuk ranking (4, 2, 1, 3, 5)
                const customOrder = [3, 1, 0, 2, 4];
                const customHeights = [20, 40, 50, 35, 15]; // Custom tinggi batang sesuai ranking (1st - 5th)

                const rankedInnovations = customOrder.map((index, rankIndex) => ({
                    name: innovations[index]?.name || "",
                    value: customHeights[rankIndex], // dipakai buat chart
                    rank: `${["4th", "2nd", "1st", "3rd", "5th"][rankIndex]}`,
                }));

                setChartData(rankedInnovations);

                console.log("Ranked Innovations:", rankedInnovations);
            } catch (error) {
                console.error("Error fetching top innovations:", error);
            }
        };

        // Panggil fungsi setelah dideklarasikan
        fetchTopInnovation();
    }, []);

    return (
        <>
            {/* 🔹 Header Inovasi Unggulan */}
            <Flex justify="space-between" align="center" mt="24px" mx="15px">
                <Text fontSize="m" fontWeight="bold" color="gray.800">
                    Top 5 Inovasi
                </Text>
                <ChakraLink
                    as={NavLink}
                    to={paths.ADMIN_DASHBOARD_INOVASI}
                    fontSize="sm"
                    color="gray.500"
                    textDecoration="underline"
                >
                    Lihat Dashboard
                </ChakraLink>
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
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 0 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} hide />
                        <Tooltip cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#1E5631">
                            <LabelList dataKey="name" position="top" fontSize="10px" formatter={(name: string) => name.replace(/^Desa\s+/i, "")} />
                            <LabelList dataKey="rank" content={<CustomLabel x={0} y={0} width={0} value={""} />} />
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </>
    );
};

export default InovasiUnggulan;
