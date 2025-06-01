import React, { useEffect, useState } from "react";
import { IconButton, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import * as XLSX from "xlsx";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Type Definitions
interface Village {
  namaDesa: string;
  lokasi?: {
    kecamatan?: { label: string };
    kabupatenKota?: { label: string };
    provinsi?: { label: string };
  };
  kontak?: {
    whatsapp?: string;
    instagram?: string;
    website?: string;
  };
  createdAt?: { toDate: () => Date };
}

interface Innovator {
  namaInovator: string;
  kategori: string;
  jumlahInovasi: number;
}

interface Innovation {
  namaInovasi: string;
  kategori: string;
  jumlahDesaKlaim: number;
}

const DownloadReport: React.FC = () => {
  const [villagesData, setVillagesData] = useState<Village[]>([]);
  const [innovatorsData, setInnovatorsData] = useState<Innovator[]>([]);
  const [innovationsData, setInnovationsData] = useState<Innovation[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore();

        const villageSnapshot = await getDocs(collection(db, "villages"));
        const villageData = villageSnapshot.docs
          .map(doc => doc.data() as Village)
          .filter(data => data.namaDesa && data.namaDesa.trim() !== "");
        setVillagesData(villageData);

        const innovatorSnapshot = await getDocs(collection(db, "innovators"));
        const innovatorData = innovatorSnapshot.docs.map(doc => doc.data() as Innovator);
        setInnovatorsData(innovatorData);

        const innovationSnapshot = await getDocs(collection(db, "innovations"));
        const innovationData = innovationSnapshot.docs.map(doc => doc.data() as Innovation);
        setInnovationsData(innovationData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleDownloadExcel = () => {
    const workbook = XLSX.utils.book_new();

    const generalInfo = [
      ["Total Desa", villagesData.length],
      ["Total Inovator", innovatorsData.length],
      ["Total Inovasi", innovationsData.length],
    ];
    const generalSheet = XLSX.utils.aoa_to_sheet(generalInfo);
    XLSX.utils.book_append_sheet(workbook, generalSheet, "Informasi Umum");

    const innovatorSheet = XLSX.utils.json_to_sheet(innovatorsData);
    XLSX.utils.book_append_sheet(workbook, innovatorSheet, "Daftar Inovator");

    const innovationSheet = XLSX.utils.json_to_sheet(innovationsData);
    XLSX.utils.book_append_sheet(workbook, innovationSheet, "Daftar Inovasi");

    const digitalVillageSheet = XLSX.utils.json_to_sheet(
      villagesData.map(v => ({
        namaDesa: v.namaDesa,
        provinsi: v.lokasi?.provinsi?.label || "",
        kabupaten: v.lokasi?.kabupatenKota?.label || "",
        kecamatan: v.lokasi?.kecamatan?.label || "",
      }))
    );
    XLSX.utils.book_append_sheet(workbook, digitalVillageSheet, "Daftar Desa Digital");

    const fullVillageSheet = XLSX.utils.json_to_sheet(villagesData);
    XLSX.utils.book_append_sheet(workbook, fullVillageSheet, "Data Desa");

    XLSX.writeFile(workbook, "Laporan_KMS_Desa.xlsx");
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
  
    const totalVillage = villagesData.length;
    const totalInnovators = innovatorsData.length;
    const totalInnovation = innovationsData.length;
  
    // === Halaman 1: Ringkasan ===
    doc.setFontSize(18);
    doc.setTextColor(34, 102, 69);
    doc.text("Report Admin", 15, 15);
    doc.setFontSize(12);
    doc.text("KMS Inovasi Desa Digital", 15, 22);
    doc.setTextColor(0);
    doc.text(`Diunduh pada: ${new Date().toLocaleDateString("id-ID")}`, 160, 15, { align: "right" });
  
    doc.setFontSize(14);
    doc.text("Ringkasan Data:", 15, 35);
  
    autoTable(doc, {
      startY: 40,
      head: [["Inovator", "Inovasi", "Desa Digital", "Kecamatan", "Kabupaten", "Provinsi"]],
      body: [[
        totalInnovators,
        totalInnovation,
        totalVillage,
        new Set(villagesData.map(v => v.lokasi?.kecamatan?.label).filter(Boolean)).size,
        new Set(villagesData.map(v => v.lokasi?.kabupatenKota?.label).filter(Boolean)).size,
        new Set(villagesData.map(v => v.lokasi?.provinsi?.label).filter(Boolean)).size,
      ]],
      styles: { fontSize: 11 },
    });
  
    const inovatorTerbanyak = [...innovatorsData].sort((a, b) => b.jumlahInovasi - a.jumlahInovasi)[0];
    const inovatorTersedikit = [...innovatorsData].sort((a, b) => a.jumlahInovasi - b.jumlahInovasi)[0];
    const inovasiTerbanyak = [...innovationsData].sort((a, b) => b.jumlahDesaKlaim - a.jumlahDesaKlaim)[0];
    const inovasiTersedikit = [...innovationsData].sort((a, b) => a.jumlahDesaKlaim - b.jumlahDesaKlaim)[0];
  
    const desaPalingBanyakKlaim = "Desa Sukamandi, Kec. xx, Kab. xx, Prov. xx";
    const desaPalingSedikitKlaim = "Desa Cicurug, Kec. xx, Kab. xx, Prov. xx";
  
    doc.setFontSize(12);
    const yStart = 65;
    const dataText = [
      `Inovator yang paling banyak Inovasi : ${inovatorTerbanyak?.namaInovator || "-"}`,
      `Inovasi yang paling banyak Diklaim : ${inovasiTerbanyak?.namaInovasi || "-"}`,
      `Desa yang paling banyak Klaim Inovasi : ${desaPalingBanyakKlaim}`,
      ``,
      `Inovator yang paling sedikit Inovasi : ${inovatorTersedikit?.namaInovator || "-"}`,
      `Inovasi yang paling sedikit Diklaim : ${inovasiTersedikit?.namaInovasi || "-"}`,
      `Desa yang paling sedikit Klaim Inovasi : ${desaPalingSedikitKlaim}`,
    ];
  
    dataText.forEach((text, i) => {
      doc.text(text, 15, yStart + i * 8);
    });
  
    // === Halaman 2: Data Desa ===
    doc.addPage();
    doc.setFontSize(18);
    doc.setTextColor(34, 102, 69);
    doc.text("Report Admin", 15, 15);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("KMS Inovasi Desa Digital", 15, 22);
    doc.text(`Total: ${villagesData.length} Desa`, 15, 30);
    doc.text(`Diunduh pada: ${new Date().toLocaleDateString("id-ID")}`, 160, 15, { align: "right" });
  
    doc.setFontSize(14);
    doc.text("Data Desa:", 15, 40);
  
    autoTable(doc, {
      startY: 45,
      head: [["No", "Desa", "Kecamatan", "Kabupaten", "Provinsi", "WhatsApp", "Instagram", "Website"]],
      body: villagesData.map((v, i) => [
        i + 1,
        v.namaDesa || " ",
        v.lokasi?.kecamatan?.label || " ",
        v.lokasi?.kabupatenKota?.label || " ",
        v.lokasi?.provinsi?.label || " ",
        v.kontak?.whatsapp || " ",
        v.kontak?.instagram || " ",
        v.kontak?.website || " ",
      ]),
      styles: { fontSize: 9 },
    });
  
    // === Halaman 3: Data Inovator ===
    doc.addPage();
    doc.setFontSize(18);
    doc.setTextColor(34, 102, 69);
    doc.text("Report Admin", 15, 15);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("KMS Inovasi Desa Digital", 15, 22);
    doc.text(`Total: ${innovatorsData.length} Inovator`, 15, 30);
    doc.text(`Diunduh pada: ${new Date().toLocaleDateString("id-ID")}`, 160, 15, { align: "right" });
  
    doc.setFontSize(14);
    doc.text("Data Inovator:", 15, 40);
  
    autoTable(doc, {
      startY: 45,
      head: [["No", "Nama Inovator", "Kategori", "Jumlah Inovasi"]],
      body: innovatorsData.map((i, idx) => [
        idx + 1,
        i.namaInovator || "-",
        i.kategori || "-",
        i.jumlahInovasi ?? 0,
      ]),
      styles: { fontSize: 9 },
    });
  
    // === Halaman 4: Data Inovasi ===
    doc.addPage();
    doc.setFontSize(18);
    doc.setTextColor(34, 102, 69);
    doc.text("Report Admin", 15, 15);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("KMS Inovasi Desa Digital", 15, 22);
    doc.text(`Total: ${innovationsData.length} Inovasi`, 15, 30);
    doc.text(`Diunduh pada: ${new Date().toLocaleDateString("id-ID")}`, 160, 15, { align: "right" });
  
    doc.setFontSize(14);
    doc.text("Data Inovasi:", 15, 40);
  
    autoTable(doc, {
      startY: 45,
      head: [["No", "Nama Inovasi", "Kategori", "Jumlah Desa Klaim"]],
      body: innovationsData.map((i, idx) => [
        idx + 1,
        i.namaInovasi || "-",
        i.kategori || "-",
        i.jumlahDesaKlaim ?? 0,
      ]),
      styles: { fontSize: 9 },
    });
  
    doc.save("Report_Dashboard_Admin.pdf");
  };
  

  return (
    <Menu placement="bottom-end">
      <MenuButton
        as={IconButton}
        aria-label="Download Report"
        icon={<DownloadIcon boxSize={5} color="white" />}
        variant="ghost"
        height="40px"
        padding={1}
        _hover={{ bg: "whiteAlpha.300" }}
        _active={{ bg: "whiteAlpha.400" }}
      />
      <MenuList>
        <MenuItem onClick={handleDownloadPDF}>Download as PDF</MenuItem>
        <MenuItem onClick={handleDownloadExcel}>Download as Excel</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default DownloadReport;
