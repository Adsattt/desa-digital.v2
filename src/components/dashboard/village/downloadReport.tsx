import React, { useEffect, useState } from "react";
import { IconButton } from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
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

const toTitleCase = (str: string) => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const normalizeNamaDesaFinal = (nama: string) => {
  const cleaned = nama.trim().replace(/\s+/g, " ");
  return cleaned.replace(/^Desa\s+/i, "");
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

      const desaQuery = query(
        collection(db, "villages"),
        where("userId", "==", user.uid)
      );
      const desaSnap = await getDocs(desaQuery);

      let namaDesa = "";
      let desaMeta: any = {};

      if (!desaSnap.empty) {
        const desaData = desaSnap.docs[0].data();
        namaDesa = normalizeNamaDesaFinal(desaData.namaDesa || "");

        desaMeta = {
          namaDesa: normalizeNamaDesaFinal(desaData.namaDesa || ""),
          kecamatan: toTitleCase(desaData.lokasi?.kecamatan?.label || ""),
          kabupatenKota: toTitleCase(desaData.lokasi?.kabupatenKota?.label || ""),
          provinsi: toTitleCase(desaData.lokasi?.provinsi?.label || ""),
          potensiDesa: desaData.potensiDesa || [],
          kondisijalan: desaData.kondisijalan || "",
          jaringan: desaData.jaringan || "",
          listrik: desaData.listrik || "",
          geografisDesa: desaData.geografisDesa || "",
          kesiapanDigital: desaData.kesiapanDigital || "Data Masih Kosong",
          pemantapanPelayanan: desaData.pemantapanPelayanan || "Data Masih Kosong",
          sosialBudaya: desaData.sosialBudaya || "Data Masih Kosong",
          sumberDaya: desaData.sumberDaya || "",
          perkembanganTeknologi: desaData.teknologi || "",
          kemampuanTeknologi: desaData.kemampuan || ""
        };
      } else {
        console.warn("Desa tidak ditemukan untuk user ini");
        return;
      }

      // Mengambil data inovasi yang hanya terkait dengan desa yang sedang login
      const fetchInovasiData = async () => {
        const villageSnapshot = await getDocs(collection(db, "villages"));
        const claimSnapshot = await getDocs(collection(db, "claimInnovations"));
        const innovationSnapshot = await getDocs(collection(db, "innovations"));
        const innovatorSnapshot = await getDocs(collection(db, "innovators"));

        // Membuat peta desaId -> namaDesa
        const villageMap: { [key: string]: string } = villageSnapshot.docs.reduce((acc, curr) => {
          const data = curr.data();
          acc[data.userId] = data.namaDesa;
          return acc;
        }, {} as { [key: string]: string });

        // Membuat peta inovasiId -> namaInovasi
        const innovationMap: { [key: string]: string } = innovationSnapshot.docs.reduce((acc, curr) => {
          const data = curr.data();
          acc[curr.id] = data.namaInovasi || "Nama Inovasi Tidak Ditemukan";
          return acc;
        }, {} as { [key: string]: string });

        // Membuat peta inovatorId -> namaInovator
        const innovatorMap: { [key: string]: string } = innovatorSnapshot.docs.reduce((acc, curr) => {
          const data = curr.data();
          acc[curr.id] = data.namaInovator || "Nama Inovator Tidak Ditemukan";
          return acc;
        }, {} as { [key: string]: string });

        // Ambil data klaim yang terverifikasi
        const claims = claimSnapshot.docs
          .map(doc => doc.data())
          .filter(c => c.status === "Terverifikasi");

        const inovatorData: InovatorReportData[] = [];

        // Loop melalui setiap klaim dan hanya ambil yang sesuai dengan desaId yang sedang login
        claims.forEach((claim, index) => {
          const desaId = claim.desaId; // Ambil desaId dari klaim

          if (desaId === desaSnap.docs[0].id) { // Hanya ambil klaim yang sesuai dengan desaId dari desa yang login
            const namaDesa = villageMap[desaId] || "Nama Desa Tidak Ditemukan";

            // Ambil inovasiId terkait dengan klaim
            const inovasiId = claim.inovasiId;
            const inovasiData = innovationSnapshot.docs.find(doc => doc.id === inovasiId)?.data();

            if (inovasiData) {
              const namaInovasi = inovasiData.namaInovasi || "Nama Inovasi Tidak Ditemukan";
              const kategori = inovasiData.kategori || "-";
              const tahun = inovasiData.tahunDibuat || "Tidak Ada Tahun";

              // Ambil inovatorId terkait dengan inovasi
              const inovatorId = inovasiData.innovatorId;
              const namaInovator = innovatorMap[inovatorId] || "Nama Inovator Tidak Ditemukan";

              // Ambil daftar desa lain yang juga menerapkan inovasi ini
              const desaDampingan = claims
                .filter(c => c.inovasiId === inovasiId && c.desaId !== desaId) // Mencari klaim inovasi yang tidak berasal dari desa ini
                .map(c => villageMap[c.desaId]) // Ambil nama desa dari desaId
                .filter(Boolean) // Hanya ambil nama desa yang valid
                .join(", "); // Gabungkan desa-desa dengan koma

              // Menambahkan data inovator ke dalam array inovatorData
              inovatorData.push({
                no: index + 1,
                namaInovator,
                namaInovasi,
                kategori,
                tahun,
                namaDesa: desaDampingan || "-",
                jumlahInovasi: 1,
                jumlahDesaDampingan: desaDampingan ? desaDampingan.split(",").length : 0,
              });
            }
          }
        });

        // Mengurutkan data berdasarkan jumlahInovasi secara descending
        setInovatorData(inovatorData.sort((a, b) => b.jumlahInovasi - a.jumlahInovasi));
      };

      fetchInovasiData();
      setDesaMetadata(desaMeta);

    } catch (error) {
      console.error("Error fetching innovator data:", error);
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
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Kec. ${desaMetadata.kecamatan}, Kab. ${desaMetadata.kabupatenKota}, ${desaMetadata.provinsi}`,
        195,
        28,
        { align: "right" }
      );
    }

    // Body
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    currentY = 40;
    const today = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());

    doc.text(`Diunduh pada: ${today}`, marginLeft, currentY);

    // Potensi Desa
    doc.setTextColor(0, 0, 0);
    currentY += lineHeight * 2 + 5;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Potensi Desa:", marginLeft, currentY);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const potensiText = (desaMetadata?.potensiDesa || []).join(", ") || "-";
    currentY += lineHeight;
    doc.text(potensiText, marginLeft, currentY);

    // Infrastruktur Desa
    currentY += lineHeight * 2;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Infrastruktur Desa:", marginLeft, currentY);
    currentY += lineHeight;

    const infrastructure = [
      ["Kondisi Jalan", desaMetadata?.kondisijalan || "-"],
      ["Jaringan Internet", desaMetadata?.jaringan || "-"],
      ["Ketersediaan Listrik", desaMetadata?.listrik || "-"],
    ];

    infrastructure.forEach(([label, value]) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`${label}`, marginLeft, currentY);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`: ${value}`, marginLeft + 40, currentY);
      currentY += lineHeight;
    });

    // Karakteristik Desa
    currentY += lineHeight;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Karakteristik Desa:", marginLeft, currentY);
    currentY += lineHeight;

    const characteristics = [
      ["Geografis", desaMetadata?.geografisDesa || "-"],
      ["Sosial dan Budaya", desaMetadata?.sosialBudaya || "-"],
      ["Sumber Daya Alam", desaMetadata?.sumberDaya || "-"]
    ];

    const labelX = marginLeft;
    const separatorX = marginLeft + 40;  // posisi ':'
    const contentX = marginLeft + 42;    // posisi konten

    characteristics.forEach(([label, value]) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      if (label === "Sosial dan Budaya" || label === "Sumber Daya Alam") {
        const pageWidth = doc.internal.pageSize.getWidth();
        const maxContentWidth = pageWidth - contentX - marginLeft;

        const wrapped = doc.splitTextToSize(value, maxContentWidth);

        if (wrapped.length > 0) {
          doc.text(label, labelX, currentY);
          doc.text(":", separatorX, currentY);
          doc.text(wrapped[0], contentX, currentY);
        }

        for (let i = 1; i < wrapped.length; i++) {
          currentY += lineHeight;
          doc.text(wrapped[i], contentX, currentY);
        }

        currentY += lineHeight;
      }
    });

    // Teknologi Desa
    currentY += lineHeight;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Teknologi Desa:", marginLeft, currentY);
    currentY += lineHeight;

    const technology = [
      ["Perkembangan Teknologi Digital", desaMetadata?.perkembanganTeknologi || "-"],
      ["Kemampuan Teknologi", desaMetadata?.kemampuanTeknologi || "-"],
    ];

    technology.forEach(([label, value]) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`${label}`, marginLeft, currentY);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`: ${value}`, marginLeft + 55, currentY);
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
        "No", "Nama Inovator", "Nama Inovasi", "Kategori Inovasi", "Tahun"
      ]],
      body: inovatorData.map((item) => [
        item.no,
        item.namaInovator,
        item.namaInovasi,
        item.kategori,
        item.tahun,
        // item.namaDesa,
      ]),
      styles: {
        fontSize: 8,
        font: "helvetica",
        cellPadding: 3,
        halign: "center"
      },
      headStyles: {
        fillColor: [52, 115, 87],         // Header hijau (52,115,87)
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