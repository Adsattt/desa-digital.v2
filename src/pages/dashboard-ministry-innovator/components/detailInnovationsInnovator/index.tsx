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

// Static data
const implementationData: Implementation[] = [
  { namaInovasi: "eFeeder", inovator: "eFishery", namaDesa: "Desa Sukasari", tahun: 2017 },
  { namaInovasi: "Habibi Garden", inovator: "Habibi Garden", namaDesa: "Desa Malabar", tahun: 2018 },
  { namaInovasi: "FishGo", inovator: "FishGo", namaDesa: "Desa Babakan", tahun: 2019 },
  { namaInovasi: "Petani Muda Keren (PMK)", inovator: "AA Gede Gunung", namaDesa: "Desa Sukatani", tahun: 2020 },
  { namaInovasi: "JALA", inovator: "JALA", namaDesa: "Desa Indah", tahun: 2021 },
  { namaInovasi: "Smart Tani", inovator: "AgroTech", namaDesa: "Desa Baranangsiang", tahun: 2022 },
  { namaInovasi: "AgriDrone", inovator: "DroneIndo", namaDesa: "Desa Cilibende", tahun: 2023 },
];

const DetailInnovations = ({ filterInnovator, onSelectVillage }: DetailInnovationsProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredData = implementationData.filter(
    (item) => item.inovator === filterInnovator
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
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
    doc.setFontSize(12);
    doc.text(`Daftar Desa Digital dari ${filterInnovator}`, 14, 16);

    const tableData = filteredData.map(item => [
      item.namaInovasi,
      item.inovator,
      item.namaDesa,
      item.tahun.toString(),
    ]);

    autoTable(doc, {
      startY: 22,
      head: [["Nama Inovasi", "Inovator", "Nama Desa", "Tahun"]],
      body: tableData,
      styles: { fontSize: 10 },
    });

    doc.save(`data_inovasi_${filterInnovator}.pdf`);
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
    <Box p={4} maxW="100%" mx="auto">
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
              <Th sx={tableHeaderStyle}>Inovator</Th>
              <Th sx={tableHeaderStyle}>Nama Inovasi</Th>
              <Th sx={tableHeaderStyle}>Nama Desa</Th>
              <Th sx={tableHeaderStyle}>Tahun Penerapan</Th>
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
                <Td sx={tableCellStyle}>{item.inovator}</Td>
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