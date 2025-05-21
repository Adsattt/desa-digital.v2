import { Box, Flex, Text, Icon, Link as ChakraLink } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, Cell } from "recharts";
import { NavLink } from "react-router-dom";
import { paths } from "Consts/path";

// 🔹 Custom label untuk Chart
const CustomLabel: React.FC<{ x: number; y: number; width: number; value: string }> = ({ x, y, width, value }) => {
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

// 🔹 Custom Tooltip
const CustomTooltip = ({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: any[];
    label?: string;
}) => {
    if (active && payload && payload.length > 0) {
        const data = payload[0].payload; // Mengambil data dari tooltip

        return (
            <div style={{ background: "white", padding: "10px", border: "1px solid #ccc" }}>
                <p style={{ margin: 0, fontWeight: "bold" }}>{data.name}</p>
                <p style={{ margin: 0 }}>Total Inovasi Diterapkan: {data.valueAsli}</p>
            </div>
        );
    }

    return null;
};

// 🔹 Komponen utama
const DesaDigitalUnggulan: React.FC = () => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [chartData, setChartData] = useState<{ rank: string; name: string; value: number; valueAsli: number }[]>([]);

    useEffect(() => {
        const fetchTopVillages = async () => {
            try {
                const db = getFirestore();
                const villageRef = collection(db, "villages");
                const snapshot = await getDocs(villageRef);

                // Ambil data desa dan urutkan berdasarkan jumlahInovasi (desc)
                const villages = snapshot.docs
                    .map((doc) => ({
                        name: doc.data().namaDesa as string,
                        value: doc.data().jumlahInovasi as number || 0,
                    }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5); // Top 5

                // Urutan khusus untuk ranking (4, 2, 1, 3, 5)
                const customOrder = [3, 1, 0, 2, 4];
                const customHeights = [20, 40, 50, 35, 15]; // Custom tinggi batang sesuai ranking (1st - 5th)
                const customRanks = ["4th", "2nd", "1st", "3rd", "5th"];

                const rankedVillages = customOrder.map((index, rankIndex) => ({
                    name: villages[index]?.name || "",
                    value: customHeights[rankIndex], // dipakai buat chart
                    valueAsli: villages[index]?.value || 0, // hanya buat info internal
                    rank: customRanks[rankIndex], // Peringkat custom
                }));

                setChartData(rankedVillages);

                console.log("Ranked Villages:", rankedVillages);
            } catch (error) {
                console.error("Error fetching top villages:", error);
            }
        };
        fetchTopVillages();
    }, []);

    return (
        <>
            {/* 🔹 Header Desa Digital Unggulan */}
            <Flex justify="space-between" align="center" mt="24px" mx="15px">
                <Text fontSize="m" fontWeight="bold" color="gray.800">
                    Top 5 Desa Digital
                </Text>
                <ChakraLink
                    as={NavLink}
                    to={paths.ADMIN_DASHBOARD_DESA}
                    fontSize="sm"
                    color="gray.500"
                    textDecoration="underline"
                >
                    Lihat Dashboard
                </ChakraLink>
            </Flex>

            {/* 🔹 Chart Desa Digital Unggulan */}
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
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
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
        </>
    );
};

export default DesaDigitalUnggulan;
