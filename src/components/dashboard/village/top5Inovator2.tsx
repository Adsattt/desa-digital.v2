import { Box, Flex, Text, Button, Table, Thead, Tbody, Tr, Th, Td, TableContainer } from "@chakra-ui/react";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LabelList, Cell } from "recharts";
import { DownloadIcon } from "@chakra-ui/icons";
import * as XLSX from "xlsx";
import { TooltipProps } from "recharts";
import { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

const ITEMS_PER_PAGE = 5;

const CustomTooltip = ({
  active,
  payload,
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
  const [inovatorData, setInovatorData] = useState<{
    no: number;
    namaInovator: string;
    jumlahInovasi: number;
  }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // 1️⃣ BAR CHART DATA
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

        // Ambil desa
        const desaQuery = query(
          collection(db, "villages"),
          where("userId", "==", user.uid)
        );
        const desaSnap = await getDocs(desaQuery);
        if (desaSnap.empty) return;

        const desaId = desaSnap.docs[0].id;

        // Claim Innovations untuk desa itu
        const claimQuery = query(
          collection(db, "claimInnovations"),
          where("desaId", "==", desaId)
        );
        const claimSnap = await getDocs(claimQuery);

        const inovatorIds = claimSnap.docs.map(doc => doc.data().inovatorId);
        if (inovatorIds.length === 0) {
          console.warn("Tidak ada inovasi diklaim");
          setChartData([]);
          return;
        }

        const inovatorQuery = query(
          collection(db, "innovators"),
          where("id", "in", inovatorIds)
        );
        const inovatorSnap = await getDocs(inovatorQuery);

        const inovatorCount: Record<string, number> = {};
        claimSnap.forEach(docClaim => {
          const inovatorId = docClaim.data().inovatorId;
          const inovatorDoc = inovatorSnap.docs.find(doc => doc.data().id === inovatorId);
          if (!inovatorDoc) return;
          const namaInovator = inovatorDoc.data().namaInovator?.trim() || "-";
          inovatorCount[namaInovator] = (inovatorCount[namaInovator] || 0) + 1;
        });

        const sortedInovators = Object.entries(inovatorCount)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);

        while (sortedInovators.length < 5) {
          sortedInovators.push({ name: "-", value: 0 });
        }

        const customOrder = [3, 1, 0, 2, 4];
        const customRanks = ["4th", "2nd", "1st", "3rd", "5th"];

        const rankedData = customOrder.map((index, rankIndex) => {
          const item = sortedInovators[index];
          return {
            name: item?.name || "",
            value: item?.value || 0,
            valueAsli: item?.value || 0,
            rank: customRanks[rankIndex],
            isEmpty: item?.name === ""
          };
        });

        setChartData(rankedData);
      } catch (error) {
        console.error("❌ Error:", error);
      }
    };

    fetchTopInovator();
  }, []);

  // 2️⃣ TABLE DATA
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

        const desaQuery = query(
          collection(db, "villages"),
          where("userId", "==", user.uid)
        );
        const desaSnap = await getDocs(desaQuery);
        if (desaSnap.empty) return;

        const desaId = desaSnap.docs[0].id;

        const claimQuery = query(
          collection(db, "claimInnovations"),
          where("desaId", "==", desaId)
        );
        const claimSnap = await getDocs(claimQuery);
        if (claimSnap.empty) {
          setInovatorData([]);
          return;
        }

        const inovatorIds = claimSnap.docs.map(doc => doc.data().inovatorId);

        const inovatorQuery = query(
          collection(db, "innovators"),
          where("id", "in", inovatorIds)
        );
        const inovatorSnap = await getDocs(inovatorQuery);

        const inovatorMap = new Map<string, { namaInovator: string }>();
        inovatorSnap.forEach(doc => {
          const data = doc.data();
          if (data.id) {
            inovatorMap.set(data.id, {
              namaInovator: data.namaInovator || "-",
            });
          }
        });

        const inovatorCount: Record<string, {
          namaInovator: string;
          jumlahInovasi: number;
        }> = {};

        claimSnap.forEach(docClaim => {
          const inovatorId = docClaim.data().inovatorId;
          const inovatorData = inovatorMap.get(inovatorId);
          if (!inovatorData) return;

          const namaInovator = inovatorData.namaInovator;

          if (!inovatorCount[namaInovator]) {
            inovatorCount[namaInovator] = {
              namaInovator,
              jumlahInovasi: 1,
            };
          } else {
            inovatorCount[namaInovator].jumlahInovasi += 1;
          }
        });

        const sortedInovators = Object.values(inovatorCount)
          .sort((a, b) => b.jumlahInovasi - a.jumlahInovasi)
          .map((item, index) => ({
            ...item,
            no: index + 1,
          }));

        setInovatorData(sortedInovators);
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
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SemuaInovator");
    XLSX.writeFile(workbook, "Semua_Inovator.xlsx");
  };

  const totalPages = Math.ceil(inovatorData.length / ITEMS_PER_PAGE);
  const currentData = inovatorData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const CustomLabel: React.FC<{ x: number; y: number; width: number; value: string }> = ({ x, y, width, value }) => (
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

  return (
    <Box>
      <Flex justify="space-between" align="center" mt="24px" mx="15px">
        <Text fontSize="m" fontWeight="bold" color="gray.800">
          Top 5 Inovator Terbaik
        </Text>
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
              <LabelList dataKey="name" position="top" fontSize="10px" />
              <LabelList dataKey="rank" content={<CustomLabel x={0} y={0} width={0} value={""} />} />
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
        <TableContainer maxWidth="100%" width="auto" borderRadius="md">
          <Table variant="simple" size="sm">
            <Thead bg="#C6D8D0">
              <Tr>
                <Th p={3} fontSize="8px" textAlign="center">No</Th>
                <Th p={1} fontSize="8px" textAlign="center">Nama Inovator</Th>
                <Th p={1} fontSize="8px" textAlign="center">Jumlah Inovasi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentData.map((row) => (
                <Tr key={row.no}>
                  <Td p={1} fontSize="8px" textAlign="center" fontWeight="bold">{row.no}</Td>
                  <Td p={1} fontSize="8px" textAlign="center">{row.namaInovator}</Td>
                  <Td p={1} fontSize="8px" textAlign="center">{row.jumlahInovasi}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
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
