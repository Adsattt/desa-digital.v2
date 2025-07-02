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
  Spinner,
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
} from "./_detailVillagesInnovationStyle";

import downloadIcon from "../../../../assets/icons/icon-download.svg";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  getFirestore,
  collection,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";

interface VillageInnovation {
  namaDesa: string;
  namaInovasi: string;
  namaInovator: string;
  tahunPengajuan: number;
}

interface DetailVillagesProps {
  selectedNamaDesa: string | null;
}

const DetailVillages = ({ selectedNamaDesa }: DetailVillagesProps) => {
  const [data, setData] = useState<VillageInnovation[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const db = getFirestore();

  useEffect(() => {
    if (!selectedNamaDesa) {
      setData([]);
      setCurrentPage(1);
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      try {
        // Fetch all documents from the three collections
        const menerapkanSnapshot = await getDocs(collection(db, "menerapkanInovasi"));
        const inovasiSnapshot = await getDocs(collection(db, "inovasi"));
        const profilInovatorSnapshot = await getDocs(collection(db, "profilInovator"));

        // Map docs to arrays of objects
        const menerapkanArr = menerapkanSnapshot.docs.map((doc) => doc.data());
        const inovasiArr = inovasiSnapshot.docs.map((doc) => doc.data());
        const profilInovatorArr = profilInovatorSnapshot.docs.map((doc) => doc.data());

        // Filter menerapkanInovasi by selectedNamaDesa
        const filteredMenerapkan = menerapkanArr.filter(
          (m) => m.namaDesa === selectedNamaDesa
        );

        // Join data: for each filtered menerapkan, find matching inovasi and profilInovator
        const joinedData: VillageInnovation[] = [];

        filteredMenerapkan.forEach((m) => {
          const inov = inovasiArr.find((i) => i.namaInovasi === m.namaInovasi);
          if (inov) {
            const profil = profilInovatorArr.find(
              (p) => p.namaInovator === inov.namaInovator
            );
            if (profil) {
              joinedData.push({
                namaDesa: m.namaDesa,
                namaInovasi: m.namaInovasi,
                namaInovator: inov.namaInovator,
                tahunPengajuan: m.tahunPengajuan,
              });
            }
          }
        });

        setData(joinedData);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error fetching DetailVillages data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedNamaDesa, db]);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const handleDownload = () => {
    if (data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Detail Villages");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blobData = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blobData, `detail_villages_${selectedNamaDesa}.xlsx`);
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

  if (!selectedNamaDesa) {
    return (
      <Box p={4} maxW="100%" mx="auto">
        <Text {...titleStyle}>
          Silakan pilih Desa dari tabel sebelah untuk melihat detailnya
        </Text>
      </Box>
    );
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" height="150px">
        <Spinner size="lg" />
      </Flex>
    );
  }

  if (data.length === 0) {
    return (
      <Box p={4} maxW="100%" mx="auto">
        <Text {...titleStyle}>Tidak ada data untuk Desa Dampingan dari {selectedNamaDesa}</Text>
      </Box>
    );
  }

  return (
    <Box p={4} maxW="100%" mx="auto">
      <Flex justify="space-between" align="center" mb={2}>
        <Text {...titleStyle}>Detail Inovasi untuk {selectedNamaDesa}</Text>
        <Flex align="center">
          <Image
            src={downloadIcon}
            alt="Download"
            boxSize="16px"
            cursor="pointer"
            ml={2}
            onClick={handleDownload}
          />
        </Flex>
      </Flex>

      <TableContainer {...tableContainerStyle}>
        <Table variant="simple" size="sm" sx={{ tableLayout: "fixed" }}>
          <Thead>
            <Tr>
              <Th sx={tableHeaderStyle}>Nama Desa</Th>
              <Th sx={tableHeaderStyle}>Nama Inovasi</Th>
              <Th sx={tableHeaderStyle}>Nama Inovator</Th>
              <Th sx={tableHeaderStyle}>Tahun Pengajuan</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentData.map((item, idx) => (
              <Tr key={idx}>
                <Td sx={tableCellStyle}>{item.namaDesa}</Td>
                <Td sx={tableCellStyle}>{item.namaInovasi}</Td>
                <Td sx={tableCellStyle}>{item.namaInovator}</Td>
                <Td sx={tableCellStyle}>{item.tahunPengajuan}</Td>
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

          {getPageNumbers().map((page, idx) =>
            page === "..." ? (
              <Box key={`ellipsis-${idx}`} sx={paginationEllipsisStyle}>
                ...
              </Box>
            ) : (
              <Button
                key={`page-${page}`}
                onClick={() => goToPage(Number(page))}
                {...(currentPage === page ? paginationActiveButtonStyle : paginationButtonStyle)}
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

export default DetailVillages;