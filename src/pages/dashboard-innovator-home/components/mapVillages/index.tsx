import { useEffect, useState } from "react";
import {
  Flex,
  Box,
  Text,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";

import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
} from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

import geoData from "../../../../../public/indonesia-province-simple.json";
import filterIcon from "../../../../assets/icons/icon-filter.svg";
import downloadIcon from "../../../../assets/icons/icon-download.svg";
import ProvinceFilter from "./mapFilter";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  headerTextStyle,
  MapContainerWrapper,
  StyledMapBox,
  StyledLegendOnMap,
} from "./_mapVillagesStyle";

interface DesaPin {
  desaId: string;
  namaDesa: string;
  lat: number;
  lng: number;
  inovasiId: string;
  inovasiName?: string;
}

const cleanName = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, "");
};

const getColorByTotal = (total: number): string => {
  if (total === 0) return "#c8e6c9";
  if (total <= 3) return "#81c784";
  if (total <= 5) return "#66bb6a";
  if (total <= 10) return "#43a047";
  return "#2e7d32";
};

const provinceStyle = (feature: any, totals: Record<string, number>) => {
  const rawName = feature?.properties?.Propinsi || "unknown";
  const name = cleanName(rawName);
  const total = totals[name] ?? 0;
  return {
    fillColor: getColorByTotal(total),
    weight: 1,
    color: "white",
    fillOpacity: 0.8,
  };
};

const onEachFeature = (feature: any, layer: L.Layer, totals: Record<string, number>) => {
  const rawName = feature?.properties?.Propinsi || "Unknown";
  const name = cleanName(rawName);
  const total = totals[name] ?? 0;
  layer.bindPopup(`${rawName}: ${total} desa digital`);
};

const Legend = () => {
  return (
    <Box
      mt={4}
      width="80%"
      mx="auto"
      textAlign="center"
      fontSize="sm"
      userSelect="none"
    >
      <Box
        height="10px"
        borderRadius="10px"
        background="linear-gradient(to right, #c8e6c9, #2e7d32)"
        border="1px solid #ccc"
      />
      <Box
        mt={1}
        display="flex"
        justifyContent="space-between"
        px={1}
        color="gray.700"
        fontWeight="medium"
      >
        <Box mb="10px">0</Box>
        <Box mb="10px">5</Box>
        <Box mb="10px">10+</Box>
      </Box>
    </Box>
  );
};

