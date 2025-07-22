import { useState, useEffect } from "react";
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
  Button,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
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
} from "./_detailInnovationsInnovatorStyle";
import downloadIcon from "../../../../assets/icons/icon-download.svg";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Data type
interface Implementation {
  namaInovasi: string;
  inovator: string;
  namaDesa: string;
  tahun: number;
}

interface DetailInnovationsProps {
  filterInnovator: string;
  onSelectVillage: (namaInovasi: string) => void;
}

const DetailInnovations = ({ filterInnovator, onSelectVillage }: DetailInnovationsProps) => {
  const [implementationData, setImplementationData] = useState<Implementation[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredData = implementationData;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  useEffect(() => {
    const fetchData = async () => {
      const db = getFirestore();

      if (!filterInnovator) return;
      setLoading(true);

      try {
        const innovationsQuery = query(
          collection(db, "innovations"),
          where("namaInnovator", "==", filterInnovator)
        );
        const innovationsSnap = await getDocs(innovationsQuery);
        const innovations = innovationsSnap.docs.map(doc => ({
          id: doc.id,
          namaInovasi: doc.data().namaInovasi,
        }));

        const allData: Implementation[] = [];

        for (const innovation of innovations) {
          const claimQuery = query(
            collection(db, "claimInnovations"),
            where("namaInovasi", "==", innovation.namaInovasi)
          );
          const claimSnap = await getDocs(claimQuery);

          claimSnap.docs.forEach(doc => {
            const data = doc.data();
            const desa = (data.namaDesa || "").replace(/^Desa\s*/i, "");
            const createdAt = data.createdAt?.toDate?.();
            const tahun = createdAt?.getFullYear?.() || 0;

            allData.push({
              namaInovasi: innovation.namaInovasi,
              inovator: filterInnovator,
              namaDesa: desa,
              tahun,
            });
          });
        }

        setImplementationData(allData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterInnovator]);

  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const downloadXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Inovasi");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `data_inovasi_${filterInnovator}.xlsx`);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const downloadDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Green header background
    doc.setFillColor(0, 128, 0);
    doc.rect(0, 0, 1000, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Dokumen Laporan Kementerian", 14, 13);
    doc.text("KMS Inovasi Desa Digital", 190, 13, { align: "right" });

    doc.setFontSize(12);
    doc.text("Diambil dari: Daftar Desa Digital per Inovator", 14, 22);
    doc.text(`Diunduh pada: ${downloadDate}`, 190, 22, { align: "right" });

    // Reset styles
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");

    let y = 42;
    doc.text(`Daftar Desa Digital dari Inovator: ${filterInnovator || ""}`, 14, y);
    y += 6;

    // Prepare table data
    const tableColumn = ["No", "Nama Inovasi", "Nama Inovator", "Nama Desa", "Tahun"];
    const tableRows = filteredData.map((item, index) => [
      index + 1,
      item.namaInovasi,
      item.inovator,
      item.namaDesa,
      item.tahun.toString(),
    ]);

    autoTable(doc, {
      startY: y,
      head: [tableColumn],
      body: tableRows,
      headStyles: {
        fillColor: [0, 128, 0],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 11,
      },
      columnStyles: {
        0: { cellWidth: 15 },  // No
        1: { cellWidth: 45 },  // Nama Inovasi
        2: { cellWidth: 50 },  // Nama Inovator
        3: { cellWidth: 45 },  // Nama Desa
        4: { cellWidth: 25 },  // Tahun
      },
    } as any);

    doc.save(`Detail_Desa_Digital_${filterInnovator || "data"}.pdf`);
  };

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const leftSiblingIndex = Math.max(currentPage - 1, 1);
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages);
      const showLeftDots = leftSiblingIndex > 2;
      const showRightDots = rightSiblingIndex < totalPages - 1;

      if (!showLeftDots && showRightDots) {
        for (let i = 1; i <= 3; i++) pageNumbers.push(i);
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (showLeftDots && !showRightDots) {
        pageNumbers.push(1, "...");
        for (let i = totalPages - 2; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1, "...");
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) pageNumbers.push(i);
        pageNumbers.push("...", totalPages);
      }
    }

    return pageNumbers;
  };

  if (filteredData.length === 0) {
    return (
      <Box p={4} maxW="100%" mx="auto">
        <Text {...titleStyle}>
          Tidak ada data untuk inovator: {filterInnovator}
        </Text>
      </Box>
    );
  }

  return (
    <Box px={4} maxW="100%" mx="auto" mt="10">
      <Flex justify="space-between" align="center" mb={2}>
        <Text {...titleStyle}>
          Daftar Desa Digital dari {filterInnovator}
        </Text>
        <Menu>
          <MenuButton>
            <Image
              src={downloadIcon}
              alt="Download"
              boxSize="16px"
              cursor="pointer"
              ml={2}
            />
          </MenuButton>
          <MenuList fontSize="sm">
            <MenuItem onClick={downloadPDF}>Download PDF</MenuItem>
            <MenuItem onClick={downloadXLSX}>Download Excel</MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      <TableContainer {...tableContainerStyle}>
        <Table variant="simple" size="sm" sx={{ tableLayout: "fixed" }}>
          <Thead>
            <Tr>
              <Th sx={tableHeaderStyle} width="10%">No</Th>
              <Th sx={tableHeaderStyle}>Nama Inovasi</Th>
              <Th sx={tableHeaderStyle}>Nama Desa</Th>
              <Th sx={tableHeaderStyle}>Tahun Klaim</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentData.map((item, index) => (
              <Tr
                key={index}
                cursor="pointer"
                onClick={() => onSelectVillage(item.namaInovasi)}
                _hover={{ bg: "gray.100" }}
              >
                <Td sx={tableCellStyle}>
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </Td>
                <Td sx={tableCellStyle}>{item.namaInovasi}</Td>
                <Td sx={tableCellStyle}>{item.namaDesa}</Td>
                <Td sx={tableCellStyle}>{item.tahun}</Td>
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
              <Box key={`ellipsis-${index}`} sx={paginationEllipsisStyle}>...</Box>
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
    </Box>
  );
};

export default DetailInnovations;