import { Box, Flex, Stack, Text, Icon, Link as ChakraLink } from "@chakra-ui/react";
import { ArrowUpRight, ArrowDownRight, Leaf, Users, Phone } from "lucide-react";
import Ads from "Components/ads/Ads";
import BestBanner from "Components/banner/BestBanner";
import Container from "Components/container";
import Rediness from "Components/rediness/Rediness";
import SearchBarLink from "Components/search/SearchBarLink";
import TopBar from "Components/topBar";
import Hero from "../../home/components/hero";
import { useNavigate } from "react-router-dom";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList
} from "recharts";
import VillageActive from 'Assets/icons/village-active.svg';
import { FaUser } from "react-icons/fa";
import { getFirestore, collection, getDocs, doc, getDoc, query, where, Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { paths } from "Consts/path";
import { getAuth } from "firebase/auth";
import { firestore } from "../../../firebase/clientApp";
import { FaSeedling } from "react-icons/fa6";
import redinesImg from "@public/images/rediness.svg";
import InformasiUmum from "Components/dashboard/admin/informasiumum";
import DesaDigitalUnggulan from "Components/dashboard/admin/desaDigitalUnggulan";
import InovatorUnggulan from "Components/dashboard/admin/inovatorUnggulan";
import InovasiUnggulan from "Components/dashboard/admin/inovasiUnggulan";
import DownloadReport from "Components/dashboard/admin/downloadReport";
import Leaderboard from "Components/dashboard/admin/merger";
import Peta from "Components/dashboard/admin/peta";

const DashboardAdmin: React.FC = () => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null); // State untuk menyimpan peran pengguna

    return (
        <Box>
            <TopBar
                title="Dashboard" 
                onBack={() => navigate(-1)} 
                rightElement={<DownloadReport />}
            />
            <Stack
                gap="16px"
                paddingTop="55px">
            </Stack>
            <Hero
                description="Admin"
                text=""
                customTitle="Selamat Datang"
                minHeight={100}
                gapSize={2}
            />
            <InformasiUmum/>
            <Leaderboard/>
            {/* <DesaDigitalUnggulan/>
            <InovatorUnggulan/>
            <InovasiUnggulan/> */}
            <Box pb={5} />
            <Peta/>
            <Box pb={50} />
        </Box>
    );
};

export default DashboardAdmin;
