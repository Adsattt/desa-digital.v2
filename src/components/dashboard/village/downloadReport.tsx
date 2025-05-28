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
  const [desaMetadata, setDesaMetadata] = useState<any>(null);

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

      // Ambil data desa berdasarkan userId
      const desaQuery = query(
        collection(db, "villages"),
        where("userId", "==", user.uid)
      );
      const desaSnap = await getDocs(desaQuery);

      let namaDesa = "";
      let desaMeta: any = {};

      if (!desaSnap.empty) {
        const desaData = desaSnap.docs[0].data();

        namaDesa = desaData.namaDesa || "";

        desaMeta = {
          namaDesa: desaData.namaDesa || "",
          kecamatan: desaData.kecamatan || "",
          kabupatenKota: desaData.kabupatenKota || "",
          provinsi: desaData.provinsi || "",
          potensiDesa: desaData.potensiDesa || [],
          geografisDesa: desaData.geografisDesa || "",
          infrastrukturDesa: desaData.infrastrukturDesa || "",
          kesiapanDigital: desaData.kesiapanDigital || "",
          literasiDigital: desaData.literasiDigital || "",
          pemantapanPelayanan: desaData.pemantapanPelayanan || "",
          sosialBudaya: desaData.sosialBudaya || "",
          sumberDaya: desaData.sumberDaya || ""
        };
      } else {
        console.warn("Desa tidak ditemukan untuk user ini");
        return;
      }

      // Ambil semua inovasi yang diterapkan di desa ini
      const innovationsSnap = await getDocs(collection(db, "innovations"));
      const desaInovasi = innovationsSnap.docs.filter((doc) => {
        const input = doc.data().inputDesaMenerapkan;
        if (Array.isArray(input)) {
          return input.some((nama: string) =>
            nama?.toLowerCase().trim() === namaDesa.toLowerCase().trim()
          );
        } else if (typeof input === "string") {
          return input.toLowerCase().trim() === namaDesa.toLowerCase().trim();
        }
        return false;
      });


      // Siapkan data inovator
      const inovatorData: InovatorReportData[] = [];

      desaInovasi.forEach((doc, index) => {
        const data = doc.data();

        const namaInovator = data.namaInovator || "Tidak Ada Nama";
        const namaInovasi = data.namaInovasi || "-";
        const kategori = data.kategori || "-";
        const tahun = data.tahunDibuat || "Tidak Ada Tahun";
        const input = data.inputDesaMenerapkan || [];
        const namaDesaLain = Array.isArray(input)
          ? input
            .filter((nama: string) => nama?.toLowerCase().trim() !== namaDesa.toLowerCase().trim())
            .join(", ")
          : "-";

        inovatorData.push({
          no: index + 1,
          namaInovator,
          namaInovasi,
          kategori,
          tahun,
          namaDesa: namaDesaLain || "-",
          jumlahInovasi: 1,
          jumlahDesaDampingan: input.length - 1
        });
      });

      setInovatorData(inovatorData.sort((a, b) => b.jumlahInovasi - a.jumlahInovasi));

      // Set meta data desa agar bisa dipakai untuk PDF
      setDesaMetadata(desaMeta); // Pastikan kamu punya state ini

    } catch (error) {
      console.error("❌ Error fetching innovator data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const marginLeft = 13;
    let currentY = 25;
    const lineHeight = 6;

    // Set default font
    doc.setFont("helvetica");
    doc.setFontSize(10);

    // Header background
    doc.setFillColor(52, 115, 87); // ✅ Ini benar
    doc.rect(0, 0, 210, 45, "F");

    // Header kiri
    doc.setTextColor(255, 255, 255);

    // Buat judul bold
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Report Desa", marginLeft, 20);
    // Subjudul normal
    doc.setFontSize(13);
    doc.setFont("helvetica", "normal");
    doc.text("KMS Inovasi Desa Digital", marginLeft, 28);


    // Header kanan (pakai koordinat tetap dan align right)
    if (desaMetadata) {
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(`Desa ${desaMetadata.namaDesa || "-"}`, 195, 20, { align: "right" });
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Kec. ${desaMetadata.kecamatan}, Kab. ${desaMetadata.kabupatenKota}, ${desaMetadata.provinsi}`,
        195,
        28,
        { align: "right" }
      );
    }

    // Body
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    currentY = 55;
    const today = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());

    doc.text(`Diunduh pada: ${today}`, marginLeft, currentY);

    // Potensi Desa
    currentY += lineHeight * 2;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Potensi Desa:", marginLeft, currentY);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const potensiText = (desaMetadata?.potensiDesa || []).join(", ") || "-";
    currentY += lineHeight;
    doc.text(potensiText, marginLeft, currentY);

    // Karakteristik Desa
    currentY += lineHeight * 2;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Karakteristik Desa:", marginLeft, currentY);
    currentY += lineHeight;

    const characteristics = [
      ["Geografis", desaMetadata?.geografisDesa || "-"],
      ["Infrastruktur", desaMetadata?.infrastrukturDesa || "-"],
      ["Kesiapan Digital", desaMetadata?.kesiapanDigital || "-"],
      ["Literasi Digital", desaMetadata?.literasiDigital || "-"],
      ["Pemantapan Pelayanan", desaMetadata?.pemantapanPelayanan || "-"],
      ["Sosial dan Budaya", desaMetadata?.sosialBudaya || "-"],
      ["Sumber Daya Alam", desaMetadata?.sumberDaya || "-"]
    ];

    characteristics.forEach(([label, value]) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`${label}`, marginLeft, currentY);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`: ${value}`, marginLeft + 40, currentY);
      currentY += lineHeight;
    });

    // Tabel Inovasi Yang Diterapkan
    currentY += lineHeight;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Inovasi Yang Diterapkan:", marginLeft, currentY);
    currentY += lineHeight;

    // Hitung tinggi awal tabel dan posisi margin
    const tableY = currentY;

    // Simulasikan background rounded
    doc.setFillColor(255, 255, 255); // background putih

    // AutoTable
    autoTable(doc, {
      startY: tableY,
      head: [[
        "No", "Nama Inovator", "Nama Inovasi", "Kategori Inovasi", "Tahun", "Desa Dampingan Lainnya"
      ]],
      body: inovatorData.map((item) => [
        item.no,
        item.namaInovator,
        item.namaInovasi,
        item.kategori,
        item.tahun,
        item.namaDesa,
      ]),
      styles: {
        fontSize: 8,
        font: "helvetica",
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [52, 115, 87],         // ✅ Header hijau (52,115,87)
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        valign: "top",
      },
      alternateRowStyles: {
        fillColor: [240, 248, 245],
      },
      margin: { left: marginLeft, right: marginLeft },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.1,
      didDrawPage: (data: any) => {
        const pageNumber = (doc as any).internal.getNumberOfPages?.() || 1;
        doc.setFontSize(8);
        doc.text(`Page ${data.pageNumber} of ${pageNumber}`, doc.internal.pageSize.getWidth() - 15, 285, {
          align: "right",
        });
      },
    } as any);

    doc.save("Report Dashboard Desa.pdf");
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