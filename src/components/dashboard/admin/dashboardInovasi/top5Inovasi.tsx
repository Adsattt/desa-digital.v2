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
  Icon
} from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from "@chakra-ui/icons";
import * as XLSX from "xlsx";

const ITEMS_PER_PAGE = 5;

const Top5Innovations: React.FC = () => {
  const [chartData, setChartData] = useState<{ name: string; value: number; rank: string; valueAsli: number }[]>([]);
  const [tableData, setTableData] = useState<{ no: number; name: string; count: number }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchInnovations = async () => {
      try {
        const db = getFirestore();
        const innovationsRef = collection(db, "innovations");
        const snapshot = await getDocs(innovationsRef);

        // 🧼 Normalisasi data dari Firestore
        const sortedInnovations = snapshot.docs.map((doc) => {
          const rawName = doc.data().namaInovasi;
          return {
            name:
              typeof rawName === "object" && rawName !== null && "text" in rawName
                ? rawName.text
                : String(rawName),
            count: doc.data().jumlahKlaim ?? 0,
          };
        });

        // 🛠 Debug: cek jika ada yang bukan string
        snapshot.docs.forEach((doc) => {
          const data = doc.data().namaInovasi;
          if (typeof data !== "string") {
            console.warn("⚠️ Nama inovasi bukan string:", data);
          }
        });

        // 🗂 Format for table
        const innovationsSorted = [...sortedInnovations].sort((a, b) => {
            if (b.count !== a.count) return b.count - a.count;
            return a.name.localeCompare(b.name);
          });
        const tableFormatted = innovationsSorted.map((item, index) => ({
          no: index + 1,
          name: item.name,
          count: item.count,
        }));
        setTableData(tableFormatted);
        const top5 = tableFormatted.slice(0, 5);
        const customOrder = [3, 1, 0, 2, 4];
        const customHeights = [20, 40, 50, 35, 15];
        const customRanks = ["4th", "2nd", "1st", "3rd", "5th"];

        const rankedInnovations = customOrder.map((index, rankIndex) => ({
          name: top5[index]?.name || "",
          value: customHeights[rankIndex],
          valueAsli: top5[index]?.count || 0,
          rank: customRanks[rankIndex],
        }));

        setChartData(rankedInnovations);
      } catch (error) {
        console.error("❌ Error fetching innovation data:", error);
      }
    };

    fetchInnovations();
  }, []);

  const totalPages = Math.ceil(tableData.length / ITEMS_PER_PAGE);
  const currentData = tableData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDownload = () => {
    const excelData = tableData.map((item) => ({
      No: item.no,
      "Nama Inovasi": item.name,
      "Jumlah Desa Yang Menerapkan": item.count,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Top Inovasi");
    XLSX.writeFile(workbook, "top_inovasi.xlsx");
  };

  const CustomLabel = ({ x, y, width, value }: { x: number; y: number; width: number; value: string }) => (
    <text x={x + width / 2} y={y + 25} fill="#FFFFFF" fontSize={15} textAnchor="middle" fontWeight="bold">
      {value}
    </text>
  );

  // 🔹 Custom Tooltip for "Total Inovasi"
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
      const data = payload[0].payload;

      return (
        <div style={{ background: "white", padding: "10px", border: "1px solid #ccc" }}>
          <p style={{ margin: 0, fontWeight: "bold" }}>{data.name}</p>
          <p style={{ margin: 0 }}>Total Desa Menerapkan: {data.valueAsli}</p> {/* Menampilkan Total Inovasi */}
        </div>
      );
    }

    return null;
  };

  return (
    <Box>
      {/* 🔹 Header & Download Button */}
      <Flex justify="space-between" align="center" mt="24px" mx="15px">
        <Text fontSize="sm" fontWeight="bold" color="gray.800">
          Top 5 Inovasi Terbaik
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

      {/* 🔹 Bar Chart */}
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
              <LabelList dataKey="name" position="top" fontSize="10px" />
              <LabelList dataKey="rank" content={<CustomLabel x={0} y={0} width={0} value={""} />} />
              {chartData.map((_, index) => (
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
                <Th p={1} fontSize="8px" textAlign="center">Nama Inovasi</Th>
                <Th p={1} fontSize="8px" textAlign="center">Jumlah Desa Yang Menerapkan</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentData.map((row) => (
                <Tr key={row.no}>
                  <Td p={1} fontSize="8px" textAlign="center" fontWeight="bold">{row.no}</Td>
                  <Td p={1} fontSize="8px" textAlign="center">{row.name}</Td>
                  <Td p={1} fontSize="8px" textAlign="center">{row.count}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        {/* 🔹 Pagination */}
        <Flex justify="center" mt={3} gap={2}>
          {(() => {
            const pagesPerBlock = 5;
            const currentBlock = Math.floor((currentPage - 1) / pagesPerBlock);
            const startPage = currentBlock * pagesPerBlock + 1;
            const endPage = Math.min(startPage + pagesPerBlock - 1, totalPages);

            return (
              <>
                {/* Prev icon button */}
                {startPage > 1 && (
                  <Button
                    size="xs"
                    onClick={() => setCurrentPage(startPage - 1)}
                    variant="ghost"
                    p={1}
                  >
                    <Icon as={ChevronLeftIcon} />
                  </Button>
                )}

                {/* Page numbers */}
                {[...Array(endPage - startPage + 1)].map((_, index) => {
                  const page = startPage + index;
                  return (
                    <Button
                      key={page}
                      size="xs"
                      borderRadius="full"
                      bg={currentPage === page ? "gray.800" : "white"}
                      color={currentPage === page ? "white" : "gray.800"}
                      onClick={() => setCurrentPage(page)}
                      _hover={{ bg: "gray.300" }}
                    >
                      {page}
                    </Button>
                  );
                })}

                {/* Next icon button */}
                {endPage < totalPages && (
                  <Button
                    size="xs"
                    onClick={() => setCurrentPage(endPage + 1)}
                    variant="ghost"
                    p={1}
                  >
                    <Icon as={ChevronRightIcon} />
                  </Button>
                )}
              </>
            );
          })()}
        </Flex>
      </Box>
    </Box>
  );
};

export default Top5Innovations;
