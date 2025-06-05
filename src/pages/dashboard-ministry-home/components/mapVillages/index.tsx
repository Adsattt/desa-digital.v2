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
  inovasiId: string;
  inovasiName?: string;
  provinsi: string;
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
      const inovasiSnap = await getDocs(collection(db, "inovasi"));
      const inovasiMap = new Map<string, { namaInovator: string; kategoriInovasi: string }>();
      inovasiSnap.docs.forEach(doc => {
        const d = doc.data();
        inovasiMap.set(d.namaInovasi, {
          namaInovator: d.namaInovator,
          kategoriInovasi: d.kategoriInovasi,
        });
      });

      const desaSnap = await getDocs(collection(db, "profilDesa"));
      const desaMap = new Map<string, any>();
      desaSnap.docs.forEach(doc => {
        const d = doc.data();
        desaMap.set(d.namaDesa, d);
      });

      const menerapkanSnap = await getDocs(collection(db, "menerapkanInovasi"));
      const exportTemp: any[] = [];
      const pinsTemp: DesaPin[] = [];
      const countByProvince: Record<string, number> = {};

      for (const doc of menerapkanSnap.docs) {
        const d = doc.data();
        const desaData = desaMap.get(d.namaDesa);
        if (!desaData || desaData.latitude == null || desaData.longitude == null) continue;

        const provinsi = desaData.provinsi || "Unknown";
        const provKey = cleanName(provinsi);
        countByProvince[provKey] = (countByProvince[provKey] || 0) + 1;

        const inovasiInfo = inovasiMap.get(d.namaInovasi) || {
          namaInovator: "-",
          kategoriInovasi: "-",
        };

        exportTemp.push({
          namaDesa: desaData.namaDesa ?? "-",
          kecamatan: desaData.kecamatan ?? "-",
          kabupaten: desaData.kabupaten ?? "-",
          provinsi: provinsi,
          kategoriDesa: desaData.kategoriDesa ?? "-",
          idm: desaData.idm ?? "-",
          potensi: desaData.potensi ?? "-",
          namaInovasi: d.namaInovasi ?? "-",
          namaInovator: inovasiInfo.namaInovator,
          kategoriInovasi: inovasiInfo.kategoriInovasi,
        });

        pinsTemp.push({
          desaId: doc.id,
          namaDesa: desaData.namaDesa,
          lat: desaData.latitude,
          lng: desaData.longitude,
          inovasiId: d.inovasiId || "",
          inovasiName: d.namaInovasi,
          provinsi: provinsi,
        });
      }

      setExportData(exportTemp);
      setDesaPins(pinsTemp);
      setTotals(countByProvince);
    };

    fetchAllData();
  }, [db]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Data Sebaran Inovasi", 14, 10);
    autoTable(doc, {
      head: [[
        "Nama Desa", "Kecamatan", "Kabupaten", "Provinsi",
        "Kategori Desa", "IDM", "Potensi",
        "Nama Inovasi", "Kategori Inovasi", "Nama Inovator"
      ]],
      body: exportData.map((row) => [
        row.namaDesa, row.kecamatan, row.kabupaten, row.provinsi,
        row.kategoriDesa, row.idm, row.potensi,
        row.namaInovasi, row.kategoriInovasi, row.namaInovator
      ]),
      startY: 20,
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
      <Flex justify="space-between" align="center" mb={3}>
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
          <MapContainer center={[2, 120]} zoom={3} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <GeoJSON
              data={geoData as any}
              style={(feature) => provinceStyle(feature, totals)}
              onEachFeature={(feature, layer) => onEachFeature(feature, layer, totals)}
            />
            {desaPins
              .filter((desa) => selectedProvince ? desa.provinsi === selectedProvince : true)
              .map((desa) => (
                <Marker key={desa.desaId} position={[desa.lat, desa.lng]}>
                  <Popup>
                    <strong>{desa.namaDesa}</strong><br />
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