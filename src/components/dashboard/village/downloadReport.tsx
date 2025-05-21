import React, { useEffect, useState } from "react";
import { IconButton } from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import * as XLSX from "xlsx";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export type InovatorReportData = {
  no: number;
  namaInovator: string;
  jumlahInovasi: number;
  namaInovasi: string;
  kategori: string;  // Menambahkan kategori pada data
  jumlahDesaDampingan: number;
  namaDesa: string;
  tahun: string;  // Menambahkan tahun pada data
};

type DownloadReportProps = {
  fileName?: string;
};

const DownloadReport: React.FC<DownloadReportProps> = ({
  fileName = "Report Dashboard Desa.xlsx",
}) => {
  const [inovatorData, setInovatorData] = useState<InovatorReportData[]>([]);

  // Fungsi untuk mengambil data dari Firestore
  const fetchData = async () => {
    try {
      const db = getFirestore();
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("User belum login");
        return;
      }

      // Ambil data desa berdasarkan ID user
      const desaQuery = query(
        collection(db, "villages"),
        where("userId", "==", user.uid)
      );
      const desaSnap = await getDocs(desaQuery);

      let namaDesa = "";
      let desaID = "";
      if (!desaSnap.empty) {
        const desaData = desaSnap.docs[0].data() as { namaDesa: string, desaID: string };
        namaDesa = desaData.namaDesa || "";
        desaID = desaData.desaID || "";
      } else {
        console.warn("Desa tidak ditemukan untuk user ini");
        return;
      }

      // Ambil semua inovasi yang diterapkan di desa ini
      const innovationsSnap = await getDocs(collection(db, "innovations"));
      const desaInovasi = innovationsSnap.docs.filter((doc) => {
        const inputDesaMenerapkan = doc.data().inputDesaMenerapkan;
        return Array.isArray(inputDesaMenerapkan) &&
          inputDesaMenerapkan.some((nama: string) =>
            nama?.toLowerCase().trim() === namaDesa.toLowerCase().trim()
          );
      });

      // Ambil semua inovator
      const innovatorSnap = await getDocs(collection(db, "innovators"));
      const inovators = innovatorSnap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().namaInovator as string,
      }));

      // Hitung jumlah inovasi per inovator hanya di desa ini
      const inovatorStats: Record<string, { jumlahInovasi: number }> = {};
      const inovatorData: InovatorReportData[] = [];

      // Proses inovasi dan hitung kontribusi per inovator
      desaInovasi.forEach((doc) => {
        const data = doc.data();
        const inputDesaMenerapkan = data.inputDesaMenerapkan || [];
        const inovatorId = data.innovatorId;

        if (inovatorId) {
          if (!inovatorStats[inovatorId]) {
            inovatorStats[inovatorId] = { jumlahInovasi: 0 };
          }

          inovatorStats[inovatorId].jumlahInovasi += 1;

          const namaDesa = inputDesaMenerapkan.join(", ");
          const jumlahDesaDampingan = inputDesaMenerapkan.length;

          const inovatorDoc = inovators.find((inovator) => inovator.id === inovatorId);
          const namaInovator = inovatorDoc ? inovatorDoc.name : "Tidak Ada Nama Inovator";

          // Ambil nama inovasi, kategori, dan tahun dari createdAt
          const namaInovasi = data.namaInovasi || "Tidak Ada Nama Inovasi";  
          const kategori = data.kategori || "Tidak Ada Kategori";  

          // Ekstrak tahun dari createdAt
          const tahun = data.createdAt ? new Date(data.createdAt.toDate()).getFullYear().toString() : "Tidak Ada Tahun";

          inovatorData.push({
            no: inovatorData.length + 1,
            namaInovator,
            namaInovasi,
            kategori,
            jumlahInovasi: inovatorStats[inovatorId].jumlahInovasi,
            namaDesa,
            jumlahDesaDampingan,
            tahun, // Menambahkan kolom tahun
          });
        }
      });

      // Urutkan berdasarkan jumlah inovasi yang diterapkan
      inovatorData.sort((a, b) => b.jumlahInovasi - a.jumlahInovasi);

      setInovatorData(inovatorData);  // Simpan data inovator ke state
    } catch (error) {
      console.error("❌ Error fetching innovator data:", error);
    }
  };

  useEffect(() => {
    fetchData();  // Ambil data saat komponen pertama kali dimuat
  }, []);

  // Fungsi untuk download report ke Excel
  const handleDownload = () => {
    const excelData = inovatorData.map((item) => ({
      No: item.no,
      "Nama Inovator": item.namaInovator,
      "Nama Inovasi": item.namaInovasi,
      "Kategori Inovasi": item.kategori,
      "Tahun": item.tahun, 
      "Jumlah Desa Dampingan Inovator": item.jumlahDesaDampingan,
      "Desa Dampingan Lainnya": item.namaDesa,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    XLSX.writeFile(workbook, fileName);
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