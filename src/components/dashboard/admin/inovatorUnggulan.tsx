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
const InovatorUnggulan: React.FC = () => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState<string | null>(null); // Perbaikan tipe state
    const [chartData, setChartData] = useState<VillageData[]>([]);

    useEffect(() => {
        const fetchTopInovator = async () => {
            try {
                const db = getFirestore();
                const inovatorRef = collection(db, "innovators"); // ✅ Ambil dari collection "innovators"
                const snapshot = await getDocs(inovatorRef);
        
                // Ambil data inovator dan urutkan berdasarkan jumlahInovasi (desc)
                const inovators = snapshot.docs
                    .map((doc) => ({
                        name: doc.data().namaInovator as string, // ✅ Ganti "namaDesa" ke "namaInovator"
                        value: doc.data().jumlahInovasi as number || 0, // ✅ Ganti "jumlahInovasi"
                    }))
                    .sort((a, b) => b.value - a.value) // Urutkan dari terbesar ke terkecil
                    .slice(0, 5); // Ambil top 5 inovator
        
                // Urutan khusus untuk ranking (4, 2, 1, 3, 5)
                const customOrder = [3, 1, 0, 2, 4];
                const customHeights = [20, 38, 44, 35, 15];
        
                const rankedInovators = customOrder.map((index, rankIndex) => ({
                    name: inovators[index]?.name || "",
                    value: customHeights[rankIndex], // dipakai buat chart
                    rank: `${["4th", "2nd", "1st", "3rd", "5th"][rankIndex]}`,
                }));
        
                setChartData(rankedInovators);
        
                console.log("Ranked Inovators:", rankedInovators);
            } catch (error) {
                console.error("Error fetching top innovators:", error);
            }
        };
        
        // Panggil fungsi setelah dideklarasikan
        fetchTopInovator();        
    }, []);

    return (
        <>
            {/* 🔹 Header Inovator Unggulan */}
            <Flex justify="space-between" align="center" mt="24px" mx="15px">
                <Text fontSize="m" fontWeight="bold" color="gray.800">
                    Top 5 Inovator
                </Text>
                <ChakraLink
                    as={NavLink}
                    to={paths.ADMIN_DASHBOARD_INOVATOR}
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

export default InovatorUnggulan;
