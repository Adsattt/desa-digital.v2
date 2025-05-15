import React, { useEffect, useState } from "react";
import { IconButton } from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  fileName = "Report Dashboard Desa.pdf",
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

      const inovatorStats: Record<string, { jumlahInovasi: number }> = {};
      const inovatorData: InovatorReportData[] = [];

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

          const namaInovasi = data.namaInovasi || "Tidak Ada Nama Inovasi";
          const kategori = data.kategori || "Tidak Ada Kategori";
          const tahun = data.createdAt ? new Date(data.createdAt.toDate()).getFullYear().toString() : "Tidak Ada Tahun";

          inovatorData.push({
            no: inovatorData.length + 1,
            namaInovator,
            namaInovasi,
            kategori,
            jumlahInovasi: inovatorStats[inovatorId].jumlahInovasi,
            namaDesa,
            jumlahDesaDampingan,
            tahun,
          });
        }
      });

      inovatorData.sort((a, b) => b.jumlahInovasi - a.jumlahInovasi);
      setInovatorData(inovatorData);
    } catch (error) {
      console.error("Error fetching innovator data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Set Helvetica as the default font (similar to Arial)
    doc.setFont("helvetica");

    autoTable(doc, {
      head: [["No", "Nama Inovator", "Nama Inovasi", "Kategori Inovasi", "Tahun", "Jumlah Desa Dampingan", "Desa Dampingan Lainnya"]],
      body: inovatorData.map((item) => [
        item.no,
        item.namaInovator,
        item.namaInovasi,
        item.kategori,
        item.tahun,
        item.jumlahDesaDampingan,
        item.namaDesa,
      ]),
      styles: {
        fontSize: 10,
        font: "helvetica"
      },
      headStyles: {
        fillColor: [0, 128, 0], 
        textColor: [255, 255, 255], 
        fontStyle: 'bold',
        font: "helvetica" 
      }
    });

    doc.save(fileName);
  };

  return (
    <IconButton
      aria-label="Download Report"
      icon={<DownloadIcon boxSize={5} color="white" />}
      variant="ghost"
      height="40px"
      padding={1}
      onClick={handleDownloadPDF}
      _hover={{ bg: "whiteAlpha.300" }}
      _active={{ bg: "whiteAlpha.400" }}
    />
  );
};

export default DownloadReport;