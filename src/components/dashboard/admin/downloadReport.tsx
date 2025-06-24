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
  jumlahInovasi?: number;
  kecamatan?: string;
  kabupatenKota?: string;
  provinsi?: string;
  kontak?: {
    whatsapp?: string;
    instagram?: string;
    website?: string;
  };
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

  // Warna header untuk autotable
  const headerStyles = {
    fillColor: [52, 115, 87], // #347357
    textColor: 255,
    fontStyle: "bold",
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    const totalVillage = villagesData.filter(v => v.jumlahInovasi && v.jumlahInovasi > 0).length;
    const totalInnovators = innovatorsData.length;
    const totalInnovation = innovationsData.length;

    const desaPalingBanyak = [...villagesData].filter(v => typeof v.jumlahInovasi === "number").sort((a, b) => (b.jumlahInovasi ?? 0) - (a.jumlahInovasi ?? 0))[0];
    const desaPalingSedikit = [...villagesData].filter(v => typeof v.jumlahInovasi === "number").sort((a, b) => (a.jumlahInovasi ?? 0) - (b.jumlahInovasi ?? 0))[0];

    const desaPalingBanyakKlaim = desaPalingBanyak
      ? `${desaPalingBanyak.namaDesa}, Kec. ${desaPalingBanyak.kecamatan ?? "-"}, Kab. ${desaPalingBanyak.kabupatenKota ?? "-"}, Prov. ${desaPalingBanyak.provinsi ?? "-"}`
      : "-";

    const desaPalingSedikitKlaim = desaPalingSedikit
      ? `${desaPalingSedikit.namaDesa}, Kec. ${desaPalingSedikit.kecamatan ?? "-"}, Kab. ${desaPalingSedikit.kabupatenKota ?? "-"}, Prov. ${desaPalingSedikit.provinsi ?? "-"}`
      : "-";

    // === Page 1: Summary ===
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
      head: [["Inovator", "Inovasi", "Desa Digital"]],
      body: [[totalInnovators, totalInnovation, totalVillage]],
      styles: { fontSize: 11 },
      headStyles: headerStyles,
    });

    const inovatorTerbanyak = [...innovatorsData].sort((a, b) => b.jumlahInovasi - a.jumlahInovasi)[0];
    const inovatorTersedikit = [...innovatorsData].sort((a, b) => a.jumlahInovasi - b.jumlahInovasi)[0];
    const inovasiTerbanyak = [...innovationsData].sort((a, b) => b.jumlahDesaKlaim - a.jumlahDesaKlaim)[0];
    const inovasiTersedikit = [...innovationsData].sort((a, b) => a.jumlahDesaKlaim - b.jumlahDesaKlaim)[0];

    doc.setFontSize(12);
    const yStart = 65;
    const dataText = [
      `Inovator terbanyak inovasi : ${inovatorTerbanyak?.namaInovator ?? "-"}`,
      `Inovasi paling banyak diklaim : ${inovasiTerbanyak?.namaInovasi ?? "-"}`,
      `Desa paling banyak klaim : ${desaPalingBanyakKlaim}`,
      ``,
      `Inovator tersedikit inovasi : ${inovatorTersedikit?.namaInovator ?? "-"}`,
      `Inovasi paling sedikit diklaim : ${inovasiTersedikit?.namaInovasi ?? "-"}`,
      `Desa paling sedikit klaim : ${desaPalingSedikitKlaim}`,
    ];

    dataText.forEach((text, i) => {
      doc.text(text, 15, yStart + i * 8);
    });

    // === Page 2: Village Data ===
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
      head: [["No", "Desa", "Kecamatan", "Kabupaten", "Provinsi"]],
      body: villagesData.map((v, i) => [
        i + 1,
        v.namaDesa || "-",
        v.kecamatan || "-",
        v.kabupatenKota || "-",
        v.provinsi || "-",
      ]),
      styles: { fontSize: 9 },
      headStyles: headerStyles,
    });

    // === Page 3: Innovator Data ===
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
      headStyles: headerStyles,
    });

    // === Page 4: Innovation Data ===
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
      headStyles: headerStyles,
    });

    doc.save("Report Dashboard Admin.pdf");
  };

  const handleDownloadExcel = () => {
  const workbook = XLSX.utils.book_new();

  // Hitung total desa digital
  const totalDigitalVillages = villagesData.filter(v => v.jumlahInovasi && v.jumlahInovasi > 0).length;

  // Cari data summary seperti di PDF
  const inovatorTerbanyak = [...innovatorsData].sort((a, b) => b.jumlahInovasi - a.jumlahInovasi)[0];
  const inovatorTersedikit = [...innovatorsData].sort((a, b) => a.jumlahInovasi - b.jumlahInovasi)[0];
  const inovasiTerbanyak = [...innovationsData].sort((a, b) => b.jumlahDesaKlaim - a.jumlahDesaKlaim)[0];
  const inovasiTersedikit = [...innovationsData].sort((a, b) => a.jumlahDesaKlaim - b.jumlahDesaKlaim)[0];

  const desaPalingBanyak = [...villagesData].filter(v => typeof v.jumlahInovasi === "number").sort((a, b) => (b.jumlahInovasi ?? 0) - (a.jumlahInovasi ?? 0))[0];
  const desaPalingSedikit = [...villagesData].filter(v => typeof v.jumlahInovasi === "number").sort((a, b) => (a.jumlahInovasi ?? 0) - (b.jumlahInovasi ?? 0))[0];

  // Format lokasi desa paling banyak dan paling sedikit klaim
  const desaPalingBanyakKlaim = desaPalingBanyak
    ? `${desaPalingBanyak.namaDesa}, Kec. ${desaPalingBanyak.kecamatan ?? "-"}, Kab. ${desaPalingBanyak.kabupatenKota ?? "-"}, Prov. ${desaPalingBanyak.provinsi ?? "-"}`
    : "-";

  const desaPalingSedikitKlaim = desaPalingSedikit
    ? `${desaPalingSedikit.namaDesa}, Kec. ${desaPalingSedikit.kecamatan ?? "-"}, Kab. ${desaPalingSedikit.kabupatenKota ?? "-"}, Prov. ${desaPalingSedikit.provinsi ?? "-"}`
    : "-";

  // Data summary baris demi baris untuk Excel
  const summaryInfo = [
    ["Total Desa Digital", totalDigitalVillages],
    ["Total Inovator", innovatorsData.length],
    ["Total Inovasi", innovationsData.length],
    [],
    ["Inovator terbanyak inovasi", inovatorTerbanyak?.namaInovator ?? "-"],
    ["Inovasi paling banyak diklaim", inovasiTerbanyak?.namaInovasi ?? "-"],
    ["Desa paling banyak klaim", desaPalingBanyakKlaim],
    [],
    ["Inovator tersedikit inovasi", inovatorTersedikit?.namaInovator ?? "-"],
    ["Inovasi paling sedikit diklaim", inovasiTersedikit?.namaInovasi ?? "-"],
    ["Desa paling sedikit klaim", desaPalingSedikitKlaim],
  ];

  // Fungsi untuk menghapus fields seperti createdAt, editedAt
  const cleanFields = <T extends Record<string, any>>(data: T[]) =>
    data.map(({ createdAt, editedAt, ...rest }) => rest);

  // Buat sheet "Informasi Umum" dari summaryInfo
  const generalSheet = XLSX.utils.aoa_to_sheet(summaryInfo);
  XLSX.utils.book_append_sheet(workbook, generalSheet, "Informasi Umum");

  // Sheet inovator, inovasi, desa seperti sebelumnya
  const innovatorSheet = XLSX.utils.json_to_sheet(cleanFields(innovatorsData));
  XLSX.utils.book_append_sheet(workbook, innovatorSheet, "Daftar Inovator");

  const innovationSheet = XLSX.utils.json_to_sheet(cleanFields(innovationsData));
  XLSX.utils.book_append_sheet(workbook, innovationSheet, "Daftar Inovasi");

  const fullVillageSheet = XLSX.utils.json_to_sheet(cleanFields(villagesData));
  XLSX.utils.book_append_sheet(workbook, fullVillageSheet, "Daftar Desa");

  XLSX.writeFile(workbook, "Report Dashboard Admin.xlsx");
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
