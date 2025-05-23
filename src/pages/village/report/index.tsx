import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import { getAuth, onAuthStateChanged, browserLocalPersistence, setPersistence } from "firebase/auth";
import { 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalCloseButton, 
  useDisclosure,
  Flex,
  Spinner,
  Text
} from "@chakra-ui/react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { renderToString } from "react-dom/server"; // untuk merender komponen react ke string HTML
import TopBar from "../../../components/topBar";
import { paths } from "Consts/path";
import {
  GridContainer,
  Containers,
  Column1,
  DateRangeWrapper,
  Select,
  DateInput,
  DownloadWrapper,
  Table,
  TableHeader,
  TableRow,
  TableCell,
  PreviewWrapper,
  CompactPreviewWrapper,
  ReportHeader,
  ReportTitle,
  ReportPeriode,
  ReportFilter,
  ReportTimestamp,
  PreviewButton,
  DownloadButton,
} from "./_ReportVillageStyle";

// Daftar pilihan kategori inovasi
const KATEGORI_OPTIONS = [
  "Semua",
  "E-Government",
  "E-Tourism",
  "Layanan Keuangan",
  "Layanan Sosial",
  "Pemasaran Agri-Food dan E-Commerce",
  "Pengembangan Masyarakat dan Ekonomi",
  "Pengelolaan Sumber Daya",
  "Pertanian Cerdas",
  "Sistem Informasi",
  "UMKM",
];

// Daftar pilihan jenis inovasi
const JENIS_OPTIONS = {
  SEMUA: "Semua",
  UNGGULAN: "Inovasi Unggulan",
  POTENSIAL: "Inovasi Potensial"
};

// Interface untuk data inovasi
interface Innovation {
  id: string;
  namaInovasi: string;
  kategori: string;
}

// Interface untuk data desa
interface VillageData {
  id: string;
  namaDesa: string;
  lokasi: {
    provinsi: { value: string; label: string };
    kabupatenKota: { value: string; label: string };
    kecamatan: { value: string; label: string };
    desaKelurahan: { value: string; label: string };
  };
}

// Interface untuk data klaim inovasi
interface ClaimInnovation {
  id: string;
  inovasiId: string;
  desaId: string;
  namaDesa: string;
  status: string;
  createdAt: any;
}

// Interface untuk data laporan desa
interface VillageReportData {
  no: number;
  namaInovasi: string;
  namaDesa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  tanggalImplementasi: string;
  kategori: string;
  status: string;
}

