import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import {
  Box, Text, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Flex, Button, Image, IconButton, Menu, MenuButton, MenuList, MenuItem
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '@chakra-ui/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import {
  titleStyle,
  tableHeaderStyle,
  tableCellStyle,
  tableContainerStyle,
  paginationContainerStyle,
  paginationButtonStyle,
  paginationActiveButtonStyle,
  paginationEllipsisStyle
} from './_detailVillagesStyle';

import downloadIcon from '../../../../assets/icons/icon-download.svg';

interface Props {
  selectedCategory: string | null;
  onRowClick: (villageName: string) => void;
}

interface Implementation {
  namaDesa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  potensi: string;
  idm: string;
}

const DetailVillages = ({ selectedCategory, onRowClick }: Props) => {
  const [data, setData] = useState<Implementation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedCategory) return;

      setLoading(true);
      const db = getFirestore();
      const desaRef = collection(db, 'profilDesa');
      const q = query(desaRef, where('kategoriDesa', '==', selectedCategory));
      const snapshot = await getDocs(q);
      const list: Implementation[] = snapshot.docs
        .map((doc) => {
          const d = doc.data();
          return {
            namaDesa: d.namaDesa,
            provinsi: d.provinsi,
            kabupaten: d.kabupatenKota,
            kecamatan: d.kecamatan,
            potensi: d.potensi,
            idm: String(d.idm),
          };
        })
        .filter(d => d.namaDesa && d.provinsi && d.idm && d.idm !== 'ND' && d.idm !== '-' && d.idm !== '');

      setData(list);
      setCurrentPage(1);
      setLoading(false);
    };

    fetchData();
  }, [selectedCategory]);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const sortedData = [...data].sort((a, b) =>
    parseFloat(b.idm.replace(',', '.')) - parseFloat(a.idm.replace(',', '.'))
  );
  const currentData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const goToPage = (page: number) => setCurrentPage(page);

  // PDF Download
  const downloadPDF = () => {
    const doc = new jsPDF();
    const downloadDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Green header
    doc.setFillColor(0, 128, 0);
    doc.rect(0, 0, 1000, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Dokumen Laporan Kementerian", 14, 13);
    doc.text("KMS Inovasi Desa Digital", 190, 13, { align: "right" });

    doc.setFontSize(12);
    doc.text("Diambil dari: Daftar Desa Menurut Kategori", 14, 22);
    doc.text(`Diunduh pada: ${downloadDate}`, 190, 22, { align: "right" });

    // Reset text styles
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");

    let y = 42;
    doc.text(`Daftar Desa Berdasarkan Kategori: ${selectedCategory}`, 14, y);
    y += 6;

    const sortedData = [...data];

    autoTable(doc, {
      startY: y,
      head: [["No", "Nama Desa", "Kecamatan", "Kabupaten", "Provinsi", "Potensi Desa", "IDM"]],
      body: sortedData.map((item, i) => [
        i + 1,
        item.namaDesa,
        item.kecamatan,
        item.kabupaten,
        item.provinsi,
        item.potensi,
        item.idm,
      ]),
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
        1: { cellWidth: 25 },  // Nama Desa
        2: { cellWidth: 25 },  // Kecamatan
        3: { cellWidth: 25 },  // Kabupaten
        4: { cellWidth: 25 },  // Provinsi
        5: { cellWidth: 40 },  // Potensi
        6: { cellWidth: 25 },  // IDM
      },
    } as any);

    doc.save(`Daftar_Desa_${selectedCategory}.pdf`);
  };

  // XLSX Download
  const downloadXLSX = () => {
    const wsData = [
      ['No', 'Nama Desa', 'Provinsi', 'IDM'],
      ...sortedData.map((item, i) => [i + 1, item.namaDesa, item.provinsi, item.idm])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Desa');

    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, `Daftar_Desa_${selectedCategory}.xlsx`);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const left = Math.max(currentPage - 1, 1);
    const right = Math.min(currentPage + 1, totalPages);
    const showLeftDots = left > 2;
    const showRightDots = right < totalPages - 1;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else if (!showLeftDots && showRightDots) {
      pageNumbers.push(1, 2, 3, '...', totalPages);
    } else if (showLeftDots && !showRightDots) {
      pageNumbers.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageNumbers.push(1, '...', left, currentPage, right, '...', totalPages);
    }

    return pageNumbers;
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" mb={2}>
        <Box>
          <Text {...titleStyle}>
            Daftar Desa {selectedCategory ? `${selectedCategory}` : ''}
          </Text>
          {!selectedCategory && (
            <Text fontSize="12" color="gray.500" mt={1} fontStyle="italic">
              Pilih kategori pada diagram untuk melihat data tabel
            </Text>
          )}
        </Box>
        {selectedCategory && (
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Download menu"
              icon={<Image src={downloadIcon} alt="Download" boxSize="16px" />}
              variant="ghost"
              _hover={{ bg: 'gray.100' }}
            />
            <MenuList>
              <MenuItem onClick={downloadPDF}>Download PDF</MenuItem>
              <MenuItem onClick={downloadXLSX}>Download XLSX</MenuItem>
            </MenuList>
          </Menu>
        )}
      </Flex>

      {selectedCategory && (
        <>
          {loading ? (
            <Text p={2}>Loading data...</Text>
          ) : (
            <>
              <TableContainer {...tableContainerStyle}>
                <Table variant="simple" size="sm" sx={{ tableLayout: 'fixed' }}>
                  <Thead>
                    <Tr>
                      <Th sx={tableHeaderStyle} width="10%">No</Th>
                      <Th sx={tableHeaderStyle}>Nama Desa</Th>
                      <Th sx={tableHeaderStyle}>Provinsi</Th>
                      <Th sx={tableHeaderStyle}>IDM</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {currentData.map((item, i) => (
                      <Tr
                        key={i}
                        onClick={() => onRowClick(item.namaDesa)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Td sx={tableCellStyle}>{(currentPage - 1) * itemsPerPage + i + 1}</Td>
                        <Td sx={tableCellStyle}>{item.namaDesa}</Td>
                        <Td sx={tableCellStyle}>{item.provinsi}</Td>
                        <Td sx={tableCellStyle}>{item.idm}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              <Flex sx={paginationContainerStyle}>
                <Button onClick={() => goToPage(currentPage - 1)} isDisabled={currentPage === 1} {...paginationButtonStyle}>
                  <ChevronLeftIcon />
                </Button>

                {getPageNumbers().map((page, i) =>
                  page === '...' ? (
                    <Box key={`ellipsis-${i}`} {...paginationEllipsisStyle}>...</Box>
                  ) : (
                    <Button
                      key={`page-${page}`}
                      onClick={() => goToPage(Number(page))}
                      {...paginationButtonStyle}
                      {...(currentPage === page ? paginationActiveButtonStyle : {})}
                    >
                      {page}
                    </Button>
                  )
                )}

                <Button onClick={() => goToPage(currentPage + 1)} isDisabled={currentPage === totalPages} {...paginationButtonStyle}>
                  <ChevronRightIcon />
                </Button>
              </Flex>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default DetailVillages;