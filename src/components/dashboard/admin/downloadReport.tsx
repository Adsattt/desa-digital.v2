import React, { useEffect, useState } from "react";
import { IconButton, Menu, MenuButton, MenuItem, MenuList, Button } from "@chakra-ui/react";
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
  const [totalVillage, setTotalVillage] = useState(0);
  const [totalInnovators, setTotalInnovators] = useState(0);
  const [totalInnovation, setTotalInnovation] = useState(0);
  const [innovatorsData, setInnovatorsData] = useState<Innovator[]>([]);
  const [innovationsData, setInnovationsData] = useState<Innovation[]>([]);
  const [villagesData, setVillagesData] = useState<Village[]>([]);

  const formatDate = (timestamp?: { toDate: () => Date }): string => {
    if (timestamp) {
      const date = timestamp.toDate();
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(date);
    }
    return "";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore();

        // Fetch Villages
        const villageSnapshot = await getDocs(collection(db, "villages"));
        const villageData = villageSnapshot.docs
          .map(doc => doc.data() as Village)
          .filter(data => data.namaDesa && data.namaDesa.trim() !== "");
        setVillagesData(villageData);
        setTotalVillage(villageData.length);

        // Fetch Innovators
        const innovatorSnapshot = await getDocs(collection(db, "innovators"));
        const innovatorData = innovatorSnapshot.docs.map(doc => doc.data() as Innovator);
        setInnovatorsData(innovatorData);
        setTotalInnovators(innovatorData.length);

        // Fetch Innovations
        const innovationSnapshot = await getDocs(collection(db, "innovations"));
        const innovationData = innovationSnapshot.docs.map(doc => doc.data() as Innovation);
        setInnovationsData(innovationData);
        setTotalInnovation(innovationData.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleDownloadExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Informasi Umum
    const generalInfo = [
      { Kategori: "Inovator", Jumlah: totalInnovators },
      { Kategori: "Inovasi", Jumlah: totalInnovation },
      { Kategori: "Desa Digital", Jumlah: totalVillage },
    ];
    const generalWorksheet = XLSX.utils.json_to_sheet(generalInfo);
    XLSX.utils.book_append_sheet(workbook, generalWorksheet, "Informasi Umum");

    // Sheet 2: Data Desa
    const villageWorksheet = XLSX.utils.json_to_sheet(
      villagesData.map(village => ({
        "Nama Desa": village.namaDesa || " ",
        "Kecamatan": village.lokasi?.kecamatan?.label || " ",
        "Kabupaten/Kota": village.lokasi?.kabupatenKota?.label || " ",
        "Provinsi": village.lokasi?.provinsi?.label || " ",
        "Tanggal Input Data": formatDate(village.createdAt),
      }))
    );
    XLSX.utils.book_append_sheet(workbook, villageWorksheet, "Data Desa");

    // Sheet 3: Data Inovator
    const innovatorWorksheet = XLSX.utils.json_to_sheet(
      innovatorsData.map(innovator => ({
        "Nama Inovator": innovator.namaInovator || " ",
        "Kategori": innovator.kategori || " ",
        "Jumlah Inovasi": innovator.jumlahInovasi || " ",
      }))
    );
    XLSX.utils.book_append_sheet(workbook, innovatorWorksheet, "Data Inovator");

    // Sheet 4: Data Inovasi
    const innovationWorksheet = XLSX.utils.json_to_sheet(
      innovationsData.map(innovation => ({
        "Nama Inovasi": innovation.namaInovasi || " ",
        "Kategori": innovation.kategori || " ",
        "Jumlah Desa Klaim": innovation.jumlahDesaKlaim || " ",
      }))
    );
    XLSX.utils.book_append_sheet(workbook, innovationWorksheet, "Data Inovasi");

    XLSX.writeFile(workbook, "Report_Dashboard_Admin.xlsx");
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // **Informasi Umum**
    doc.setFontSize(14);
    doc.text("Informasi Umum", 10, 10);
    autoTable(doc, {
      startY: 15,
      head: [["Kategori", "Jumlah"]],
      body: [
        ["Inovator", totalInnovators.toString()],
        ["Inovasi", totalInnovation.toString()],
        ["Desa Digital", totalVillage.toString()],
      ],
      styles: { fontSize: 12 },
    });

    // **Data Desa**
    doc.addPage();
    doc.text("Data Desa", 10, 10);
    autoTable(doc, {
      startY: 15,
      head: [["Nama Desa", "Kecamatan", "Kabupaten/Kota", "Provinsi", "Tanggal Input Data"]],
      body: villagesData.map(village => [
        village.namaDesa || " ",
        village.lokasi?.kecamatan?.label || " ",
        village.lokasi?.kabupatenKota?.label || " ",
        village.lokasi?.provinsi?.label || " ",
        formatDate(village.createdAt),
      ]),
      styles: { fontSize: 10 },
    });

    // Data Inovator
    doc.addPage();
    doc.text("Data Inovator", 10, 10);
    autoTable(doc, {
      startY: 15,
      head: [["Nama Inovator", "Kategori", "Jumlah Inovasi"]],
      body: innovatorsData.map(innovator => [
        innovator?.namaInovator || " ",
        innovator?.kategori || " ",
        innovator?.jumlahInovasi?.toString() || "0",
      ]),
      styles: { fontSize: 10 },
    });


    // Data Inovasi
    doc.addPage();
    doc.text("Data Inovasi", 10, 10);
    autoTable(doc, {
      startY: 15,
      head: [["Nama Inovasi", "Kategori", "Jumlah Desa Klaim"]],
      body: innovationsData.map(innovation => [
        innovation?.namaInovasi || " ",
        innovation?.kategori || " ",
        innovation?.jumlahDesaKlaim?.toString() || "0",
      ]),
      styles: { fontSize: 10 },
    });


    // Save PDF
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
        <MenuItem onClick={handleDownloadExcel}>Download as Excel</MenuItem>
        <MenuItem onClick={handleDownloadPDF}>Download as PDF</MenuItem>
      </MenuList>
    </Menu>

  );
};

export default DownloadReport;
