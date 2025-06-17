import {
  Box,
  Text,
  Flex,
  Image,
  Spinner,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

import YearRangeFilter from "./dateFilter";
import filterIcon from "../../../../assets/icons/icon-filter.svg";
import downloadIcon from "../../../../assets/icons/icon-download.svg";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  chartContainerStyle,
  chartWrapperStyle,
  barGroupStyle,
  barStyle,
  labelStyle,
  legendContainerStyle,
  legendItemStyle,
  legendDotStyle,
  titleStyle,
  yAxisLabelStyle,
  yAxisWrapperStyle,
  chartBarContainerStyle,
  barAndLineWrapperStyle,
  xAxisStyle,
  yAxisStyle,
} from "./_barchartInnovatorStyle";

const BarChartInovasi = () => {
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;
  const userName = user?.displayName || "Inovator";
  const [showFilter, setShowFilter] = useState(false);
  const [yearRange, setYearRange] = useState<[number, number]>([2010, 2025]);
  const [dataByYear, setDataByYear] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setDataByYear({});
          setLoading(false);
          return;
        }
        const uid = currentUser.uid;

        const exportRows: {
          namaDesa: string;
          namaInovasi: string;
          namaInovator: string;
          year: number;
        }[] = [];

        // 1. Get profilInovator docs where userId == current UID
        const profilInovatorQ = query(
          collection(db, "profilInovator"),
          where("userId", "==", uid)
        );
        const profilSnapshot = await getDocs(profilInovatorQ);
        const profilIds = profilSnapshot.docs.map((doc) => doc.id);

        const profilMap: Record<string, string> = {};
        profilSnapshot.docs.forEach((doc) => {
          profilMap[doc.id] = doc.data().namaInovator || "-";
        });

        if (profilSnapshot.docs.length > 0) {
          const firstProfilData = profilSnapshot.docs[0].data();
          setProfil({
            namaInovator: firstProfilData.namaInovator || "-",
            kategoriInovator: firstProfilData.kategoriInovator || "-",
            tahunDibentuk: firstProfilData.tahunDibentuk || "-",
            targetPengguna: firstProfilData.targetPengguna || "-",
            produk: firstProfilData.produk || "-",
            modelBisnis: firstProfilData.modelBisnis || "-",
          });
        } else {
          setProfil(null);
        }

        if (profilIds.length === 0) {
          setDataByYear({});
          setLoading(false);
          return;
        }

        // 2. Get inovasi docs where inovatorId in profilIds (batch in 10)
        const inovasiIds: string[] = [];
        const inovasiMap: Record<string, { namaInovasi: string; inovatorId: string }> = {};
        const batchSize = 10;

        for (let i = 0; i < profilIds.length; i += batchSize) {
          const batchIds = profilIds.slice(i, i + batchSize);
          const inovasiQ = query(
            collection(db, "inovasi"),
            where("inovatorId", "in", batchIds)
          );
          const inovasiSnapshot = await getDocs(inovasiQ);
          inovasiSnapshot.forEach((doc) => {
            inovasiIds.push(doc.id);
            const data = doc.data();
            inovasiMap[doc.id] = {
              namaInovasi: data.namaInovasi || "-",
              inovatorId: data.inovatorId || "-",
            };
          });
        }

        if (inovasiIds.length === 0) {
          setDataByYear({});
          setLoading(false);
          return;
        }

        // 3. Get menerapkanInovasi docs where inovasiId in inovasiIds and filter by yearRange
        const counts: Record<number, number> = {};

        for (let i = 0; i < inovasiIds.length; i += batchSize) {
          const batchIds = inovasiIds.slice(i, i + batchSize);
          const menerapkanQ = query(
            collection(db, "menerapkanInovasi"),
            where("inovasiId", "in", batchIds)
          );
          const menerapkanSnapshot = await getDocs(menerapkanQ);

          menerapkanSnapshot.forEach((doc) => {
            const data = doc.data();
            const year = Number(data.tanggalPengajuan);
            const desa = data.namaDesa;

            if (!isNaN(year) && desa && year >= yearRange[0] && year <= yearRange[1]) {
              counts[year] = (counts[year] || 0) + 1;

              const inovasiData = inovasiMap[data.inovasiId] || {};
              const namaInovasi = inovasiData.namaInovasi || "-";
              const namaInovator = profilMap[inovasiData.inovatorId] || "-";

              exportRows.push({
                namaDesa: desa,
                namaInovasi,
                namaInovator,
                year,
              });
            }
          });
        }

        setFormattedData(exportRows);
        setDataByYear(counts);
      } catch (error) {
        console.error("Error fetching data:", error);
        setDataByYear({});
      }
      setLoading(false);
    };

    fetchData();
  }, [yearRange, auth.currentUser]);

  const maxValue = Math.max(...Object.values(dataByYear), 10);
  const rotateLabels = Object.keys(dataByYear).length > 8;

  // const formattedData = Object.entries(dataByYear).map(([year, count]) => ({
  //   year: Number(year),
  //   count,
  // }));

  const [formattedData, setFormattedData] = useState<
    { namaDesa: string; namaInovasi: string; namaInovator: string; year: number }[]
  >([]);

  const [profil, setProfil] = useState<{
    namaInovator: string;
    kategoriInovator: string;
    tahunDibentuk: string | number;
    targetPengguna: string;
    produk: string;
    modelBisnis: string;
  } | null>(null);

  // Export Excel function
  const exportToExcel = (data: any[]) => {
    const wsData = [
      ["Tahun", "Jumlah Desa"],
      ...data.map((item) => [item.year, item.count]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Perkembangan Inovasi");
    XLSX.writeFile(workbook, "data-perkembangan-inovasi.xlsx");
  };

const exportToPDF = (
  data: {
    namaDesa: string;
    namaInovasi: string;
    namaInovator: string;
    year: number;
  }[],
  profil: {
    namaInovator: string;
    kategoriInovator: string;
    tahunDibentuk: string | number;
    targetPengguna: string;
    produk: string;
    modelBisnis: string;
  }
) => {
  const doc = new jsPDF();
  const downloadDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Header background and text
  doc.setFillColor(0, 128, 0);
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");

  doc.setFontSize(15);
  doc.text("Dokumen Laporan Inovator", 14, 13);
  doc.text(profil.namaInovator || "-", 190, 13, { align: "right" });

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
  doc.text(`: ${profil.namaInovator || "-"}`, valueX, y);
  y += lineHeight;

  doc.text("Kategori", labelX, y);
  doc.text(`: ${profil.kategoriInovator || "-"}`, valueX, y);
  y += lineHeight;

  doc.text("Tahun Dibentuk", labelX, y);
  doc.text(`: ${profil.tahunDibentuk || "-"}`, valueX, y);
  y += lineHeight;

  doc.text("Target Pengguna", labelX, y);
  doc.text(`: ${profil.targetPengguna || "-"}`, valueX, y);
  y += lineHeight;

  doc.text("Produk", labelX, y);
  doc.text(`: ${profil.produk || "-"}`, valueX, y);
  y += lineHeight;

  doc.text("Model Bisnis", labelX, y);
  doc.text(`: ${profil.modelBisnis || "-"}`, valueX, y);
  y += 10;

  // Table title
  y += 5;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Data Perkembangan Desa Dampingan ${profil.namaInovator || "-"}`, 14, y);
  y += 5;

  // Table with data
  autoTable(doc, {
    startY: y,
    head: [["Nama Desa", "Nama Inovasi", "Nama Inovator", "Tahun"]],
    body: data.map((item) => [
      item.namaDesa,
      item.namaInovasi,
      item.namaInovator,
      item.year,
    ]),
    headStyles: {
      fillColor: [0, 128, 0],
      textColor: 255,
      fontStyle: "bold",
    },
    styles: { fontSize: 10 },
  });

  doc.save("data-perkembangan-inovasi.pdf");
};


  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={2}>
        <Text {...titleStyle}>Perkembangan Inovasi {userName}</Text>
        <Flex align="center" gap={2}>
          <Image
            onClick={() => setShowFilter(true)}
            src={filterIcon}
            alt="Filter"
            boxSize="16px"
            cursor="pointer"
            ml={2}
          />
          <Menu>
            <MenuButton
              as={Box}
              cursor="pointer"
              display="inline-block"
              p={1}
              _hover={{ opacity: 0.8 }}
            >
              <Image src={downloadIcon} alt="Download" boxSize="16px"/>
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => exportToPDF(formattedData, profil)}>
                Download PDF
              </MenuItem>
              <MenuItem onClick={() => exportToExcel(formattedData)}>
                Download Excel
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      <Box {...chartContainerStyle}>
        <Flex {...legendContainerStyle}>
          <Flex {...legendItemStyle}>
            <Box {...legendDotStyle} bg="#4C73C7" />
            <Text>Jumlah Desa</Text>
          </Flex>
        </Flex>

        <Box {...chartWrapperStyle}>
          <Flex {...yAxisWrapperStyle}>
            {(() => {
              const stepSize = maxValue > 50 ? 10 : 5;
              const niceMax = Math.ceil(maxValue / stepSize) * stepSize;
              const steps = [];

              for (let i = niceMax; i >= 0; i -= stepSize) {
                steps.push(i);
              }

              return steps.map((label) => (
                <Text key={label} {...yAxisLabelStyle}>
                  {label === 0 ? "" : label}
                </Text>
              ));
            })()}
          </Flex>

          <Flex {...chartBarContainerStyle}>
            <Box {...yAxisStyle} />
            <Flex {...barAndLineWrapperStyle}>
              {loading ? (
                <Spinner mt={10} />
              ) : (
                Object.keys(dataByYear)
                  .sort((a, b) => Number(a) - Number(b))
                  .map((year) => (
                    <Box key={year} {...barGroupStyle}>
                      <Tooltip
                        label={`Tahun ${year}: ${dataByYear[Number(year)]} desa`}
                        hasArrow
                        placement="top"
                        bg="gray.700"
                        color="white"
                        fontSize="sm"
                      >
                        <Box
                          {...barStyle}
                          height={`${(dataByYear[Number(year)] / maxValue) * 100}%`}
                          bg="#4C73C7"
                          _hover={{ opacity: 0.8 }}
                          transition="all 0.2s"
                        />
                      </Tooltip>
                      <Text
                        {...labelStyle}
                        sx={
                          rotateLabels
                            ? { transform: "rotate(-45deg)", transformOrigin: "left bottom" }
                            : {}
                        }
                        whiteSpace="nowrap"
                      >
                        {year}
                      </Text>
                    </Box>
                  ))
              )}
              <Box {...xAxisStyle} />
            </Flex>
          </Flex>
        </Box>
      </Box>

      <YearRangeFilter
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={(from, to) => setYearRange([from, to])}
      />
    </Box>
  );
};

export default BarChartInovasi;