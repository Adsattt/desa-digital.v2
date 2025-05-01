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
import ScoreCardDashboardInnovations from "Components/dashboard/admin/dashboardInovasi/scorecardDashboardInovasi";
import SebaranKategoriInnovations from "Components/dashboard/admin/dashboardInovasi/sebaranKategoriInovasi";
import Top5Innovations from "Components/dashboard/admin/dashboardInovasi/top5Inovasi";



const DashboardAdminInovasi: React.FC = () => {
    //State untuk navigasi page
    const navigate = useNavigate();

    return (
        <Box>
            {/* Top Bar */}
            <TopBar title="Dashboard Inovasi" onBack={() => navigate(-1)} />

            <Stack gap="16px" paddingTop="55px" />

            <ScoreCardDashboardInnovations/>
            <SebaranKategoriInnovations/>
            <Top5Innovations/>

            {/* TOP 5 INOVASI SELESAI */}
            <Box pb={10} />
        </Box>
    );
};

export default DashboardAdminInovasi;