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
  getDocs,
} from "firebase/firestore";

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
  provinsi: string;
  inovasiId: string | null;
  inovasiList: string[];
}

const cleanName = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, "");
};

const getColorByTotal = (total: number): string => {
  if (total === 0) return "#c8e6c9";
  if (total <= 10) return "#81c784";
  if (total <= 50) return "#66bb6a";
  if (total <= 100) return "#43a047";
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

const Legend = () => (
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
      <Box mb="10px">50</Box>
      <Box mb="10px">100</Box>
    </Box>
  </Box>
);

const MapVillages = () => {
  const [desaPins, setDesaPins] = useState<DesaPin[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [exportData, setExportData] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const db = getFirestore();

  useEffect(() => {
    const fetchAllData = async () => {
      const inovasiSnap = await getDocs(collection(db, "innovations"));
      const inovasiMap = new Map<string, { namaInovator: string; kategoriInovasi: string }>();
      inovasiSnap.docs.forEach(doc => {
        const d = doc.data();
        inovasiMap.set(d.namaInovasi, {
          namaInovator: d.namaInnovator,
          kategoriInovasi: d.kategori,
        });
      });

      const desaSnap = await getDocs(collection(db, "villages"));
      const villages: any[] = [];

      const desaMap = new Map<string, any>();
      desaSnap.docs.forEach(doc => {
        const d = doc.data();
        const lokasi = d.lokasi || {};

        const desaObj = {
          desaId: d.userId,
          namaDesa: d.namaDesa ?? "-",
          latitude: d.latitude,
          longitude: d.longitude,
          kategori: d.kategori ?? "-",
          idm: d.idm ?? "-",
          potensiDesa: d.potensiDesa ?? "-",
          lokasi: {
            desaKelurahan: lokasi.desaKelurahan?.label ?? "-",
            kabupatenKota: lokasi.kabupatenKota?.label ?? "-",
            kecamatan: lokasi.kecamatan?.label ?? "-",
            provinsi: lokasi.provinsi?.label ?? "-",
          }
        };

        villages.push(desaObj);
        desaMap.set(d.userId, desaObj);
      });

      const countByProvince: Record<string, number> = {};

      villages.forEach((desa) => {
        const provinsi = desa.lokasi.provinsi || "Unknown";
        const provKey = cleanName(provinsi);
        countByProvince[provKey] = (countByProvince[provKey] || 0) + 1;
      });

      const claimSnap = await getDocs(collection(db, "claimInnovations"));
      const claimInnovations: any[] = claimSnap.docs.map(doc => doc.data());

      const exportTemp: any[] = [];

      const capitalizeWords = (str: string) =>
        str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());

      villages.forEach((desa) => {
        // Cek apakah desa X memiliki klaim inovasi 
        const desaClaims = claimInnovations.filter(c => c.desaId === desa.desaId);

        if (desaClaims.length > 0) {
          // Kalau ada klaim, buat data (1 desa per row)
          const inovasiNames = desaClaims.map(c => c.namaInovasi).join(", ");
          const inovatorNames = desaClaims.map(c => inovasiMap.get(c.namaInovasi)?.namaInovator || "-").join(", ");
          const kategoriList = desaClaims.map(c => inovasiMap.get(c.namaInovasi)?.kategoriInovasi || "-").join(", ");
          const tanggalList = desaClaims.map(c => c.tanggalPengajuan ?? "-").join(", ");

          exportTemp.push({
            namaDesa: desa.namaDesa,
            desaKelurahan: capitalizeWords(desa.lokasi?.desaKelurahan),
            kecamatan: capitalizeWords(desa.lokasi?.kecamatan),
            kabupatenKota: capitalizeWords(desa.lokasi?.kabupatenKota),
            provinsi: capitalizeWords(desa.lokasi?.provinsi),
            kategoriDesa: desa.kategori,
            idm: desa.idm,
            potensi: desa.potensiDesa,
            namaInovasi: inovasiNames,
            tanggalPengajuan: tanggalList,
            namaInovator: inovatorNames,
            kategoriInovasi: kategoriList,
          });
        } else {
          // Kalau tidak ada klaim, tetap export dengan kolom inovasi kosong
          exportTemp.push({
            namaDesa: desa.namaDesa,
            desaKelurahan: capitalizeWords(desa.lokasi?.desaKelurahan),
            kecamatan: capitalizeWords(desa.lokasi?.kecamatan),
            kabupatenKota: capitalizeWords(desa.lokasi?.kabupatenKota),
            provinsi: capitalizeWords(desa.lokasi?.provinsi),
            kategoriDesa: desa.kategori,
            idm: desa.idm,
            potensi: desa.potensiDesa,
            namaInovasi: "-",
            tanggalPengajuan: "-",
            namaInovator: "-",
            kategoriInovasi: "-",
          });
        }
      });

      exportTemp.sort((a, b) => a.namaDesa.localeCompare(b.namaDesa));
      console.log("Exported Data:", exportTemp);

      const pinsTemp: DesaPin[] = villages.map((desa) => ({
        desaId: desa.desaId,
        namaDesa: desa.namaDesa,
        desaKelurahan: capitalizeWords(desa.lokasi?.desaKelurahan),
        kecamatan: capitalizeWords(desa.lokasi?.kecamatan),
        kabupatenKota: capitalizeWords(desa.lokasi?.kabupatenKota),
        provinsi: capitalizeWords(desa.lokasi?.provinsi),
        lat: desa?.latitude,
        lng: desa?.longitude,
        inovasiId: null,
        inovasiList: [],
      }));

      console.log("xxxxx", pinsTemp)

      // Update kalau ada klaim inovasi
      claimInnovations.forEach((claim) => {
        const idx = pinsTemp.findIndex((p) => p.desaId === claim.desaId);
        if (idx !== -1) {
          pinsTemp[idx].inovasiId = claim.inovasiId ?? null;
          pinsTemp[idx].inovasiList.push(claim.namaInovasi);
        }
      });

      setExportData(exportTemp);
      setDesaPins(pinsTemp);
      setTotals(countByProvince);
    };

    fetchAllData();
  }, [db]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const downloadDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Header with green background
    doc.setFillColor(0, 128, 0);
    doc.rect(0, 0, 1000, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");

    doc.setFontSize(15);
    doc.text("Dokumen Laporan Kementerian", 14, 13);
    doc.text("KMS Inovasi Desa Digital", 280, 13, { align: "right" });

    doc.setFontSize(12);
    doc.text("Diambil dari: Peta Sebaran Desa Digital", 14, 22);
    doc.text(`Diunduh pada: ${downloadDate}`, 280, 22, { align: "right" });

    // Reset text styles for content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");

    // Inovator profile section
    let y = 42;
    const labelX = 14;
    const valueX = 50;
    const lineHeight = 8;

    // Title before table
    doc.setFont("helvetica", "bold");
    doc.text(`Data Sebaran Inovasi Desa Digital`, labelX, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [[
        "Nama Desa",
        "Kecamatan",
        "Kabupaten",
        "Provinsi",
        "Kategori Desa",
        "IDM",
        "Potensi Desa",
        "Nama Inovasi",
        "Kategori Inovasi",
        "Nama Inovator",
      ]],
      body: exportData.map((row) => [
        row.desaKelurahan,
        row.kecamatan,
        row.kabupatenKota,
        row.provinsi,
        row.kategoriDesa,
        row.idm,
        row.potensi,
        row.namaInovasi,
        row.kategoriInovasi,
        row.namaInovator,
      ]),
      headStyles: {
        fillColor: [0, 128, 0],
        textColor: 255,
        fontStyle: "bold",
        minCellHeight: 12,
      },
      columnStyles: {
        0: { cellWidth: 25 },  // Desa
        1: { cellWidth: 25 },  // Kecamatan
        2: { cellWidth: 25 },  // Kabupaten
        3: { cellWidth: 25 },  // Provinsi
        4: { cellWidth: 25 },  // Kategori Desa
        5: { cellWidth: 15 },  // IDM
        6: { cellWidth: 35 },  // Potensi Desa
        7: { cellWidth: 30 },  // Nama Inovasi
        8: { cellWidth: 30 },  // Kategori Inovasi
        9: { cellWidth: 30 },  // Nama Inovator
      }
    } as any);

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
      <Flex justify="space-between" align="center" mb={3}>
        <Text {...headerTextStyle}>Peta Sebaran Desa Digital</Text>
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
          <MapContainer center={[2, 120]} zoom={3}
            style={{ height: "100%", width: "100%", zIndex: 0 }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {Object.keys(totals).length > 0 && (
              <GeoJSON
                data={geoData as any}
                style={(feature) => provinceStyle(feature, totals)}
                onEachFeature={(feature, layer) => onEachFeature(feature, layer, totals)}
              />
            )}
          {desaPins
            .filter(
              (desa) =>
                desa.lat !== undefined &&
                desa.lng !== undefined &&
                !isNaN(desa.lat) &&
                !isNaN(desa.lng) &&
                (!selectedProvince || cleanName(desa.provinsi) === cleanName(selectedProvince))
            )
            .map((desa) => (
              <Marker key={desa.desaId} position={[desa.lat, desa.lng]}>
                <Popup>
                  <strong>{desa.namaDesa}</strong>
                  <br />
                  Inovasi: {desa.inovasiList.length > 0 ? desa.inovasiList.join(", ") : "-"}
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
        provinces={[...new Set(desaPins.map((item) => item.provinsi))].sort()}
      />
    </Box>
  );
};

export default MapVillages;