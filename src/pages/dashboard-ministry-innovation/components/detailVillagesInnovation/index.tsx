import { useEffect, useState } from "react";
import {
  Box, Flex, Text, Table, Thead, Tbody, Tr, Th, Td,
  TableContainer, Menu, MenuButton, MenuList, MenuItem, Image
} from "@chakra-ui/react";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import {
  titleStyle, tableHeaderStyle, tableCellStyle,
  tableContainerStyle, paginationContainerStyle,
  paginationButtonStyle, paginationActiveButtonStyle,
  paginationEllipsisStyle
} from "./_detailVillagesInnovationStyle";
import downloadIcon from "../../../../assets/icons/icon-download.svg";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface DetailVillagesInnovationProps {
  selectedInovasi: string;
}

interface VillageRecord {
  namaInovasi: string;
  namaInovator: string;
  namaDesa: string;
  tanggalPengajuan: string;
}

const DetailVillagesInnovation = ({ selectedInovasi }: DetailVillagesInnovationProps) => {
  const [data, setData] = useState<VillageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const db = getFirestore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Get inovasi document matching selectedInovasi
        const inovasiSnap = await getDocs(query(
          collection(db, "inovasi"),
          where("namaInovasi", "==", selectedInovasi)
        ));

        if (inovasiSnap.empty) {
          setData([]);
          return;
        }

        const inovasiDoc = inovasiSnap.docs[0];
        const inovatorName = inovasiDoc.data().namaInovator;

        // 2. Confirm inovator exists in profilInovator
        const profilSnap = await getDocs(query(
          collection(db, "profilInovator"),
          where("namaInovator", "==", inovatorName)
        ));

        if (profilSnap.empty) {
          setData([]);
          return;
        }

        // 3. Get all menerapkanInovasi where namaInovasi == selectedInovasi
        const implementSnap = await getDocs(query(
          collection(db, "menerapkanInovasi"),
          where("namaInovasi", "==", selectedInovasi)
        ));

        const records: VillageRecord[] = implementSnap.docs.map(doc => ({
          namaInovasi: selectedInovasi,
          namaInovator: inovatorName,
          namaDesa: doc.data().namaDesa,
          tanggalPengajuan: doc.data().tanggalPengajuan,
        }));

        setData(records);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedInovasi) {
      fetchData();
    } else {
      setData([]);
    }
  }, [selectedInovasi, db]);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // PDF export
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
    doc.text("Diambil dari: Daftar Desa Digital per Inovasi", 14, 22);
    doc.text(`Diunduh pada: ${downloadDate}`, 190, 22, { align: "right" });

    // Reset styles
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");

    let y = 42;
    doc.text(`Daftar Desa Digital dari Inovasi: ${selectedInovasi || ""}`, 14, y);
    y += 6;

    // Prepare table data
    const tableColumn = ["No", "Nama Inovasi", "Nama Inovator", "Nama Desa", "Tanggal Pengajuan"];
    const tableRows = data.map((item, index) => [
      index + 1,
      item.namaInovasi,
      item.namaInovator,
      item.namaDesa,
      item.tanggalPengajuan,
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
        4: { cellWidth: 30 },  // Tanggal Pengajuan
      },
    } as any);

    doc.save(`Detail_Desa_Digital_${selectedInovasi || "data"}.pdf`);
  };

  // XLSX export
  const handleDownloadXLSX = () => {
    const worksheetData = [
      ["Nama Inovasi", "Inovator", "Nama Desa", "Tanggal Pengajuan"],
      ...data.map(item => [
        item.namaInovasi,
        item.namaInovator,
        item.namaDesa,
        item.tanggalPengajuan
      ])
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Desa Digital");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, `Detail_Desa_Digital_${selectedInovasi}.xlsx`);
  };

  // Pagination numbers generator (simplified here)
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
        pageNumbers.push(1, 2, 3, "...", totalPages);
      } else if (showLeftDots && !showRightDots) {
        pageNumbers.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else if (showLeftDots && showRightDots) {
        pageNumbers.push(1, "...", left, currentPage, right, "...", totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <Box p={4} maxW="100%" mx="auto">
      <Flex justify="space-between" align="center" mb={2}>
        <Text {...titleStyle}>
          Daftar Desa Digital dari {selectedInovasi || '...'}
        </Text>
        <Flex>
          {selectedInovasi && (
            <Menu>
              <MenuButton>
                <Image
                  src={downloadIcon}
                  alt="Download"
                  boxSize="16px"
                  cursor="pointer"
                />
              </MenuButton>
              <MenuList>
                <MenuItem onClick={handleDownloadPDF}>Download PDF</MenuItem>
                <MenuItem onClick={handleDownloadXLSX}>Download Excel</MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>
      </Flex>

      {!data.length ? (
        <Text fontStyle="italic" color="gray.500" textAlign="center" mt={6}>
          Pilih baris pada tabel untuk melihat data tabel
        </Text>
      ) : loading ? (
        <Text>Loading...</Text>
      ) : (
        <>
          <TableContainer {...tableContainerStyle}>
            <Table variant="simple" size="sm" sx={{ tableLayout: "fixed" }}>
              <Thead>
                <Tr>
                  <Th sx={tableHeaderStyle}>Nama Inovasi</Th>
                  <Th sx={tableHeaderStyle}>Inovator</Th>
                  <Th sx={tableHeaderStyle}>Nama Desa</Th>
                  <Th sx={tableHeaderStyle}>Tanggal Pengajuan</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentData.map((item, index) => (
                  <Tr key={index}>
                    <Td sx={tableCellStyle}>{item.namaInovasi}</Td>
                    <Td sx={tableCellStyle}>{item.namaInovator}</Td>
                    <Td sx={tableCellStyle}>{item.namaDesa}</Td>
                    <Td sx={tableCellStyle}>{item.tanggalPengajuan}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Flex sx={paginationContainerStyle}>
              {/* Pagination buttons logic here */}
            </Flex>
          )}
        </>
      )}
    </Box>
  );
};

export default DetailVillagesInnovation;