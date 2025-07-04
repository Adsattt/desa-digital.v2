import React, { useState, useEffect } from 'react';
import {
  Box, Text, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Flex, Button, Image, Menu, MenuButton, MenuList, MenuItem, IconButton
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { collection, getDocs, query, where, getFirestore } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import downloadIcon from "../../../../assets/icons/icon-download.svg";

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
} from './_detailInnovationsVillageStyle';

interface InnovationDetail {
  namaInovasi: string;
  tanggalPengajuan: string;
}

interface DetailInnovationsProps {
  innovationId: string;
  namaDesa: string;
  onBack: () => void;
}

const DetailInnovations: React.FC<DetailInnovationsProps> = ({
  innovationId,
  namaDesa,
  onBack,
}) => {
  const [innovations, setInnovations] = useState<InnovationDetail[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const db = getFirestore(getApp());

  useEffect(() => {
    const fetchInnovations = async () => {
      try {
        const inovationsQuery = query(
          collection(db, 'menerapkanInovasi'),
          where('inovasiId', '==', innovationId)
        );
        const innovationsSnapshot = await getDocs(inovationsQuery);

        const innovationsData: InnovationDetail[] = innovationsSnapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            namaInovasi: data.namaInovasi || 'Tidak tersedia',
            tanggalPengajuan: data.tanggalPengajuan || 'Tidak tersedia',
          };
        });

        setInnovations(
          innovationsData.sort((a, b) => a.namaInovasi.localeCompare(b.namaInovasi))
        );

      } catch (error) {
        console.error('Error fetching innovations:', error);
      }
    };

    fetchInnovations();
  }, [db, innovationId]);

  const totalPages = Math.ceil(innovations.length / itemsPerPage);
  const currentData = innovations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // ===== Export to PDF function =====
  const exportToPDF = () => {
    if (innovations.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text(`Daftar Inovasi ${namaDesa}`, 14, 20);

    const headers = [["No", "Nama Inovasi", "Tahun Pengajuan"]];
    const rows = innovations.map((item, index) => [
      index + 1,
      item.namaInovasi,
      item.tanggalPengajuan,
    ]);

    autoTable(doc, {
      startY: 30,
      head: headers,
      body: rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save(`daftar_inovasi_${namaDesa}.pdf`);
  };

  // ===== Export to Excel function =====
  const exportToExcel = () => {
    if (innovations.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    const worksheetData = [
      ["No", "Nama Inovasi", "Tahun Pengajuan"],
      ...innovations.map((item, index) => [
        index + 1,
        item.namaInovasi,
        item.tanggalPengajuan,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Inovasi");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });

    saveAs(blob, `daftar_inovasi_${namaDesa}.xlsx`);
  };

  return (
    <Box p={4} maxW="100%" mx="auto">
      <Flex justify="space-between" align="center" mb={4}>
        <Text sx={titleStyle}>
          Daftar Inovasi {namaDesa}
        </Text>
            <Menu>
            <MenuButton
                as={IconButton}
                aria-label="Download options"
                icon={<Image src={downloadIcon} alt="Download" boxSize="16px" />}
                variant="ghost"
            />
            <MenuList>
                <MenuItem onClick={exportToPDF}>Download PDF</MenuItem>
                <MenuItem onClick={exportToExcel}>Download Excel</MenuItem>
        </MenuList>
        </Menu>    
      </Flex>

      <TableContainer sx={tableContainerStyle}>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th sx={tableHeaderStyle} width="20%">No</Th>
              <Th sx={tableHeaderStyle} width="30%">Nama Inovasi</Th>
              <Th sx={tableHeaderStyle}>Tahun Pengajuan</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentData.map((item, index) => (
              <Tr key={index}>
                <Td sx={tableCellStyle}>{(currentPage - 1) * itemsPerPage + index + 1}</Td>
                <Td sx={tableCellStyle}>{item.namaInovasi}</Td>
                <Td sx={tableCellStyle}>{item.tanggalPengajuan}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Flex sx={paginationContainerStyle}>
          <Button
            onClick={() => goToPage(Math.max(1, currentPage - 1))}
            isDisabled={currentPage === 1}
            {...paginationButtonStyle}
            leftIcon={<ChevronLeftIcon />}
            mr={2}
          >
            Sebelumnya
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              onClick={() => goToPage(page)}
              {...(page === currentPage ? paginationActiveButtonStyle : paginationButtonStyle)}
              mx={1}
            >
              {page}
            </Button>
          ))}

          <Button
            onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
            isDisabled={currentPage === totalPages}
            {...paginationButtonStyle}
            rightIcon={<ChevronRightIcon />}
            ml={2}
          >
            Berikutnya
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export default DetailInnovations;