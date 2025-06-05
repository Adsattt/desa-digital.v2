import { useState, useEffect } from "react";
import {
  Text, Box, Flex, Button, Image, Table,
  Thead, Tbody, Tr, Th, Td, TableContainer,
  Menu, MenuButton, MenuList, MenuItem
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
} from "./_categoryInnovationStyle";
import downloadIcon from "../../../../assets/icons/icon-download.svg";

import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Implementation {
  namaInovasi: string;
  kategoriInovasi: string;
  tahunDibuat: number;
}

const TableInnovator = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const userName = user?.displayName || "Inovator";
  const [currentPage, setCurrentPage] = useState(1);
  const [implementationData, setImplementationData] = useState<Implementation[]>([]);
  // const [userName, setUserName] = useState<string>("Anda");
  const itemsPerPage = 5;

  const totalPages = Math.ceil(implementationData.length / itemsPerPage);
  const currentData = implementationData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => setCurrentPage(page);

  const getPageNumbers = () => {
    const pageNumbers = [];
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

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Daftar Inovasi ${userName}`, 14, 10);
    autoTable(doc, {
      head: [["No", "Nama Inovasi", "Kategori Inovasi", "Tahun Dibuat"]],
      body: implementationData.map((item, idx) => [
        idx + 1,
        item.namaInovasi,
        item.kategoriInovasi,
        item.tahunDibuat,
      ]),
    });
    doc.save("daftar-inovasi.pdf");
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      implementationData.map((item, idx) => ({
        No: idx + 1,
        "Nama Inovasi": item.namaInovasi,
        "Kategori Inovasi": item.kategoriInovasi,
        "Tahun Dibuat": item.tahunDibuat,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inovasi");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "daftar-inovasi.xlsx");
  };

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth();
      const db = getFirestore();
      const currentUser = auth.currentUser;

      if (!currentUser) return console.warn("User not authenticated");

      try {
        const profilRef = collection(db, "profilInovator");
        const qProfil = query(profilRef, where("userId", "==", currentUser.uid));
        const profilSnap = await getDocs(qProfil);

        if (profilSnap.empty) return console.warn("No profilInovator found");

        const profilDoc = profilSnap.docs[0];
        const profilInovatorId = profilDoc.id;
        // const profilData = profilDoc.data();
        // setUserName(profilData.namaLengkap || "Anda");

        const inovasiRef = collection(db, "inovasi");
        const qInovasi = query(inovasiRef, where("inovatorId", "==", profilInovatorId));
        const inovasiSnap = await getDocs(qInovasi);

        const fetched: Implementation[] = inovasiSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            namaInovasi: data.namaInovasi || "-",
            kategoriInovasi: data.kategoriInovasi || "-",
            tahunDibuat: data.tahunDibuat || 0,
          };
        });

        setImplementationData(fetched);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Box p={4} maxW="100%" mx="auto">
      <Flex justify="space-between" align="center" mb={2} mt={2}>
        <Text {...titleStyle}>Daftar Inovasi {userName}</Text>
        <Menu>
          <MenuButton>
            <Image src={downloadIcon} alt="Download" boxSize="16px" cursor="pointer" marginRight={2} />
          </MenuButton>
          <MenuList>
            <MenuItem onClick={exportToPDF}>Download PDF</MenuItem>
            <MenuItem onClick={exportToExcel}>Download Excel</MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      <TableContainer {...tableContainerStyle}>
        <Table variant="simple" size="sm" sx={{ tableLayout: "fixed" }}>
          <Thead>
            <Tr>
              <Th sx={tableHeaderStyle} width="10%">No</Th>
              <Th sx={tableHeaderStyle} width="30%">Nama Inovasi</Th>
              <Th sx={tableHeaderStyle} width="35%">Kategori Inovasi</Th>
              <Th sx={tableHeaderStyle} width="25%">Tahun Dibuat</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentData.map((item, index) => (
              <Tr key={index}>
                <Td sx={tableCellStyle}>
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </Td>
                <Td sx={tableCellStyle}>{item.namaInovasi}</Td>
                <Td sx={tableCellStyle}>{item.kategoriInovasi}</Td>
                <Td sx={tableCellStyle}>{item.tahunDibuat}</Td>
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

export default TableInnovator;