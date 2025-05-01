import {
    Box,
    Flex,
    Text,
    Button,
  } from "@chakra-ui/react";
  import {
    PieChart,
    Pie,
    Tooltip,
    Cell,
  } from "recharts";
  import { getFirestore, collection, getDocs } from "firebase/firestore";
  import React, { useEffect, useState } from "react";
  import { DownloadIcon } from "@chakra-ui/icons";
  import * as XLSX from "xlsx";
  
  const SebaranKategoriInovator: React.FC = () => {
    const [kategoriData, setKategoriData] = useState<{ name: string; value: number; color: string }[]>([]);
  
    const colors: string[] = ["#A7C7A5", "#1E5631", "#174E3B", "#FF8C00", "#FF5733", "#6A5ACD"];
  
    useEffect(() => {
      const fetchKategoriData = async () => {
        try {
          const db = getFirestore();
          const innovatorsRef = collection(db, "innovators");
          const snapshot = await getDocs(innovatorsRef);
  
          const kategoriCount: Record<string, number> = {};
  
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.kategori) {
              const kategori = data.kategori.trim();
              kategoriCount[kategori] = (kategoriCount[kategori] || 0) + 1;
            }
          });
  
          const sortedKategori = Object.entries(kategoriCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([key, value], index) => ({
              name: key,
              value,
              color: colors[index % colors.length],
            }));
  
          setKategoriData(sortedKategori);
        } catch (error) {
          console.error("❌ Error fetching kategori data:", error);
        }
      };
  
      fetchKategoriData();
    }, []);
  
    const handleDownload = () => {
        const total = kategoriData.reduce((sum, item) => sum + item.value, 0);
      
        const excelData = kategoriData.map((item, index) => ({
          No: index + 1,
          Kategori: item.name,
          "Jumlah Inovator": item.value,
          "Persentase (%)": Math.round((item.value / total) * 100) + "%",
        }));
      
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Kategori Inovator");
        XLSX.writeFile(workbook, "sebaran_kategori_inovator.xlsx");
      };    
  
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
      return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={25} fontWeight="bold" fontFamily="poppins">
          {` ${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };
  
    return (
      <Box>
        {/* Header + Button */}
        <Flex justify="space-between" align="center" mt="11px" mx="15px">
          <Text fontSize="sm" fontWeight="bold" color="gray.800">
            Sebaran Kategori Inovator
          </Text>
          <Button
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
          </Button>
        </Flex>
  
        {/* Chart */}
        <Box
          bg="white"
          borderRadius="xl"
          pt="5px"
          pb="1px"
          mx="15px"
          boxShadow="md"
          border="2px solid"
          borderColor="gray.200"
          mt={4}
          overflow="visible"
        >
          <Flex justify="center" align="center">
            <PieChart width={320} height={220}>
              <Pie
                data={kategoriData}
                cx="55%"
                cy="50%"
                labelLine={false}
                outerRadius={130}
                dataKey="value"
                label={renderCustomizedLabel}
              >
                {kategoriData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
  
            {/* Legend */}
            <Box ml={4}>
              {kategoriData.map((entry, index) => (
                <Flex key={index} align="center" mb={1} mr={3} whiteSpace="nowrap">
                  <Box w={2} h={2} bg={entry.color} borderRadius="full" mr={2} />
                  <Text fontSize="10px">{entry.name}</Text>
                </Flex>
              ))}
            </Box>
          </Flex>
        </Box>
      </Box>
    );
  };
  
  export default SebaranKategoriInovator;
  