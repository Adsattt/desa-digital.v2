import React, { useEffect, useState } from "react";
import { IconButton } from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import * as XLSX from "xlsx";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const DownloadReport: React.FC = () => {
  const [totalVillage, setTotalVillage] = useState(0);
  const [totalInnovators, setTotalInnovators] = useState(0);
  const [totalInnovation, setTotalInnovation] = useState(0);
  const [innovatorsData, setInnovatorsData] = useState<any[]>([]);
  const [innovationsData, setInnovationsData] = useState<any[]>([]);
  const [villagesData, setVillagesData] = useState<any[]>([]);

  const formatDate = (timestamp: any) => {
    if (timestamp?.toDate) {
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
          .map(doc => doc.data())
          .filter(data => data.namaDesa && data.namaDesa.trim() !== "");
        setVillagesData(villageData);
        setTotalVillage(villageData.length);

        // Fetch Innovators
        const innovatorSnapshot = await getDocs(collection(db, "innovators"));
        const innovatorData = innovatorSnapshot.docs.map(doc => doc.data());
        setInnovatorsData(innovatorData);
        setTotalInnovators(innovatorData.length);

        // Fetch Innovations
        const innovationSnapshot = await getDocs(collection(db, "innovations"));
        const innovationData = innovationSnapshot.docs.map(doc => doc.data());
        setInnovationsData(innovationData);
        setTotalInnovation(innovationData.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleDownload = () => {
    const kecamatanSet = new Set(
      villagesData.map(d => d.lokasi?.kecamatan?.label).filter(Boolean)
    );
    const kabupatenSet = new Set(
      villagesData.map(d => d.lokasi?.kabupatenKota?.label).filter(Boolean)
    );
    const provinsiSet = new Set(
      villagesData.map(d => d.lokasi?.provinsi?.label).filter(Boolean)
    );

    const topInnovator = [...innovatorsData].sort(
      (a, b) => (b.jumlahInovasi || 0) - (a.jumlahInovasi || 0)
    )[0];

    const topInnovation = [...innovationsData].sort(
      (a, b) => (b.jumlahDesaKlaim || 0) - (a.jumlahDesaKlaim || 0)
    )[0];

    const topVillage = [...villagesData]
      .filter(v => v.jumlahInovasi != null)
      .sort((a, b) => (b.jumlahInovasi || 0) - (a.jumlahInovasi || 0))[0];

    const topVillageName = topVillage?.namaDesa || "-";
    const topVillageCount = topVillage?.jumlahInovasi || 0;

    // Sheet 1: Informasi Umum
    const generalInfo = [
      { Kategori: "Inovator", Jumlah: totalInnovators, Ket: "" },
      { Kategori: "Inovasi", Jumlah: totalInnovation, Ket: "" },
      { Kategori: "Desa Digital", Jumlah: totalVillage, Ket: "" },
      { Kategori: "Kecamatan", Jumlah: kecamatanSet.size, Ket: "" },
      { Kategori: "Kabupaten", Jumlah: kabupatenSet.size, Ket: "" },
      { Kategori: "Provinsi", Jumlah: provinsiSet.size, Ket: "" },
      {
        Kategori: "Inovator yang Paling Banyak Inovasi",
        Jumlah: topInnovator?.jumlahInovasi || "",
        Ket: topInnovator?.namaInovator || "-",
      },
      {
        Kategori: "Inovasi yang Paling Banyak Diklaim",
        Jumlah: topInnovation?.jumlahDesaKlaim || "",
        Ket: topInnovation?.namaInovasi || "-",
      },
      {
        Kategori: "Desa yang Paling Banyak Menerapkan Inovasi",
        Jumlah: topVillageCount,
        Ket: topVillageName,
      },
    ];

    const generalWorksheet = XLSX.utils.json_to_sheet(generalInfo);

    // Sheet 2: Data Desa
    const villageWorksheet = XLSX.utils.json_to_sheet(
      villagesData.map(village => ({
        "Nama Desa": village.namaDesa || " ",
        "Kecamatan": village.lokasi?.kecamatan?.label || " ",
        "Kabupaten/Kota": village.lokasi?.kabupatenKota?.label || " ",
        "Provinsi": village.lokasi?.provinsi?.label || " ",
        "Klasifikasi Geografis": village.geografisDesa || " ",
        "Potensi Desa": Array.isArray(village.potensiDesa)
          ? village.potensiDesa
              .map((p: string) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
              .join(", ")
          : " ",
        "Kondisi Jalan Desa": village.infrastrukturDesa || " ",
        "Kesiapan Digital": village.kesiapanDigital || " ",
        "Kesiapan Teknologi": village.kesiapanTeknologi || " ",
        "Whatsapp": village.whatsapp || " ",
        "Status Desa": village.status || " ",
        "Tanggal Input Data": formatDate(village.createdAt),
      }))
    );

    // Sheet 3: Data Inovator
    const innovatorWorksheet = XLSX.utils.json_to_sheet(
      innovatorsData.map(innovator => ({
        "Nama Inovator": innovator.namaInovator || " ",
        "Kategori": innovator.kategori || " ",
        "Jumlah Inovasi": innovator.jumlahInovasi || " ",
        "Jumlah Desa Dampingan": innovator.jumlahDesaDampingan || " ",
        "Model Bisnis": innovator.modelBisnis || " ",
        "Website": innovator.website || " ",
        "Instagram": innovator.instagram || " ",
        "WhatsApp": innovator.whatsapp || " ",
        "Status": innovator.status || " ",
        "Tanggal Input Data": formatDate(innovator.createdAt),
      }))
    );

    // Sheet 4: Data Inovasi
    const innovationWorksheet = XLSX.utils.json_to_sheet(
      innovationsData.map(innovation => ({
        "Nama Inovasi": innovation.namaInovasi || " ",
        "Nama Inovator": innovation.namaInnovator || " ",
        "Kategori": innovation.kategori || " ",
        "Tahun Dibuat": innovation.tahunDibuat || " ",
        "Jumlah Desa Klaim": innovation.jumlahDesaKlaim || " ",
        "Input Desa Menerapkan": Array.isArray(innovation.inputDesaMenerapkan)
          ? innovation.inputDesaMenerapkan.join(", ")
          : " ",
        "Target Pengguna": innovation.targetPengguna || " ",
        "Tanggal Input Data": formatDate(innovation.createdAt),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, generalWorksheet, "Informasi Umum");
    XLSX.utils.book_append_sheet(workbook, villageWorksheet, "Data Desa");
    XLSX.utils.book_append_sheet(workbook, innovatorWorksheet, "Data Inovator");
    XLSX.utils.book_append_sheet(workbook, innovationWorksheet, "Data Inovasi");
    XLSX.writeFile(workbook, "Report Dashboard Admin.xlsx");
  };

  return (
    <IconButton
      aria-label="Download Report"
      icon={<DownloadIcon boxSize={5} color="white" />}
      variant="ghost"
      height="40px"
      padding={1}
      onClick={handleDownload}
      _hover={{ bg: "whiteAlpha.300" }}
      _active={{ bg: "whiteAlpha.400" }}
    />
  );
};

export default DownloadReport;