const MapVillages = () => {
  const [desaPins, setDesaPins] = useState<DesaPin[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [exportData, setExportData] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchDesaPins = async () => {
      const currentUID = auth.currentUser?.uid;
      if (!currentUID) return;

      // Get inovator profile
      const profilInovatorSnap = await getDocs(
        query(collection(db, "innovators"), where("id", "==", currentUID))
      );
      const profilInovatorDoc = profilInovatorSnap.docs[0];
      const profilInovatorId = profilInovatorDoc?.id;
      const profilInovatorData = profilInovatorDoc?.data();
      if (!profilInovatorId || !profilInovatorData) return;

      // Get inovasi docs by inovatorId
      const inovasiSnap = await getDocs(
        query(collection(db, "innovations"), where("innovatorId", "==", profilInovatorId))
      );
      const inovasiDocs = inovasiSnap.docs;
      const inovasiMap = Object.fromEntries(
        inovasiDocs.map((doc) => [doc.id, doc.data()])
      );
      const inovasiIds = inovasiDocs.map((doc) => doc.id);
      if (inovasiIds.length === 0) return;

      // Get menerapkanInovasi docs filtered by inovasiId in inovasiIds
      const menerapkanSnap = await getDocs(
        query(collection(db, "claimInnovations"), where("inovasiId", "in", inovasiIds))
      );

      const pinResults: DesaPin[] = [];
      const dynamicTotals: Record<string, number> = {};
      const exportTemp: any[] = [];

      for (const docSnap of menerapkanSnap.docs) {
        const data = docSnap.data();
        const desaId = data.desaId;
        const inovasiId = data.inovasiId;

        // Fetch profilDesa data
        const desaSnap = await getDoc(doc(db, "villages", desaId));
        if (!desaSnap.exists()) continue;
        const desaData = desaSnap.data();

        // Fetch inovasi data from map
        const inovasiData = inovasiMap[inovasiId];
        if (!inovasiData) continue;

        // Coordinates
        const lat = desaData.lat || desaData.latitude || desaData.latlong?.[0];
        const lng = desaData.lng || desaData.longitude || desaData.latlong?.[1];
        const provinsiRaw = desaData.provinsi || "Unknown";
        const provinsi = cleanName(provinsiRaw);

        if (lat && lng) {
          pinResults.push({
            desaId,
            namaDesa: desaData.namaDesa ?? "Desa",
            lat,
            lng,
            inovasiId,
            inovasiName: inovasiData.namaInovasi,
          });

          dynamicTotals[provinsi] = (dynamicTotals[provinsi] || 0) + 1;

          exportTemp.push({
            namaDesa: desaData.namaDesa ?? "-",
            namaInovasi: inovasiData.namaInovasi ?? "-",
            kategoriInovasi: inovasiData.kategoriInovasi ?? "-",
            namaInovator: inovasiData.namaInovator ?? "-",
            kecamatan: desaData.kecamatan ?? "-",
            kabupaten: desaData.kabupatenKota ?? "-",
            provinsi: desaData.provinsi ?? "-",
            tanggalPengajuan: data.tanggalPengajuan ?? "-",
            kategoriInovator: profilInovatorData.kategori ?? "-",
            tahunDibentuk: profilInovatorData.tahunDibentuk ?? "-",
            targetPengguna: profilInovatorData.targetPengguna ?? "-",
            produk: profilInovatorData.produk ?? "-",
            modelBisnis: profilInovatorData.modelBisnis ?? "-",
          });
        }
      }

      setExportData(exportTemp);
      setDesaPins(pinResults);
      setTotals(dynamicTotals);
    };

    fetchDesaPins();
  }, [auth.currentUser, db]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const downloadDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const inovatorProfile = exportData[0]; // Assuming exportData has at least one entry from the same inovator

    // Header with green background
    doc.setFillColor(0, 128, 0);
    doc.rect(0, 0, 210, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");

    doc.setFontSize(15);
    doc.text("Dokumen Laporan Inovator", 14, 13);
    doc.text(inovatorProfile.namaInovator || "-", 190, 13, { align: "right" });

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

    doc.text("Produk", labelX, y);
    doc.text(`: ${inovatorProfile.produk || "-"}`, valueX, y);
    y += lineHeight;

    doc.text("Model Bisnis", labelX, y);
    doc.text(`: ${inovatorProfile.modelBisnis || "-"}`, valueX, y);
    y += 10;

    // Table starts after profile
    y += 5;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(`Data Sebaran Inovasi ${inovatorProfile.namaInovator || "-"}`, 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [[
        "Nama Inovator",
        "Nama Inovasi",
        "Kategori Inovasi",
        "Nama Desa",
        "Kecamatan",
        "Kabupaten",
        "Provinsi",
        "Tanggal Pengajuan",
      ]],
      body: exportData.map((row) => [
        row.namaInovator,
        row.namaInovasi,
        row.kategoriInovasi,
        row.namaDesa,
        row.kecamatan,
        row.kabupatenKota,
        row.provinsi,
        row.tanggalPengajuan,
      ]),
      headStyles: {
        fillColor: [0, 128, 0],
        textColor: 255,
        fontStyle: 'bold',
      },
    });

    doc.save("data_sebaran_inovasi.pdf");
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Sebaran Inovasi");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(dataBlob, "data_sebaran_inovasi.xlsx");
  };

  return (
    <Box p={4} maxW="100%" mx="auto">
      <Flex justify="space-between" align="center" mb={2} mt={2}>
        <Text {...headerTextStyle}>Peta Sebaran Inovasi Digital</Text>
        <Flex gap={2} align="center">
          <Image
            src={filterIcon}
            alt="Filter"
            boxSize="16px"
            cursor="pointer"
            onClick={onOpen}
          />
          <Menu>
            <MenuButton>
              <Image
                src={downloadIcon}
                alt="Download"
                boxSize="16px"
                cursor="pointer"
                marginRight={2}
              />
            </MenuButton>
            <MenuList>
              <MenuItem onClick={handleDownloadPDF}>Download PDF</MenuItem>
              <MenuItem onClick={handleDownloadExcel}>Download Excel</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      <MapContainerWrapper>
        <StyledMapBox>
          <MapContainer
            center={[2, 120]}
            zoom={3}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <GeoJSON
              data={geoData as any}
              style={(feature) => provinceStyle(feature, totals)}
              onEachFeature={(feature, layer) =>
                onEachFeature(feature, layer, totals)
              }
            />
            {desaPins.map((desa) => (
              <Marker key={desa.desaId} position={[desa.lat, desa.lng]}>
                <Popup>
                  <strong>Desa {desa.namaDesa}</strong>
                  <br />
                  Inovasi: {desa.inovasiName ?? "-"}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </StyledMapBox>
        <Legend />
      </MapContainerWrapper>

      <ProvinceFilter
        isOpen={isOpen}
        onClose={onClose}
        onApply={(province) => setSelectedProvince(province)}
        provinces={[...new Set(exportData.map((item) => item.provinsi))].sort()}
      />
    </Box>
  );
};

export default MapVillages;