import React, { useState, useEffect } from 'react';
import {
    Box,
    Flex,
    Text,
    Button as ChakraButton,
    Link as ChakraLink
} from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { paths } from 'Consts/path';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';

interface LeaderboardItem {
    name: string;
    value: number;
    valueAsli: number;
    rank: string;
}

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

// 🔹 Custom Tooltip untuk menampilkan "Total"
const CustomTooltip = ({
    active,
    payload,
    label,
    category,
}: {
    active?: boolean;
    payload?: any[];
    label?: string;
    category: string;
}) => {
    if (active && payload && payload.length > 0) {
        const data = payload[0].payload;
        const labelMap: Record<string, string> = {
            desa: 'Total Inovasi Diterapkan',
            inovasi: 'Total Desa Menerapkan',
            inovator: 'Total Inovasi'
        };

        return (
            <div style={{ background: "white", padding: "10px", border: "1px solid #ccc" }}>
                <p style={{ margin: 0, fontWeight: "bold" }}>{data.name}</p>
                <p style={{ margin: 0 }}>{labelMap[category] || 'Total'}: {data.valueAsli}</p>
            </div>
        );
    }

    return null;
};

const Leaderboard: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<'desa' | 'inovator' | 'inovasi'>('desa');
    const [data, setData] = useState<LeaderboardItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            const db = getFirestore();
            let collectionName = '';
            let nameField = '';
            let valueField = '';

            switch (selectedCategory) {
                case 'desa':
                    collectionName = 'villages';
                    nameField = 'namaDesa';
                    valueField = 'jumlahInovasi';
                    break;
                case 'inovator':
                    collectionName = 'innovators';
                    nameField = 'namaInovator';
                    valueField = 'jumlahInovasi';
                    break;
                case 'inovasi':
                    collectionName = 'innovations';
                    nameField = 'namaInovasi';
                    valueField = 'jumlahDesaKlaim';
                    break;
            }

            try {
                const querySnapshot = await getDocs(collection(db, collectionName));
                const items: LeaderboardItem[] = querySnapshot.docs
                    .map(doc => ({
                        name: doc.data()[nameField] || "",
                        value: doc.data()[valueField] || 0,
                        valueAsli: doc.data()[valueField] || 0,
                        rank: ""
                    }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5);

                const customOrder = [3, 1, 0, 2, 4];
                const customHeights = selectedCategory === 'inovator' ? [20, 38, 44, 35, 15] : [20, 40, 50, 35, 15];
                const customRanks = ["4th", "2nd", "1st", "3rd", "5th"];

                const rankedData = customOrder.map((index, rankIndex) => ({
                    name: items[index]?.name || "",
                    value: customHeights[rankIndex],
                    valueAsli: items[index]?.valueAsli || 0,
                    rank: customRanks[rankIndex],
                }));

                setData(rankedData);
            } catch (error) {
                console.error('Error fetching data: ', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedCategory]);

    const getDashboardPath = () => {
        switch (selectedCategory) {
            case 'desa':
                return paths.ADMIN_DASHBOARD_DESA;
            case 'inovator':
                return paths.ADMIN_DASHBOARD_INOVATOR;
            case 'inovasi':
                return paths.ADMIN_DASHBOARD_INOVASI;
            default:
                return '#';
        }
    };

    return (
        <>
            {/* 🔹 Header */}
            <Flex justify="center" gap="10px" mb={4} mt={2}>
                <ChakraButton
                    onClick={() => setSelectedCategory('inovasi')}
                    variant={selectedCategory === 'inovasi' ? 'solid' : 'outline'}
                    fontSize="10"
                >
                    Top 5 Inovasi
                </ChakraButton>
                <ChakraButton
                    onClick={() => setSelectedCategory('desa')}
                    variant={selectedCategory === 'desa' ? 'solid' : 'outline'}
                    fontSize="10"
                >
                    Top 5 Desa
                </ChakraButton>
                <ChakraButton
                    onClick={() => setSelectedCategory('inovator')}
                    variant={selectedCategory === 'inovator' ? 'solid' : 'outline'}
                    fontSize="10"
                >
                    Top 5 Inovator
                </ChakraButton>
            </Flex>


            {/* 🔹 Chart Container */}
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
                {loading ? (
                    <Text textAlign="center">Loading...</Text>
                ) : (
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 0 }}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} hide />
                            <Tooltip content={<CustomTooltip category={selectedCategory} />} cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#1E5631">
                                <LabelList dataKey="name" position="top" fontSize="10px" formatter={(name: string) => name.replace(/^Desa\s+/i, "")} />
                                <LabelList dataKey="rank" content={<CustomLabel x={0} y={0} width={0} value={""} />} />
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </Box>

            {/* 🔹 Footer Link */}
            <Box mt={3} textAlign="center">
                <ChakraLink href={getDashboardPath()} fontSize="sm" color="gray.500" textDecoration="underline">
                    Lihat Data
                </ChakraLink>
            </Box>
        </>
    );
};

export default Leaderboard;