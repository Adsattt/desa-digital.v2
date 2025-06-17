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
  QueryDocumentSnapshot, DocumentData
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

import { jsPDF } from "jspdf";
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
        const uid = user.uid;

        const profilInovatorRef = collection(db, "profilInovator");
        const qProfil = query(profilInovatorRef, where("userId", "==", uid));
        const profilSnap = await getDocs(qProfil);
        if (profilSnap.empty) {
          setImplementationData([]);
          setLoading(false);
          return;
        }
        const inovatorIds = profilSnap.docs.map((doc) => doc.id);

        const inovasiRef = collection(db, "inovasi");
        const chunkSize = 10;
        let inovasiDocs: QueryDocumentSnapshot<DocumentData>[] = [];
        for (let i = 0; i < inovatorIds.length; i += chunkSize) {
          const chunk = inovatorIds.slice(i, i + chunkSize);
          const qInovasi = query(inovasiRef, where("inovatorId", "in", chunk));
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
            inovatorId: data.inovatorId,
          });
        });

        const inovasiIds = Array.from(inovasiMap.keys());

        const menerapkanInovasiRef = collection(db, "menerapkanInovasi");
        let menerapkanDocs: QueryDocumentSnapshot<DocumentData>[] = [];
        for (let i = 0; i < inovasiIds.length; i += chunkSize) {
          const chunk = inovasiIds.slice(i, i + chunkSize);
          const qMenerapkan = query(menerapkanInovasiRef, where("inovasiId", "in", chunk));
          const snapMenerapkan = await getDocs(qMenerapkan);
          menerapkanDocs = menerapkanDocs.concat(snapMenerapkan.docs);
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

        for (const docSnap of menerapkanDocs) {
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

  // Utility function to download a string as a file
  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    if (implementationData.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["No", "Nama Inovasi", "Inovator", "Jumlah Desa"];
    const rows = implementationData.map((item, index) => [
      index + 1,
      item.namaInovasi,
      item.inovator,
      item.jumlahDesa,
    ]);

    let csvContent = headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.map((field) => `"${field}"`).join(",") + "\n";
    });

    downloadFile("inovasi_data.csv", csvContent, "text/csv;charset=utf-8;");
  };

  const exportToPDF = () => {
    if (implementationData.length === 0) {
      alert("No data to export");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text(`Daftar Inovasi ${userName}`, 14, 20);

    // Prepare table headers and data rows
    const headers = [["No", "Nama Inovasi", "Inovator", "Jumlah Desa"]];
    const rows = implementationData.map((item, index) => [
      index + 1,
      item.namaInovasi,
      item.inovator,
      item.jumlahDesa.toString(),
    ]);

    // Use autoTable plugin to create the table
    autoTable(doc, {
      startY: 30,
      head: headers,
      body: rows,
      styles: { fontSize: 12 },
      headStyles: { fillColor: [22, 160, 133] }, // header background color
      columnStyles: {
        0: { cellWidth: 10 },  // No
        1: { cellWidth: 60 },  // Nama Inovasi
        2: { cellWidth: 50 },  // Inovator
        3: { cellWidth: 30 },  // Jumlah Desa
      },
      didDrawPage: (data) => {
        // You can add page numbers or custom header/footer here if needed
      },
    });

    doc.save("inovasi_data.pdf");
  };

  const handleDownload = (type: "excel" | "pdf") => {
    if (type === "excel") {
      exportToCSV();
    } else if (type === "pdf") {
      exportToPDF();
    }
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
              <MenuItem onClick={() => handleDownload("pdf")}>Download PDF</MenuItem>
              <MenuItem onClick={() => handleDownload("excel")}>Download Excel</MenuItem>
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