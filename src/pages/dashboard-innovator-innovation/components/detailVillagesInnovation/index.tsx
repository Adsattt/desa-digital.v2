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
} from './_detailVillagesInnovationStyle';

interface VillageDetail {
  namaDesa: string;
  tanggalPengajuan: string;
}

interface DetailVillagesProps {
  innovationId: string;
  namaInovasi: string;
  onBack: () => void;
}

const DetailVillages: React.FC<DetailVillagesProps> = ({
  innovationId,
  namaInovasi,
  onBack,
}) => {
  const [villages, setVillages] = useState<VillageDetail[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const db = getFirestore(getApp());

  useEffect(() => {
    const fetchVillages = async () => {
      try {
        const villagesQuery = query(
          collection(db, 'menerapkanInovasi'),
          where('inovasiId', '==', innovationId)
        );
        const villagesSnapshot = await getDocs(villagesQuery);

        const villagesData: VillageDetail[] = villagesSnapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            namaDesa: data.namaDesa || 'Tidak tersedia',
            tanggalPengajuan: data.tanggalPengajuan || 'Tidak tersedia',
          };
        });

        setVillages(
          villagesData.sort((a, b) => a.namaDesa.localeCompare(b.namaDesa))
        );

      } catch (error) {
        console.error('Error fetching villages:', error);
      }
    };

    fetchVillages();
  }, [db, innovationId]);

  const totalPages = Math.ceil(villages.length / itemsPerPage);
  const currentData = villages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // ===== Export to PDF function =====
  const exportToPDF = () => {
    if (villages.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text(`Daftar Desa ${namaInovasi}`, 14, 20);

    const headers = [["No", "Nama Desa", "Tahun Pengajuan"]];
    const rows = villages.map((item, index) => [
      index + 1,
      item.namaDesa,
      item.tanggalPengajuan,
    ]);

    autoTable(doc, {
      startY: 30,
      head: headers,
      body: rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save(`daftar_desa_${namaInovasi}.pdf`);
  };

  // ===== Export to Excel function =====
  const exportToExcel = () => {
    if (villages.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    const worksheetData = [
      ["No", "Nama Desa", "Tahun Pengajuan"],
      ...villages.map((item, index) => [
        index + 1,
        item.namaDesa,
        item.tanggalPengajuan,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Desa");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });

    saveAs(blob, `daftar_desa_${namaInovasi}.xlsx`);
  };

  return (
    <Box p={4} maxW="100%" mx="auto">
      <Flex justify="space-between" align="center" mb={4}>
        <Text sx={titleStyle}>
          {namaInovasi ? `Daftar Desa ${namaInovasi}` : "Daftar Desa"}
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

      {!namaInovasi && (
        <Text fontSize="sm" color="gray.500" mt={1}>
          Pilih baris pada tabel Daftar Inovasi untuk melihat data
        </Text>
      )}

      <TableContainer sx={tableContainerStyle}>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th sx={tableHeaderStyle} width="20%">No</Th>
              <Th sx={tableHeaderStyle} width="30%">Nama Desa</Th>
              <Th sx={tableHeaderStyle}>Tahun Pengajuan</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentData.map((item, index) => (
              <Tr key={index}>
                <Td sx={tableCellStyle}>{(currentPage - 1) * itemsPerPage + index + 1}</Td>
                <Td sx={tableCellStyle}>{item.namaDesa}</Td>
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

export default DetailVillages;