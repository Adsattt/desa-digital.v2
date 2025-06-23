import { Box, Flex, Stack, Text, Grid, Badge, IconButton, Link as ChakraLink, Button, Table, Thead, Tbody, Tr, Th, Td, TableContainer, useDisclosure, ModalOverlay, Modal, ModalContent, ModalHeader, ModalCloseButton, ModalBody, SimpleGrid, Checkbox, ModalFooter, Select } from "@chakra-ui/react";
import { ArrowUpRight, ArrowDownRight, Leaf, Users, Phone, Icon, SlidersHorizontal } from "lucide-react";
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
import SebaranProvinsiDashboardDesa from "Components/dashboard/admin/dashboardDesa/sebaranProvinsiDashboardDesa";
import SebaranPotensiDesa from "Components/dashboard/admin/dashboardDesa/sebaranPotensiDesa";
import SebaranKondisiDesa from "Components/dashboard/admin/dashboardDesa/sebaranKondisiDesa";
import ScoreCardDashboardDesa from "Components/dashboard/admin/dashboardDesa/scorecardDashboardDesa";
import SebaranKlasifikasiDashboardDesa from "Components/dashboard/admin/dashboardDesa/sebaranKlasifikasiDashboardDesa";



const DashboardAdminDesa: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box>
            {/* Top Bar */}
            <TopBar title="Data Desa" onBack={() => navigate(-1)} />

            <Stack gap="16px" paddingTop="55px" />

            <ScoreCardDashboardDesa/>
            {/* <SebaranProvinsiDashboardDesa/> dipindah ke dashboard depan */}
            <SebaranKlasifikasiDashboardDesa/>
            <SebaranPotensiDesa/>
            <SebaranKondisiDesa/>

            <Box pb={10} />
        </Box >
    );
};

export default DashboardAdminDesa;