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
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  titleStyle,
  tableHeaderStyle,
  tableCellStyle,
  tableContainerStyle,
  paginationContainerStyle,
  paginationButtonStyle,
  paginationActiveButtonStyle,
  paginationEllipsisStyle,
} from "./_detailInnovationsVillageStyle";
import downloadIcon from '../../../../assets/icons/icon-download.svg';

interface Implementation {
  namaDesa: string;
  namaInovasi: string;
  namaInovator: string;
  tahun: string;
  no: number;
}

interface Props {
  selectedVillage: string | null;
  hasRowClicked: boolean;
}

const DetailInnovationsVillage = ({ selectedVillage, hasRowClicked }: Props) => {
  const [data, setData] = useState<Implementation[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!selectedVillage) {
      setData([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const db = getFirestore();

        // 1. Query menerapkanInovasi by selectedVillage
        const menerapkanRef = collection(db, "menerapkanInovasi");
        const q1 = query(menerapkanRef, where("namaDesa", "==", selectedVillage));
        const snapshot1 = await getDocs(q1);

        if (snapshot1.empty) {
          setData([]);
          setLoading(false);
          return;
        }

        // Extract unique namaInovasi
        const inovasiNames = Array.from(
          new Set(snapshot1.docs.map((doc) => doc.data().namaInovasi))
        );

        // 2. Query inovasi collection for namaInovasi in batches
        const inovasiRef = collection(db, "inovasi");
        const chunks: string[][] = [];
        for (let i = 0; i < inovasiNames.length; i += 10) {
          chunks.push(inovasiNames.slice(i, i + 10));
        }

        const inovasiDocs: any[] = [];
        for (const chunk of chunks) {
          const q2 = query(inovasiRef, where("namaInovasi", "in", chunk));
          const snap = await getDocs(q2);
          inovasiDocs.push(...snap.docs);
        }

        // Map namaInovasi => namaInovator
        const inovasiMap = new Map<string, string>();
        inovasiDocs.forEach((doc) => {
          const d = doc.data();
          inovasiMap.set(d.namaInovasi, d.namaInovator || "Unknown");
        });

        // 3. Combine data without date formatting, use tanggalPengajuan as tahun directly
        const combinedList = snapshot1.docs.map((doc, idx) => {
          const d = doc.data();

          return {
            no: idx + 1,
            namaDesa: d.namaDesa,
            namaInovasi: d.namaInovasi,
            namaInovator: inovasiMap.get(d.namaInovasi) || "Unknown",
            tahun: d.tanggalPengajuan, // directly use this field
          };
        });

        setData(combinedList);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error fetching innovation data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [selectedVillage]);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const currentData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // PDF download handler
  const handleDownloadPDF = () => {
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
    doc.text("Diambil dari: Daftar Inovasi Desa", 14, 22);
    doc.text(`Diunduh pada: ${downloadDate}`, 190, 22, { align: "right" });

    // Reset styles
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");

    let y = 42;
    doc.text(`Daftar Inovasi Desa ${selectedVillage || ""}`, 14, y);
    y += 6;

    // Prepare table data
    const tableColumn = ["No", "Nama Desa", "Nama Inovasi", "Nama Inovator", "Tahun Pengajuan"];
    const tableRows = data.map((item, index) => [
      index + 1,
      item.namaDesa,
      item.namaInovasi,
      item.namaInovator,
      item.tahun,
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
        1: { cellWidth: 30 },  // Nama Desa
        2: { cellWidth: 50 },  // Nama Inovasi
        3: { cellWidth: 60 },  // Nama Inovator
        4: { cellWidth: 25 },  // Tahun
      },
    } as any);

    doc.save(`Inovasi_Desa_${selectedVillage || "data"}.pdf`);
  };
  
  // XLSX download handler
  const handleDownloadXLSX = () => {
    const wsData = [
      ["No", "Nama Desa", "Nama Inovasi", "Nama Inovator", "Tahun"],
      ...data.map((item) => [
        item.no,
        item.namaDesa,
        item.namaInovasi,
        item.namaInovator,
        item.tahun,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "InovasiDesa");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, `Inovasi_Desa_${selectedVillage || "data"}.xlsx`);
  };

  // Pagination numbers logic
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

      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

      if (!shouldShowLeftDots && shouldShowRightDots) {
        for (let i = 1; i <= 3; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (shouldShowLeftDots && !shouldShowRightDots) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else if (shouldShowLeftDots && shouldShowRightDots) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <Box p={4} maxW="100%" mx="auto">
      <Flex justify="space-between" align="center" mb={2}>
        <Text {...titleStyle}>
          Daftar Inovasi Desa {selectedVillage ? `${selectedVillage}` : ""}
        </Text>

        <Flex justify="flex-end" align="center">
          <Menu>
            <MenuButton display="flex" alignItems="center" mr={2}>
              <img src={downloadIcon} alt="Download" style={{ width: 16, height: 16 }} />
            </MenuButton>
            <MenuList>
              <MenuItem onClick={handleDownloadPDF}>Download PDF</MenuItem>
              <MenuItem onClick={handleDownloadXLSX}>Download Excel</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      {loading ? (
        <Flex justify="center" align="center" height="150px">
          <Spinner size="lg" />
        </Flex>
      ) : !hasRowClicked ? (
        <Text fontSize="12" color="gray.500" mt={1} fontStyle="italic">
          Pilih baris pada tabel untuk melihat data tabel
        </Text>
      ) : data.length === 0 ? (
        <Text fontSize="12" color="gray.500" mt={1} fontStyle="italic">
          Data tidak tersedia
        </Text>
      ) : (
        <>
          <TableContainer {...tableContainerStyle}>
            <Table variant="simple" size="sm" sx={{ tableLayout: "fixed" }}>
              <Thead>
                <Tr>
                  <Th sx={tableHeaderStyle} width="7%">
                    No
                  </Th>
                  <Th sx={tableHeaderStyle} width="22%">
                    Nama Desa
                  </Th>
                  <Th sx={tableHeaderStyle} width="25%">
                    Nama Inovasi
                  </Th>
                  <Th sx={tableHeaderStyle} width="25%">
                    Nama Inova-tor
                  </Th>
                  <Th sx={tableHeaderStyle} width="20%">
                    Tahun
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentData.map((item, index) => (
                  <Tr key={index}>
                    <Td sx={tableCellStyle}>{item.no}</Td>
                    <Td sx={tableCellStyle}>{item.namaDesa}</Td>
                    <Td sx={tableCellStyle}>{item.namaInovasi}</Td>
                    <Td sx={tableCellStyle}>{item.namaInovator}</Td>
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

export default DetailInnovationsVillage;