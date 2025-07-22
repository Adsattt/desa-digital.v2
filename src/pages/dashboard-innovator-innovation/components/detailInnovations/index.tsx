import { useEffect, useState } from "react";
import {
  Text, Box, Flex, Button, Image,
  Table, Thead, Tbody, Tr, Th, Td,
  TableContainer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
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
import {
  titleStyle,
  tableHeaderStyle,
  tableCellStyle,
  tableContainerStyle,
  paginationContainerStyle,
  paginationButtonStyle,
  paginationActiveButtonStyle,
  paginationEllipsisStyle,
} from "./_detailInnovationsStyle";
import downloadIcon from "../../../../assets/icons/icon-download.svg";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Implementation {
  innovationId: string;
  namaInovasi: string;
  inovator: string;
  jumlahDesa: number;
}

interface DetailInnovationsProps {
  onSelectInnovation: (innovationId: string, namaInovasi: string) => void;
}

const DetailInnovations: React.FC<DetailInnovationsProps> = ({ onSelectInnovation }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [implementationData, setImplementationData] = useState<Implementation[]>([]);
  const [loading, setLoading] = useState(true);

  const [inovatorProfile, setInovatorProfile] = useState({
    namaInovator: "-",
    kategoriInovator: "-",
    tahunDibentuk: "-",
    targetPengguna: "-",
    produk: "-",
    modelBisnis: "-",
  });

  const auth = getAuth();
  const db = getFirestore();
  const [userName, setUserName] = useState<string | null>(null);

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
          namaInovator: profileData.namaInovator || "-",
          kategoriInovator: profileData.kategori || "-",
          tahunDibentuk: profileData.tahunDibentuk || "-",
          targetPengguna: profileData.targetPengguna || "-",
          modelBisnis: profileData.modelBisnis || "-",
          produk: produkInovator || "-",
        });

        const klaimInovasiRef = collection(db, "claimInnovations");
        let klaimDocs: QueryDocumentSnapshot<DocumentData>[] = [];
        for (let i = 0; i < inovasiIds.length; i += chunkSize) {
          const chunk = inovasiIds.slice(i, i + chunkSize);
          const qKlaim = query(klaimInovasiRef, where("inovasiId", "in", chunk));
          const snapKlaim = await getDocs(qKlaim);
          klaimDocs = klaimDocs.concat(snapKlaim.docs);
        }

        const inovatorIdSet = new Set<string>(
          Array.from(inovasiMap.values()).map((x) => x.inovatorId)
        );
        const inovatorIdList = Array.from(inovatorIdSet);

        const inovatorNameMap = new Map<string, string>();
        for (let i = 0; i < inovatorIdList.length; i += chunkSize) {
          const chunk = inovatorIdList.slice(i, i + chunkSize);
          const qProfilName = query(profilInovatorRef, where("__name__", "in", chunk));
          const snap = await getDocs(qProfilName);
          snap.forEach((doc) => {
            const data = doc.data();
            inovatorNameMap.set(doc.id, data.namaInovator || "Unknown");
          });
        }

        const aggregationMap = new Map<
          string,
          { innovationId: string; inovator: string; namaInovasi: string; desaSet: Set<string> }
        >();

        for (const docSnap of klaimDocs) {
          const data = docSnap.data();
          const inovasiId = data.inovasiId;
          const namaDesa = data.namaDesa;
          const inovasiData = inovasiMap.get(inovasiId);
          if (!inovasiData) continue;
          const inovatorId = inovasiData.inovatorId;
          const inovatorName = inovatorNameMap.get(inovatorId) || "Unknown";
          const key = inovasiId;

          if (!aggregationMap.has(key)) {
            aggregationMap.set(key, {
              innovationId: key,
              namaInovasi: inovasiData.namaInovasi,
              inovator: inovatorName,
              desaSet: new Set(),
            });
          }
          aggregationMap.get(key)!.desaSet.add(namaDesa);
        }

        const result: Implementation[] = Array.from(aggregationMap.values()).map(
          (item) => ({
            innovationId: item.innovationId,
            namaInovasi: item.namaInovasi,
            inovator: item.inovator,
            jumlahDesa: item.desaSet.size,
          })
        );

        setImplementationData(
          result.sort((a, b) => a.namaInovasi.localeCompare(b.namaInovasi))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth.currentUser]);

  const totalPages = Math.ceil(implementationData.length / itemsPerPage);
  const currentData = implementationData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      const leftSiblingIndex = Math.max(currentPage - 1, 1);
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

      if (!shouldShowLeftDots && shouldShowRightDots) {
        for (let i = 1; i <= 3; i++) pageNumbers.push(i);
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (shouldShowLeftDots && !shouldShowRightDots) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 2; i <= totalPages; i++) pageNumbers.push(i);
      } else if (shouldShowLeftDots && shouldShowRightDots) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) pageNumbers.push(i);
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

    const exportToPDF = () => {
    if (implementationData.length === 0) {
      alert("No data to export");
      return;
    }

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
      head: [["No", "Nama Inovasi", "Nama Inovator", "Jumlah Desa"]],
      body: implementationData.map((item, idx) => [
        idx + 1,
        item.namaInovasi,
        item.inovator,
        item.jumlahDesa,
      ]),
      headStyles: {
        fillColor: [0, 128, 0],
        textColor: 255,
        fontStyle: 'bold',
      },
    });

    doc.save("daftar-inovasi.pdf");
  };
  
  const exportToExcel = () => {
    if (implementationData.length === 0) {
      alert("No data to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      implementationData.map((item, idx) => ({
        "No": idx + 1,
        "Nama Inovator": item.inovator,
        "Nama Inovasi": item.namaInovasi,
        "Jumlah Desa": item.jumlahDesa,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inovasi");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "daftar-inovasi.xlsx");
  };

  return (
    <Box p={4} maxW="100%" mx="auto">
      <Flex justify="space-between" align="center" mb={2}>
        <Text {...titleStyle}>Daftar Inovasi {userName || "User"}</Text>
        <Flex justify="flex-end" align="center">
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
      </Flex>

      {loading ? (
        <Text>Loading data...</Text>
      ) : (
        <>
          <TableContainer {...tableContainerStyle}>
            <Table variant="simple" size="sm" sx={{ tableLayout: "fixed" }}>
              <Thead>
                <Tr>
                  <Th sx={tableHeaderStyle} width="20%">No</Th>
                  <Th sx={tableHeaderStyle} width="50%">Nama Inovasi</Th>
                  <Th sx={tableHeaderStyle}>Jumlah Desa</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentData.map((item, index) => (
                  <Tr
                    key={item.innovationId}
                    cursor="pointer"
                    _hover={{ bg: "gray.100" }}
                    onClick={() => onSelectInnovation(item.innovationId, item.namaInovasi)}
                  >
                    <Td sx={tableCellStyle}>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </Td>
                    <Td sx={tableCellStyle}>{item.namaInovasi}</Td>
                    <Td sx={tableCellStyle}>{item.jumlahDesa}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Flex sx={paginationContainerStyle} mt={2}>
              <Button
                sx={paginationButtonStyle}
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                leftIcon={<ChevronLeftIcon />}
              >
                Prev
              </Button>
              {getPageNumbers().map((page, idx) =>
                typeof page === "number" ? (
                  <Button
                    key={idx}
                    sx={page === currentPage ? paginationActiveButtonStyle : paginationButtonStyle}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                ) : (
                  <Text key={idx} sx={paginationEllipsisStyle}>
                    {page}
                  </Text>
                )
              )}
              <Button
                sx={paginationButtonStyle}
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                rightIcon={<ChevronRightIcon />}
              >
                Next
              </Button>
            </Flex>
          )}
        </>
      )}
    </Box>
  );
};

export default DetailInnovations;