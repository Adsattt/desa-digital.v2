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
  provinsi: string;
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
    doc.text(`Daftar Desa - Kategori: ${selectedCategory}`, 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['No', 'Nama Desa', 'Provinsi', 'IDM']],
      body: sortedData.map((item, i) => [
        i + 1,
        item.namaDesa,
        item.provinsi,
        item.idm,
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
    });
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