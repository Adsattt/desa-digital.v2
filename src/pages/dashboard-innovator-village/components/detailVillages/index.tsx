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
} from "./_detailVillagesStyle";
import downloadIcon from "../../../../assets/icons/icon-download.svg";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Implementation {
  villageId: string;
  namaDesa: string;
  jumlahInovasi: number;
}

interface DetailVillagesProps {
  onSelectVillage: (villageId: string, namaDesa: string) => void;
}

const DetailVillages: React.FC<DetailVillagesProps> = ({ onSelectVillage }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [implementationData, setImplementationData] = useState<Implementation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");

  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      setImplementationData([]);
      setLoading(false);
      setUserName("");
      return;
    }

    // Set userName from auth displayName or email fallback
    setUserName(
      currentUser.displayName
        ? currentUser.displayName
        : currentUser.email
        ? currentUser.email.split("@")[0]
        : "User"
    );

    const fetchData = async () => {
      setLoading(true);
      try {
        const uid = currentUser.uid;

        // Fetch inovator IDs for current user
        const profilInovatorRef = collection(db, "innovators");
        const qProfil = query(profilInovatorRef, where("id", "==", uid));
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

        // Map inovasiId -> { namaDesa, inovatorId }
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

        const menerapkanInovasiRef = collection(db, "claimInnovations");
        let menerapkanDocs: QueryDocumentSnapshot<DocumentData>[] = [];
        for (let i = 0; i < inovasiIds.length; i += chunkSize) {
          const chunk = inovasiIds.slice(i, i + chunkSize);
          const qMenerapkan = query(menerapkanInovasiRef, where("inovasiId", "in", chunk));
          const snapMenerapkan = await getDocs(qMenerapkan);
          menerapkanDocs = menerapkanDocs.concat(snapMenerapkan.docs);
        }

        const desaMap = new Map<
          string,
          { namaDesa: string; inovasiIdSet: Set<string> }
        >();

        for (const docSnap of menerapkanDocs) {
          const data = docSnap.data();
          const namaDesa = data.namaDesa;
          const inovasiId = data.inovasiId;

          if (!desaMap.has(namaDesa)) {
            desaMap.set(namaDesa, {
              namaDesa,
              inovasiIdSet: new Set<string>(),
            });
          }
          desaMap.get(namaDesa)!.inovasiIdSet.add(inovasiId);
        }

        const result: Implementation[] = Array.from(desaMap.entries()).map(([namaDesa, data]) => {
          const exampleInovasiId = [...data.inovasiIdSet][0];
          return {
            namaDesa,
            jumlahInovasi: data.inovasiIdSet.size,
            villageId: exampleInovasiId || "",
          };
        });

        setImplementationData(
          result.sort((a, b) => a.namaDesa.localeCompare(b.namaDesa))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

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

  const exportToExcel = () => {
    if (implementationData.length === 0) {
      alert("No data to export");
      return;
    }

    const data = implementationData.map((item, index) => ({
      No: index + 1,
      "Nama Inovasi": item.namaDesa,
      "Jumlah Desa": item.jumlahInovasi,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inovasi");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "inovasi_data.xlsx");
  };

  const exportToPDF = () => {
    if (implementationData.length === 0) {
      alert("No data to export");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text(`Daftar Desa ${userName}`, 14, 20);

    // Prepare table headers and data rows
    const headers = [["No", "Nama Desa", "Jumlah Inovasi"]];
    const rows = implementationData.map((item, index) => [
      index + 1,
      item.namaDesa,
      item.jumlahInovasi,
    ]);

    // Use autoTable plugin to create a table (called as a function)
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 30,
      styles: { fontSize: 12 },
      headStyles: { fillColor: [22, 160, 133] }, // customize header color
    });

    doc.save("inovasi_data.pdf");
  };

  const handleDownload = (type: "excel" | "pdf") => {
    if (type === "excel") {
      exportToExcel();
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
        <Text {...titleStyle}>
          Daftar Desa {userName ? ` ${userName}` : ""}
        </Text>
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
                  <Th sx={tableHeaderStyle} width="50%">Nama Desa</Th>
                  <Th sx={tableHeaderStyle}>Jumlah Inovasi</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentData.map((item, index) => (
                  <Tr
                    key={item.villageId}
                    cursor="pointer"
                    _hover={{ bg: "gray.100" }}
                    onClick={() => onSelectVillage(item.villageId, item.namaDesa)}
                  >
                    <Td sx={tableCellStyle}>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </Td>
                    <Td sx={tableCellStyle}>{item.namaDesa}</Td>
                    <Td sx={tableCellStyle}>{item.jumlahInovasi}</Td>
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

export default DetailVillages;