import { useEffect, useState } from "react";
import { Box, Stack, Text } from "@chakra-ui/react";
import { getAuth } from "firebase/auth";
import { getDoc, doc, collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../../../firebase/clientApp";
import { useNavigate } from "react-router-dom";
import Hero from "../../home/components/hero";
import TopBar from "Components/topBar";
import PerkembanganInovasiDesa from "Components/dashboard/village/perkembanganInovasiDesa";
import Rekomendasi from "Components/dashboard/village/rekomendasiDesa";
import KategoriInovasiDesa from "Components/dashboard/village/kategoriInovasi";
import Top5Inovator from "Components/dashboard/admin/dashboardInovator/top5Inovator";
import Top5InovatorVillage from "Components/dashboard/village/top5Inovator2";
import TwoCard from "Components/dashboard/village/twoCard";

const DashboardPerangkatDesa: React.FC = () => {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [namaDesa, setNamaDesa] = useState<string>("Memuat...");
    const [inovasiDiterapkan, setInovasiDiterapkan] = useState<any[]>([]);
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
    
            console.log("✅ User Login UID:", user.uid);
    
            try {
                // 🔥 Cari desa berdasarkan userId, bukan inovatorId
                const desaQuery = query(
                    collection(firestore, "villages"),
                    where("userId", "==", user.uid) // ⬅️ FIXED: Gunakan `userId`
                );
    
                const desaSnap = await getDocs(desaQuery);
                console.log("📢 Firestore Desa Data:", desaSnap.docs.map(doc => doc.data()));
    
                if (!desaSnap.empty) {
                    const desaData = desaSnap.docs[0].data();
                    console.log("✅ Desa Ditemukan:", desaData);
    
                    // ✅ Ambil namaDesa yang benar dari Firestore
                    setNamaDesa(desaData?.namaDesa || "Desa Tidak Diketahui");
                } else {
                    console.warn("⚠️ Desa tidak ditemukan untuk UID ini.");
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
            <TopBar title="Dashboard" onBack={() => navigate(-1)} />

            <Stack gap="16px" paddingTop="55px" />

            <Hero
                customTitle="Selamat Datang"
                description={loading ? "Memuat..." : namaDesa}
                text=""
            />

            <Rekomendasi/>
            <TwoCard/>
            <PerkembanganInovasiDesa/>
            <KategoriInovasiDesa/>
            <Top5InovatorVillage/>
            <Box pb={5} />
        </Box>
    );
};

export default DashboardPerangkatDesa;
