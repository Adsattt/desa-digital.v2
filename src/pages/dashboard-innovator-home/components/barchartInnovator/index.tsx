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

        // 1. Get profilInovator docs where userId == current UID
        const profilInovatorQ = query(
          collection(db, "profilInovator"),
          where("userId", "==", uid)
        );
        const profilSnapshot = await getDocs(profilInovatorQ);
        const profilIds = profilSnapshot.docs.map((doc) => doc.id);

        if (profilIds.length === 0) {
          setDataByYear({});
          setLoading(false);
          return;
        }

        // 2. Get inovasi docs where inovatorId in profilIds (batch in 10)
        const inovasiIds: string[] = [];
        const batchSize = 10;
        for (let i = 0; i < profilIds.length; i += batchSize) {
          const batchIds = profilIds.slice(i, i + batchSize);
          const inovasiQ = query(
            collection(db, "inovasi"),
            where("inovatorId", "in", batchIds)
          );
          const inovasiSnapshot = await getDocs(inovasiQ);
          inovasiSnapshot.forEach((doc) => inovasiIds.push(doc.id));
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

            if (
              !isNaN(year) &&
              desa &&
              year >= yearRange[0] &&
              year <= yearRange[1]
            ) {
              counts[year] = (counts[year] || 0) + 1;
            }
          });
        }

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

  const formattedData = Object.entries(dataByYear).map(([year, count]) => ({
    year: Number(year),
    count,
  }));

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

  // Export PDF function
  const exportToPDF = (data: any[]) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Data Perkembangan Inovasi", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [["Tahun", "Jumlah Desa"]],
      body: data.map((item) => [item.year, item.count]),
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
              <MenuItem onClick={() => exportToPDF(formattedData)}>
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
            {[maxValue, ...[0.75, 0.5, 0.25].map((f) => Math.round(maxValue * f)), 0].map(
              (label) => (
                <Text key={label} {...yAxisLabelStyle}>
                  {label === 0 ? "" : label}
                </Text>
              )
            )}
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