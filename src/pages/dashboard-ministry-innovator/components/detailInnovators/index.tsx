import { useEffect, useState } from "react";
import {
  Text,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
  Button,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  titleStyle,
  tableHeaderStyle,
  tableCellStyle,
  tableContainerStyle,
  paginationContainerStyle,
  paginationButtonStyle,
  paginationActiveButtonStyle,
  paginationEllipsisStyle,
} from "./_detailInnovatorsStyle";

import downloadIcon from "../../../../assets/icons/icon-download.svg";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface InnovatorData {
  id: string;
  namaInovator: string;
  jumlahInovasi: number;
  jumlahDesaDampingan: number;
}

interface DetailInnovatorsProps {
  kategoriInovator: string | null;
  onSelectInovator: (namaInovator: string) => void;
}

const DetailInnovators = ({ kategoriInovator, onSelectInovator }: DetailInnovatorsProps) => {
  const [data, setData] = useState<InnovatorData[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchData = async () => {
    setLoading(true);
    const db = getFirestore();
    let q;

    if (kategoriInovator) {
      q = query(
        collection(db, "profilInovator"),
        where("kategoriInovator", "==", kategoriInovator)
      );
    } else {
      q = query(collection(db, "profilInovator"));
    }

    try {
      const snapshot = await getDocs(q);
      const results: InnovatorData[] = [];

      snapshot.forEach((doc) => {
        const d = doc.data();
        results.push({
          id: doc.id,
          namaInovator: d.namaInovator || "-",
          jumlahInovasi: d.jumlahInovasi || 0,
          jumlahDesaDampingan: d.jumlahDesaDampingan || 0,
        });
      });

      setData(results);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching profilInovator data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [kategoriInovator]);

  const goToPage = (page: number) => setCurrentPage(page);

  const handleDownloadPDF = () => {
    if (!data.length) return;

    const doc = new jsPDF();
    const title = kategoriInovator
      ? `Daftar Inovator: Kategori "${kategoriInovator}"`
      : "Daftar Inovator";

    const headers = ["No", "Nama Inovator", "Jumlah Inovasi", "Jumlah Desa Dampingan"];
    const rows = data.map((item, index) => [
      index + 1,
      item.namaInovator,
      item.jumlahInovasi,
      item.jumlahDesaDampingan,
    ]);

    doc.text(title, 14, 15);
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [33, 150, 243] },
    });

    doc.save(`Inovator_${kategoriInovator || "semua"}.pdf`);
  };

  const handleDownloadXLSX = () => {
    if (!data.length) return;

    const worksheetData = data.map((item, index) => ({
      No: index + 1,
      "Nama Inovator": item.namaInovator,
      "Jumlah Inovasi": item.jumlahInovasi,
      "Jumlah Desa Dampingan": item.jumlahDesaDampingan,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inovator");

    const filename = `Inovator_${kategoriInovator || "semua"}.xlsx`;
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(dataBlob, filename);
  };

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      const left = Math.max(currentPage - 1, 1);
      const right = Math.min(currentPage + 1, totalPages);
      const showLeftDots = left > 2;
      const showRightDots = right < totalPages - 1;

      if (!showLeftDots && showRightDots) {
        for (let i = 1; i <= 3; i++) pageNumbers.push(i);
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (showLeftDots && !showRightDots) {
        pageNumbers.push(1, "...");
        for (let i = totalPages - 2; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1, "...");
        for (let i = left; i <= right; i++) pageNumbers.push(i);
        pageNumbers.push("...", totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <Box p={4} maxW="100%" mx="auto">
      <Flex justify="space-between" align="center" mb={2}>
        <Text {...titleStyle}>
          {kategoriInovator
            ? `Daftar Inovator: Kategori "${kategoriInovator}"`
            : "Daftar Inovator"}
        </Text>
        <Menu>
          <MenuButton as={Button} variant="ghost" size="sm" px={2} py={1}>
            <Image src={downloadIcon} alt="Download" boxSize="16px" />
          </MenuButton>
          <MenuList>
            <MenuItem onClick={handleDownloadPDF}>Download PDF</MenuItem>
            <MenuItem onClick={handleDownloadXLSX}>Download Excel</MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      {loading ? (
        <Text p={4}>Loading data...</Text>
      ) : data.length === 0 ? (
        <Text p={4}>No data found for this category.</Text>
      ) : (
        <>
          <TableContainer {...tableContainerStyle}>
            <Table variant="simple" size="sm" sx={{ tableLayout: "fixed" }}>
              <Thead>
                <Tr>
                  <Th sx={tableHeaderStyle} width="7%">No</Th>
                  <Th sx={tableHeaderStyle} width="35%">Nama Inovator</Th>
                  <Th sx={tableHeaderStyle}>Jumlah Inovasi</Th>
                  <Th sx={tableHeaderStyle}>Jumlah Desa Dampingan</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentData.map((item, index) => (
                  <Tr
                    key={item.id}
                    onClick={() => onSelectInovator(item.namaInovator)}
                    _hover={{ backgroundColor: "gray.100", cursor: "pointer" }}
                  >
                    <Td sx={tableCellStyle}>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </Td>
                    <Td sx={tableCellStyle}>{item.namaInovator}</Td>
                    <Td sx={tableCellStyle}>{item.jumlahInovasi}</Td>
                    <Td sx={tableCellStyle}>{item.jumlahDesaDampingan}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Flex sx={paginationContainerStyle}>
              <Button
                aria-label="Previous page"
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                isDisabled={currentPage === 1}
                {...paginationButtonStyle}
              >
                <ChevronLeftIcon />
              </Button>

              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <Box key={`ellipsis-${index}`} sx={paginationEllipsisStyle}>
                    ...
                  </Box>
                ) : (
                  <Button
                    key={`page-${page}`}
                    onClick={() => goToPage(Number(page))}
                    {...paginationButtonStyle}
                    {...(page === currentPage ? paginationActiveButtonStyle : {})}
                  >
                    {page}
                  </Button>
                )
              )}

              <Button
                aria-label="Next page"
                onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                isDisabled={currentPage === totalPages}
                {...paginationButtonStyle}
              >
                <ChevronRightIcon />
              </Button>
            </Flex>
          )}
        </>
      )}
    </Box>
  );
};

export default DetailInnovators;