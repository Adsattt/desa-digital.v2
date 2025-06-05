import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import {
  Box, Text, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Flex, Button, Image, Menu, MenuButton, MenuList, MenuItem
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  titleStyle, tableHeaderStyle, tableCellStyle, tableContainerStyle,
  paginationContainerStyle, paginationButtonStyle, paginationActiveButtonStyle,
  paginationEllipsisStyle
} from './_detailInnovationsStyle';
import downloadIcon from '../../../../assets/icons/icon-download.svg';

import { jsPDF } from 'jspdf';
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Props {
  selectedCategory: string | null;
  onInnovationSelect?: (namaInovasi: string) => void;
}

interface Innovation {
  namaInovasi: string;
  namaInovator: string;
  kategoriInovasi: string;
}

interface InnovatorProfile {
  namaInovator: string;
  jumlahDesaDampingan: number;
}

interface JoinedData {
  namaInovasi: string;
  namaInovator: string;
  jumlahDesaDampingan: number;
  kategoriInovasi: string;
}

const DetailInnovations = ({ selectedCategory, onInnovationSelect }: Props) => {
  const [data, setData] = useState<JoinedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedCategory) {
        setData([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const db = getFirestore();

      const inovasiSnap = await getDocs(collection(db, 'inovasi'));
      const profilSnap = await getDocs(collection(db, 'profilInovator'));

      const inovasiList: Innovation[] = inovasiSnap.docs.map(doc => doc.data() as Innovation);
      const profilList: InnovatorProfile[] = profilSnap.docs.map(doc => doc.data() as InnovatorProfile);

      const normalize = (str: string) => str.replace(/\s+/g, '').toLowerCase();
      const normalizedSelected = normalize(selectedCategory);

      // Filter inovasi by kategoriInovasi
      const matchingInovasi = inovasiList.filter(i =>
        normalize(i.kategoriInovasi).includes(normalizedSelected)
      );

      const joinedData = matchingInovasi.map(i => {
        const matchedProfile = profilList.find(p =>
          normalize(p.namaInovator) === normalize(i.namaInovator)
        );
        return {
          namaInovasi: i.namaInovasi,
          namaInovator: i.namaInovator,
          jumlahDesaDampingan: matchedProfile?.jumlahDesaDampingan || 0,
          kategoriInovasi: i.kategoriInovasi,
        };
      });

      setData(joinedData);
      setCurrentPage(1);
      setLoading(false);
    };

    fetchData();
  }, [selectedCategory]);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const goToPage = (page: number) => setCurrentPage(page);

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

  const exportPDF = () => {
    if (!data.length) return;
    const doc = new jsPDF();
    const headers = ['No', 'Nama Inovasi', 'Nama Inovator', 'Jumlah Desa'];
    const exportData = data.map((item, index) => [
      index + 1,
      item.namaInovasi,
      item.namaInovator,
      item.jumlahDesaDampingan,
    ]);

    doc.text(`Daftar Inovasi oleh ${selectedCategory}`, 14, 15);
    autoTable(doc, {
      head: [headers],
      body: exportData,
      startY: 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [33, 150, 243] },
    });
    doc.save(`Daftar_Inovasi_${selectedCategory || 'all'}.pdf`);
  };

  const exportXLSX = () => {
    if (!data.length) return;
    const headers = ['No', 'Nama Inovasi', 'Nama Inovator', 'Jumlah Desa'];
    const exportData = data.map((item, index) => [
      index + 1,
      item.namaInovasi,
      item.namaInovator,
      item.jumlahDesaDampingan,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...exportData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inovasi');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });

    saveAs(blob, `Daftar_Inovasi_${selectedCategory || 'all'}.xlsx`);
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" mb={2}>
        <Box>
          <Text {...titleStyle}>Daftar Inovasi oleh {selectedCategory || '...'}</Text>
          {!selectedCategory && (
            <Text fontSize="12" color="gray.500" mt={1} fontStyle="italic">
              Pilih kategori pada diagram untuk melihat data tabel
            </Text>
          )}
        </Box>
        {selectedCategory && (
          <Menu>
            <MenuButton>
              <Image
                src={downloadIcon}
                alt="Download"
                boxSize="16px"
                cursor="pointer"
              />
            </MenuButton>
            <MenuList fontSize="sm">
              <MenuItem onClick={exportPDF}>Download PDF</MenuItem>
              <MenuItem onClick={exportXLSX}>Download Excel</MenuItem>
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
                      <Th sx={tableHeaderStyle}>Nama Inovasi</Th>
                      <Th sx={tableHeaderStyle}>Nama Inovator</Th>
                      <Th sx={tableHeaderStyle}>Jumlah Desa</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {currentData.length === 0 ? (
                      <Tr>
                        <Td colSpan={4} textAlign="center" sx={tableCellStyle}>
                          Tidak ada data inovasi untuk kategori ini.
                        </Td>
                      </Tr>
                    ) : (
                      currentData.map((item, i) => (
                        <Tr
                          key={i}
                          cursor="pointer"
                          _hover={{ bg: "gray.100" }}
                          onClick={() => onInnovationSelect && onInnovationSelect(item.namaInovasi)}
                        >
                          <Td sx={tableCellStyle}>{(currentPage - 1) * itemsPerPage + i + 1}</Td>
                          <Td sx={tableCellStyle}>{item.namaInovasi}</Td>
                          <Td sx={tableCellStyle}>{item.namaInovator}</Td>
                          <Td sx={tableCellStyle}>{item.jumlahDesaDampingan}</Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </TableContainer>

              {totalPages > 1 && (
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
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default DetailInnovations;