const ReportVillage: React.FC = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<VillageReportData[]>([]);
  const [allInnovations, setAllInnovations] = useState<Innovation[]>([]);
  const [allVillages, setAllVillages] = useState<VillageData[]>([]);
  const [allClaims, setAllClaims] = useState<ClaimInnovation[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>(KATEGORI_OPTIONS);
  const [kategori, setKategori] = useState<string>("Semua");
  const [jenis, setJenis] = useState<string>("Semua");
  const [tanggalDari, setTanggalDari] = useState<string>("");
  const [tanggalSampai, setTanggalSampai] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const targetRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Gunakan tanggal dan waktu yang diberikan oleh sistem
  const currentDate = new Date("2025-05-23T16:58:00+07:00");

  // Format timestamp dengan zona waktu dinamis
  const formatter = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
    timeZoneName: "short",
  });
  const formattedTimestamp = formatter.format(currentDate).replace(/(\d{2}:\d{2}) .*/, "$1 WIB"); // e.g., "23 Mei 2025, 16:58 WIB"

  // Fungsi untuk menghitung jenis inovasi berdasarkan jumlah implementasi
  // Jika jumlah implementasi >= 5, maka jenisnya adalah "Inovasi Unggulan"
  // Jika jumlah implementasi < 2, maka jenisnya adalah "Inovasi Potensial"
  // Jika jumlah implementasi di antara 2 dan 5, maka jenisnya adalah "Regular"
  const calculateInnovationType = (inovasiId: string): string => {
    const implementationCount = allClaims.filter(claim => claim.inovasiId === inovasiId).length;
    console.log(`Calculating jenis for inovasiId ${inovasiId}: implementationCount=${implementationCount}`);
    if (implementationCount >= 5) return JENIS_OPTIONS.UNGGULAN;
    if (implementationCount < 2) return JENIS_OPTIONS.POTENSIAL;
    return "Regular";
  };

  // Fungsi untuk mengambil data dari Firestore
  const fetchData = async () => {
    try {
      setErrorMessage("");
      const db = getFirestore();

      // Ambil semua data desa
      const villagesSnap = await getDocs(collection(db, "villages"));
      console.log("All villages fetched:", villagesSnap.docs.map(doc => doc.data()));
      if (villagesSnap.empty) {
        setErrorMessage("Tidak ada data desa di Firestore.");
        return;
      }
      const villagesData = villagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as VillageData));
      setAllVillages(villagesData);

      // Ambil semua data inovasi
      const innovationsSnap = await getDocs(collection(db, "innovations"));
      console.log("Innovations fetched:", innovationsSnap.docs.map(doc => doc.data()));
      if (innovationsSnap.empty) {
        setErrorMessage("Tidak ada data inovasi di Firestore.");
        return;
      }
      const innovationsData = innovationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Innovation));
      setAllInnovations(innovationsData);

      // Ambil semua data klaim inovasi, diurutkan berdasarkan tanggal pembuatan
      const claimsSnap = await getDocs(query(collection(db, "claimInnovations"), orderBy("createdAt", "desc")));
      console.log("Claims fetched:", claimsSnap.docs.map(doc => doc.data()));
      if (claimsSnap.empty) {
        setErrorMessage("Tidak ada data klaim inovasi di Firestore.");
        return;
      }
      const claimsData = claimsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClaimInnovation));
      setAllClaims(claimsData);

      // Filter kategori yang ada di data inovasi, tambahkan "Semua"
      const categories = new Set(innovationsData.map(inn => inn.kategori));
      console.log("Available categories:", Array.from(categories));
      const filteredCategories = KATEGORI_OPTIONS.filter(cat => cat === "Semua" || categories.has(cat));
      setAvailableCategories(filteredCategories);

      // Filter klaim berdasarkan kriteria yang dipilih
      const filteredClaims = claimsData.filter(claim => {
        const innovation = innovationsData.find(inn => inn.id === claim.inovasiId);
        if (!innovation) {
          console.log(`Innovation not found for claim with inovasiId ${claim.inovasiId}`);
          return false;
        }

        const isCategoryMatch = kategori === "Semua" || 
          innovation.kategori.trim().toLowerCase() === kategori.trim().toLowerCase();
        const isJenisMatch = jenis === "Semua" || calculateInnovationType(claim.inovasiId) === jenis;
        const claimDate = claim.createdAt && claim.createdAt.toDate ? claim.createdAt.toDate() : null;
        const startDate = tanggalDari ? new Date(tanggalDari) : null;
        const endDate = tanggalSampai ? new Date(tanggalSampai) : null;

        if (startDate) startDate.setHours(0, 0, 0, 0);
        if (endDate) endDate.setHours(23, 59, 59, 999);

        const isDateMatch = (!startDate || (claimDate && claimDate >= startDate)) &&
                            (!endDate || (claimDate && claimDate <= endDate));

        console.log(`Filtering claim for inovasiId ${claim.inovasiId}, desaId ${claim.desaId}`, {
          isCategoryMatch,
          isJenisMatch,
          claimDate: claimDate ? claimDate.toISOString() : "No Date",
          startDate: startDate ? startDate.toISOString() : "No Start Date",
          endDate: endDate ? endDate.toISOString() : "No End Date",
          isDateMatch,
          kategori,
          jenis,
          tanggalDari,
          tanggalSampai,
          innovationKategori: innovation.kategori,
          calculatedJenis: calculateInnovationType(claim.inovasiId)
        });

        return isCategoryMatch && isJenisMatch && (claimDate ? isDateMatch : true);
      });
      console.log("Filtered claims (after category, jenis, date):", filteredClaims);

      // Buat data laporan dengan menggabungkan informasi klaim, inovasi, dan desa
      let rowNumber = 1;
      const reportData: VillageReportData[] = filteredClaims
        .map(claim => {
          const innovation = innovationsData.find(inn => inn.id === claim.inovasiId);
          const village = villagesData.find(v => v.id === claim.desaId);

          if (!innovation || !village) {
            console.log(`Skipping claim due to missing innovation or village:`, { claim, innovation, village });
            return null;
          }

          return {
            no: rowNumber++,
            namaInovasi: innovation.namaInovasi || "Tidak Ada Nama Inovasi",
            namaDesa: village.namaDesa || "Tidak Ada Nama Desa",
            kecamatan: village.lokasi?.kecamatan?.label || "Tidak Ada Kecamatan",
            kabupaten: village.lokasi?.kabupatenKota?.label || "Tidak Ada Kabupaten",
            provinsi: village.lokasi?.provinsi?.label || "Tidak Ada Provinsi",
            tanggalImplementasi: claim.createdAt && claim.createdAt.toDate
              ? new Date(claim.createdAt.toDate()).toLocaleDateString("id-ID")
              : "Tidak Ada Tanggal",
            kategori: innovation.kategori || "Tidak Ada Kategori",
            status: claim.status || "Unknown"
          };
        })
        .filter((item): item is VillageReportData => item !== null);
      console.log("Final report data:", reportData);

      setReportData(reportData);

      if (reportData.length === 0) {
        setErrorMessage("Tidak ada data inovasi yang telah diklaim oleh desa sesuai dengan filter yang dipilih.");
      }
    } catch (error) {
      console.error("❌ Error fetching report data:", error);
      setErrorMessage("Terjadi kesalahan saat mengambil data. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Ambil data saat komponen pertama kali dimuat
  useEffect(() => {
    const auth = getAuth();
    
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            fetchData();
          } else {
            console.error("User belum login");
            setErrorMessage("User belum login. Silakan login terlebih dahulu.");
            navigate(paths.LOGIN_PAGE);
            setIsLoading(false);
          }
        });
        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("❌ Error setting persistence:", error);
        setErrorMessage("Terjadi kesalahan dengan autentikasi. Silakan coba lagi.");
        setIsLoading(false);
      });
  }, [kategori, jenis, tanggalDari, tanggalSampai]);

  // Format tanggal untuk ditampilkan
  const periodeText = tanggalDari && tanggalSampai
    ? `${new Date(tanggalDari).toLocaleDateString("id-ID")} - ${new Date(tanggalSampai).toLocaleDateString("id-ID")}`
    : "Belum dipilih";

  const isValidDateRange = !tanggalDari || !tanggalSampai || new Date(tanggalDari) <= new Date(tanggalSampai);
  const isDateRangeValidForDownload = (tanggalDari === "" && tanggalSampai === "") || isValidDateRange;

 // Fungsi untuk menampilkan isi laporan
  const ReportContent = ({ isCompact = false, data = reportData }: { isCompact?: boolean; data?: VillageReportData[] }) => {
    console.log("Rendering ReportContent with data:", data);

    return (
      <>
        <ReportHeader>
          <ReportTitle isCompact={isCompact}>Laporan Sistem Desa Digital</ReportTitle>
          <ReportPeriode isCompact={isCompact}>Periode: {periodeText}</ReportPeriode>
          <ReportFilter isCompact={isCompact}>Kategori Inovasi: {kategori}</ReportFilter>
          <ReportFilter isCompact={isCompact}>Jenis Inovasi: {jenis}</ReportFilter>
          <ReportTimestamp isCompact={isCompact}>Generated on: {formattedTimestamp}</ReportTimestamp>
        </ReportHeader>

        <Table isCompact={isCompact}>
          <thead>
            <TableRow>
              <TableHeader isCompact={isCompact}>No</TableHeader>
              <TableHeader isCompact={isCompact}>Nama Inovasi</TableHeader>
              <TableHeader isCompact={isCompact}>Nama Desa</TableHeader>
              <TableHeader isCompact={isCompact}>Kecamatan</TableHeader>
              <TableHeader isCompact={isCompact}>Kabupaten</TableHeader>
              <TableHeader isCompact={isCompact}>Provinsi</TableHeader>
              <TableHeader isCompact={isCompact}>Tanggal Implementasi</TableHeader>
              <TableHeader isCompact={isCompact}>Status</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item) => (
                <TableRow key={`${item.no}-${item.namaDesa}`}>
                  <TableCell isCompact={isCompact}>{item.no}</TableCell>
                  <TableCell isCompact={isCompact}>{item.namaInovasi}</TableCell>
                  <TableCell isCompact={isCompact}>{item.namaDesa}</TableCell>
                  <TableCell isCompact={isCompact}>{item.kecamatan}</TableCell>
                  <TableCell isCompact={isCompact}>{item.kabupaten}</TableCell>
                  <TableCell isCompact={isCompact}>{item.provinsi}</TableCell>
                  <TableCell isCompact={isCompact}>{item.tanggalImplementasi}</TableCell>
                  <TableCell isCompact={isCompact}>{item.status}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell isCompact={isCompact} colSpan={8}>Tidak ada data untuk ditampilkan</TableCell>
              </TableRow>
            )}
          </tbody>
        </Table>
      </>
    );
  };

  // Fungsi untuk menghasilkan PDF
  const generatePDF = async () => {
    if (!reportData.length) {
      console.log("Tidak ada data untuk menghasilkan PDF.");
      return;
    }

    // Set up the PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // A4 dimensions: 210mm x 297mm
    const pageWidth = 210;
    const pageHeight = 297;
    const marginTop = 10;
    const marginBottom = 15; 
    const marginLeft = 10;
    const marginRight = 10;
    const contentWidth = pageWidth - marginLeft - marginRight;

    // Estimasi tinggi header dan setiap baris
    const headerHeightPx = 100; 
    const rowHeightPx = 30; 
    const scale = 2; 

    // CKonversi tinggi dari piksel ke mm
    const pxToMm = 0.264583;
    const headerHeightMm = headerHeightPx * pxToMm / scale;
    const rowHeightMm = rowHeightPx * pxToMm / scale;

    // Hitung berapa banyak baris yang muat dalam satu halaman
    const availableHeightMm = pageHeight - marginTop - marginBottom - headerHeightMm;
    const rowsPerPage = Math.floor(availableHeightMm / rowHeightMm);
    console.log(`Rows per page: ${rowsPerPage}, Header height: ${headerHeightMm}mm, Row height: ${rowHeightMm}mm`);

    // Pecah data laporan menjadi beberapa bagian (chunk) berdasarkan baris per halaman
    const chunks = [];
    for (let i = 0; i < reportData.length; i += rowsPerPage) {
      chunks.push(reportData.slice(i, i + rowsPerPage));
    }
    console.log(`Total chunks: ${chunks.length}`);

    const hiddenContainer = document.createElement("div");
    hiddenContainer.style.position = "absolute";
    hiddenContainer.style.top = "-9999px";
    hiddenContainer.style.left = "-9999px";
    hiddenContainer.style.width = `${contentWidth / pxToMm}px`; // Set width to match PDF content width
    document.body.appendChild(hiddenContainer);

    try {
      // Buat halaman PDF untuk setiap bagian data
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`Rendering chunk ${i + 1}/${chunks.length} with ${chunk.length} rows`);

        // Sesuaikan nomor baris untuk setiap bagian
        const adjustedChunk = chunk.map((item, index) => ({
          ...item,
          no: i * rowsPerPage + index + 1,
        }));

        const chunkElement = document.createElement("div");
        const chunkHtml = renderToString(<ReportContent isCompact={true} data={adjustedChunk} />);
        chunkElement.innerHTML = chunkHtml;
        hiddenContainer.innerHTML = "";
        hiddenContainer.appendChild(chunkElement);

        await new Promise(resolve => setTimeout(resolve, 100));

        // Ambil gambar dari elemen menggunakan html2canvas
        const canvas = await html2canvas(chunkElement, { 
          scale,
          useCORS: true,
          logging: true,
        });
        const imgData = canvas.toDataURL("image/png");

        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, "PNG", marginLeft, marginTop, imgWidth, imgHeight);

        pdf.setFontSize(10);
        pdf.text(`Page ${i + 1} of ${chunks.length}`, pageWidth - marginRight - 30, pageHeight - marginBottom + 5);
      }

      // Simpan
      pdf.save("Laporan_Sistem_Desa_Digital.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      document.body.removeChild(hiddenContainer);
    }
  };

  if (isLoading) {
    return (
      <GridContainer>
        <Containers>
          <Flex
            direction="column"
            align="center"
            justify="center"
            minH="50vh"
          >
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
              mb={4}
            />
            <Text fontSize="lg" color="gray.600" fontWeight="medium">
              Memuat data laporan...
            </Text>
            <Text fontSize="sm" color="gray.500">
              Silakan tunggu sebentar.
            </Text>
          </Flex>
        </Containers>
      </GridContainer>
    );
  }

  return (
    <>
      <TopBar
        title="Report Village"
        onBack={() => navigate(paths.LANDING_PAGE)}
      />
      <GridContainer>
        <Containers>
          <Column1>
            <Text>Kategori Inovasi:</Text>
            <Select
              value={kategori}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setKategori(e.target.value)
              }
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </Column1>

          <Column1>
            <Text>Jenis Inovasi:</Text>
            <Select
              value={jenis}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setJenis(e.target.value)
              }
            >
              {Object.values(JENIS_OPTIONS).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Select>
          </Column1>

          <Column1>
            <Text>Tanggal Implementasi:</Text>
            <DateRangeWrapper>
              <DateInput
                type="date"
                value={tanggalDari}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTanggalDari(e.target.value)
                }
              />
              <Text>-</Text>
              <DateInput
                type="date"
                value={tanggalSampai}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTanggalSampai(e.target.value)
                }
              />
            </DateRangeWrapper>
            {!isValidDateRange && (
              <Text style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
                Tanggal Dari tidak boleh lebih besar dari Tanggal Sampai
              </Text>
            )}
          </Column1>

          {errorMessage && (
            <Text style={{ color: "red", fontSize: "14px", marginBottom: "10px" }}>
              {errorMessage}
            </Text>
          )}

          <CompactPreviewWrapper ref={targetRef}>
            <ReportContent isCompact={true} />
          </CompactPreviewWrapper>

          <DownloadWrapper>
            <PreviewButton onClick={onOpen} disabled={!isValidDateRange}>
              Preview
            </PreviewButton>
            <DownloadButton
              onClick={generatePDF}
              disabled={!isDateRangeValidForDownload || isLoading || reportData.length === 0}
            >
              Download PDF
            </DownloadButton>
          </DownloadWrapper>

          <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent maxW="90vw">
              <ModalHeader>Preview Laporan Sistem Desa Digital</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <PreviewWrapper>
                  <ReportContent isCompact={false} />
                </PreviewWrapper>
              </ModalBody>
            </ModalContent>
          </Modal>
        </Containers>
      </GridContainer>
    </>
  );
};

export default ReportVillage;