import React, { useState, useEffect } from 'react';
import {
  Box, Text, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Flex, Button, Image, Menu, MenuButton, MenuList, MenuItem, IconButton
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData
} from "firebase/firestore";
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

interface Implementation {
  desaId: string;
  namaDesa: string;
  namaInovasi: string;
  tahunKlaim: string;
}

interface VillageDetail {
  namaDesa: string;
  namaInovasi: string;
  tanggalKlaim: string;
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
  const [implementationData, setImplementationData] = useState<Implementation[]>([]);
  const [loading, setLoading] = useState(true);
  const [villages, setVillages] = useState<VillageDetail[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const auth = getAuth();
  const db = getFirestore();
  const [userName, setUserName] = useState<string | null>(null);

  const [inovatorProfile, setInovatorProfile] = useState({
    namaInovator: "-",
    kategoriInovator: "-",
    tahunDibentuk: "-",
    targetPengguna: "-",
    produk: "-",
    modelBisnis: "-",
  });

  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      setUserName(user.displayName || user.email || "User");
    } else {
      setUserName(null);
    }

    if (!user) {
      setImplementationData([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const profilInovatorRef = collection(db, "innovators");
        const qProfil = query(profilInovatorRef, where("id", "==", user.uid));
        const profilSnap = await getDocs(qProfil);
        if (profilSnap.empty) {
          setImplementationData([]);
          setLoading(false);
          return;
        }
        const inovatorIds = profilSnap.docs.map((doc) => doc.id);

        const inovasiRef = collection(db, "innovations");
        const chunkSize = 10;
        let inovasiDocs: QueryDocumentSnapshot<DocumentData>[] = [];
        for (let i = 0; i < inovatorIds.length; i += chunkSize) {
          const chunk = inovatorIds.slice(i, i + chunkSize);
          const qInovasi = query(inovasiRef, where("innovatorId", "in", chunk));
          const snapInovasi = await getDocs(qInovasi);
          inovasiDocs = inovasiDocs.concat(snapInovasi.docs);
        }
        if (inovasiDocs.length === 0) {
          setImplementationData([]);
          setLoading(false);
          return;
        }

        const inovasiMap = new Map<
          string,
          { namaInovasi: string; inovatorId: string }
        >();
        inovasiDocs.forEach((doc) => {
          const data = doc.data();
          inovasiMap.set(doc.id, {
            namaInovasi: data.namaInovasi,
            inovatorId: data.innovatorId,
          });
        });

        const inovasiIds = Array.from(inovasiMap.keys());

        const produkInovator = inovasiDocs
          .map((doc) => doc.data().namaInovasi)
          .filter(Boolean)
          .join(", ");
        
        const profileData = profilSnap.docs[0].data();
        setInovatorProfile({
          namaInovator: profileData?.namaInovator || "-",
          kategoriInovator: profileData?.kategori || "-",
          tahunDibentuk: profileData?.tahunDibentuk || "-",
          targetPengguna: profileData?.targetPengguna || "-",
          modelBisnis: profileData?.modelBisnis || "-",
          produk: produkInovator,
        });

        // Get villages that claimed the innovation
        const villagesQuery = query(
          collection(db, "claimInnovations"),
          where("inovasiId", "==", innovationId)
        );
        const villagesSnapshot = await getDocs(villagesQuery);

        const villagesData: VillageDetail[] = villagesSnapshot.docs.map((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate?.();
          const tahunKlaim =
            createdAt instanceof Date
              ? String(createdAt.getFullYear())
              : "Tidak tersedia";

          return {
            namaDesa: data.namaDesa || "Tidak tersedia",
            namaInovasi: data.namaInovasi,
            tanggalKlaim: tahunKlaim,
          };
        });

        setVillages(
          villagesData.sort((a, b) => a.namaDesa.localeCompare(b.namaDesa))
        );

        setImplementationData(
          villagesData.map((item) => ({
            desaId: "",
            namaDesa: item.namaDesa,
            namaInovasi: item.namaInovasi,
            tahunKlaim: item.tanggalKlaim,
          }))
        );
      } catch (error) {
        console.error("Error fetching villages or profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [db, innovationId]);

  const totalPages = Math.ceil(villages.length / itemsPerPage);
  const currentData = villages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    const downloadDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Assuming `userName` is defined and `implementationData` is the list of innovations
    const userProfile = {
      nama: userName || "-",
    };

    // Header with green background
    doc.setFillColor(0, 128, 0);
    doc.rect(0, 0, 210, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");

    doc.setFontSize(15);
    doc.text("Dokumen Laporan Inovator", 14, 13);
    doc.text(inovatorProfile.namaInovator, 190, 13, { align: "right" });

    doc.setFontSize(12);
    doc.text("KMS Inovasi Desa Digital", 14, 22);
    doc.text(`Diunduh pada: ${downloadDate}`, 190, 22, { align: "right" });

    // Reset styles for content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);

    // Inovator profile section
    const profileStartY = 42;
    let y = profileStartY;

    const labelX = 14;
    const valueX = 50;
    const lineHeight = 8;

    doc.text("Profil Inovator", 14, y);
    y += lineHeight;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    doc.text("Nama", labelX, y);
    doc.text(`: ${inovatorProfile.namaInovator || "-"}`, valueX, y);
    y += lineHeight;

    doc.text("Kategori", labelX, y);
    doc.text(`: ${inovatorProfile.kategoriInovator || "-"}`, valueX, y);
    y += lineHeight;

    doc.text("Tahun Dibentuk", labelX, y);
    doc.text(`: ${inovatorProfile.tahunDibentuk || "-"}`, valueX, y);
    y += lineHeight;

    doc.text("Target Pengguna", labelX, y);
    doc.text(`: ${inovatorProfile.targetPengguna || "-"}`, valueX, y);
    y += lineHeight;

    doc.text("Model Bisnis", labelX, y);
    doc.text(`: ${inovatorProfile.modelBisnis || "-"}`, valueX, y);
    y += 10;

    doc.text("Produk", labelX, y);
    doc.text(`: ${inovatorProfile.produk || "-"}`, valueX, y);
    y += lineHeight;

    // Table title
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text(`Data Inovasi ${inovatorProfile.namaInovator}`, 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [["No", "Nama Desa", "Nama Inovasi", "Tahun Klaim"]],
      body: implementationData.map((item, idx) => [
        idx + 1,
        item.namaDesa,
        item.namaInovasi,
        item.tahunKlaim,
      ]),
      headStyles: {
        fillColor: [0, 128, 0],
        textColor: 255,
        fontStyle: 'bold',
      },
    });

    doc.save("daftar-desa-inovasi.pdf");
  };
  
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      implementationData.map((item, idx) => ({
        "No": idx + 1,
        "Nama Desa": item.namaDesa,
        "Nama Inovasi": item.namaInovasi,
        "Tahun Klaim": item.tahunKlaim,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inovasi");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "daftar-desa-inovasi.xlsx");
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
              <Th sx={tableHeaderStyle} width="40%">Nama Desa</Th>
              <Th sx={tableHeaderStyle}>Tahun Klaim</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentData.map((item, index) => (
              <Tr key={index}>
                <Td sx={tableCellStyle}>{(currentPage - 1) * itemsPerPage + index + 1}</Td>
                <Td sx={tableCellStyle}>{item.namaDesa}</Td>
                <Td sx={tableCellStyle}>{item.tanggalKlaim}</Td>
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