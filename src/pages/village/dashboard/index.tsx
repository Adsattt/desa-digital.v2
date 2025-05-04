// src/pages/DashboardPerangkatDesa.tsx
import { useEffect, useState } from "react";
import { Box, Stack } from "@chakra-ui/react";
import { getAuth } from "firebase/auth";
import {
  getDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { firestore } from "../../../firebase/clientApp";
import { useNavigate } from "react-router-dom";
import Hero from "../../home/components/hero";
import TopBar from "Components/topBar";
import Rekomendasi from "Components/dashboard/village/rekomendasiDesa";
import PerkembanganInovasiDesa from "Components/dashboard/village/perkembanganInovasiDesa";
import KategoriInovasiDesa from "Components/dashboard/village/kategoriInovasi";
import Top5InovatorVillage from "Components/dashboard/village/top5Inovator2";
import TwoCard from "Components/dashboard/village/twoCard";
import DownloadReport from "Components/dashboard/village/downloadreport";


const DashboardPerangkatDesa: React.FC = () => {
  const [namaDesa, setNamaDesa] = useState<string>("Memuat...");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        console.error("❌ User belum login");
        setNamaDesa("User belum login");
        setLoading(false);
        return;
      }

      try {
        const desaQuery = query(
          collection(firestore, "villages"),
          where("userId", "==", user.uid)
        );
        const desaSnap = await getDocs(desaQuery);

        if (!desaSnap.empty) {
          const desaData = desaSnap.docs[0].data();
          setNamaDesa(desaData?.namaDesa || "Desa Tidak Diketahui");
        } else {
          setNamaDesa("Desa Tidak Ditemukan");
        }
      } catch (error) {
        console.error("❌ Error fetching desa data:", error);
        setNamaDesa("Gagal Memuat");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Box>
      <TopBar
        title="Dashboard"
        onBack={() => navigate(-1)}
        rightElement={<DownloadReport />}
      />

      <Stack gap="16px" paddingTop="55px" />
      <Hero
        customTitle="Selamat Datang"
        description={loading ? "Memuat..." : namaDesa}
        text=""
      />
      <Rekomendasi />
      <TwoCard />
      <PerkembanganInovasiDesa />
      <KategoriInovasiDesa />
      <Top5InovatorVillage />
      <Box pb={5} />
    </Box>
  );
};

export default DashboardPerangkatDesa;
