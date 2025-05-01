import { Box, Flex, Stack, Text, Grid, Badge, IconButton, Link as ChakraLink, Button, Table, Thead, Tbody, Tr, Th, Td, TableContainer } from "@chakra-ui/react";
import { ArrowUpRight, ArrowDownRight, Leaf, Users, Phone, Icon } from "lucide-react";
import TopBar from "Components/topBar";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList, ScatterChart, Scatter, ZAxis, Pie, PieChart, Legend } from "recharts";
import VillageActive from 'Assets/icons/village-active.svg';
import { FaUser } from "react-icons/fa";
import { getFirestore, collection, getDocs, doc, getDoc, query, where, Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { paths } from "Consts/path";
import { getAuth } from "firebase/auth";
import { firestore } from "../../../../firebase/clientApp";
import { FaSeedling } from "react-icons/fa6";
import redinesImg from "@public/images/rediness.svg";
import { Filter } from "lucide-react";
import ScoreCardDashboardInovator from "Components/dashboard/admin/dashboardInovator/scorecardDashboardInovator";
import SebaranKategoriInovator from "Components/dashboard/admin/dashboardInovator/sebaranKategoriInovator";
import Top5Inovator from "Components/dashboard/admin/dashboardInovator/top5Inovator";


const DashboardAdminInovator: React.FC = () => {
    //State untuk navigasi page
    const navigate = useNavigate();
    // State untuk menyimpan peran pengguna
    const [userRole, setUserRole] = useState(null);
    // Data statistik statis
    const stats = [
        { label: "Inovator", value: 51 },
        { label: "Desa Dampingan", value: 200 },
    ];
    // Data Pie Chart - 5 Provinsi
    const data = [
        { name: "Pemerintah", value: 21, color: "#A7C7A5" },
        { name: "Akademisi", value: 10, color: "#1E5631" },
        { name: "Swasta", value: 14, color: "#174E3B" },
    ];

    // Data Pie Chart - Klasifikasi Geografis
    const geo = [
        { name: "Dataran Tinggi", value: 15, color: "#A7C7A5" },
        { name: "Dataran Rendah", value: 10, color: "#1E5631" },
        { name: "Dataran Sedang", value: 12, color: "#174E3B" },
    ];

    const bar = [
        { name: "Bantu Desa", value: 10 },
        { name: "Sebumi", value: 15 },
        { name: "e-Fishery", value: 22 },
        { name: "Inagri", value: 14 },
        { name: "Open Desa", value: 12 },
    ];

    // Definisikan interface untuk struktur data tabel
    interface DesaData {
        no: number;
        desa: string;
        status: string;
        jalan: string;
    }

    // Data Tabel
    const desaData: DesaData[] = [
        { no: 1, desa: "Desa Soge", status: "Maju", jalan: "Beraspal penuh" },
        { no: 2, desa: "Desa Ciroke", status: "Berkembang", jalan: "Beraspal sebagian" },
        { no: 3, desa: "Desa Cikajang", status: "Mandiri", jalan: "Beraspal sebagian" },
        { no: 4, desa: "Desa Cibodas", status: "Maju", jalan: "Beraspal penuh" },
        { no: 5, desa: "Desa Dramaga", status: "Tertinggal", jalan: "Beraspal penuh" },
        { no: 6, desa: "Desa Sukajadi", status: "Berkembang", jalan: "Beraspal sebagian" },
        { no: 7, desa: "Desa Tanjungsari", status: "Mandiri", jalan: "Beraspal penuh" },
        { no: 8, desa: "Desa Cikarang", status: "Maju", jalan: "Beraspal penuh" },
        { no: 9, desa: "Desa Rancamaya", status: "Berkembang", jalan: "Beraspal sebagian" },
        { no: 10, desa: "Desa Sindang", status: "Tertinggal", jalan: "Beraspal penuh" },
    ];

    // Konfigurasi jumlah data per halaman
    const ITEMS_PER_PAGE = 5;

    const [currentPage, setCurrentPage] = useState(1);

    // Hitung jumlah total halaman
    const totalPages = Math.ceil(desaData.length / ITEMS_PER_PAGE);

    // Data yang ditampilkan di halaman saat ini
    const currentData = desaData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );


    // Warna untuk tiap slice biar mirip sama gambar lo
    const COLORS = ["#A9C6B9", "#264D3F", "#315B4E", "#7DA693"];

    // Definisikan tipe parameter untuk fungsi label custom
    interface LabelProps {
        cx: number;
        cy: number;
        midAngle: number;
        innerRadius: number;
        outerRadius: number;
        percent: number;
        name: string;
    }

    // Custom Label agar teks ada di dalam Pie Chart
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: LabelProps) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="bold" fontFamily="poppins">
                {`${name} ${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };


    return (
        <Box>
            {/* Top Bar */}
            <TopBar title="Dashboard Inovator" onBack={() => navigate(-1)} />

            <Stack gap="16px" paddingTop="55px" />

            <ScoreCardDashboardInovator/>
            <SebaranKategoriInovator/>
            <Top5Inovator/>
            <Box pb={10} />
        </Box>
    );
};

export default DashboardAdminInovator;