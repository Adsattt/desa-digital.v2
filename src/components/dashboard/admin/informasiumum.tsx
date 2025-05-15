import {
  Box,
  Flex,
  Stack,
  Text,
  Icon,
  Image,
  Grid,
  Button
} from "@chakra-ui/react";
import {
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { firestore } from "../../../firebase/clientApp";
import { FaUsers } from "react-icons/fa";
import VillageActive from 'Assets/icons/village-active.svg';
import InnovationActive from "Assets/icons/innovation3.svg";
import { DownloadIcon } from "@chakra-ui/icons";
import * as XLSX from "xlsx";

const InformasiUmum: React.FC = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [totalVillage, setTotalVillage] = useState(0);
  const [totalInnovators, setTotalInnovators] = useState(0);
  const [totalInnovation, setTotalInnovation] = useState(0);
  const [changeInnovator, setChangeInnovator] = useState(0);
  const [isIncreaseInnovator, setIsIncreaseInnovator] = useState(true);
  const [changeVillage, setChangeVillage] = useState(0);
  const [isIncreaseVillage, setIsIncreaseVillage] = useState(true);
  const [changeInnovation, setChangeInnovation] = useState(0);
  const [isIncreaseInnovation, setIsIncreaseInnovation] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          const userRef = doc(firestore, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserRole(userSnap.data()?.role);
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    const fetchInnovatorCount = async () => {
      try {
        const db = getFirestore();
        const innovatorsRef = collection(db, "innovators");
        const snapshot = await getDocs(innovatorsRef);
        setTotalInnovators(snapshot.size);
      } catch (error) {
        console.error("Error fetching innovator count:", error);
      }
    };

    const fetchVillageCount = async () => {
      try {
        const db = getFirestore();
        const villageRef = collection(db, "villages");
        const snapshot = await getDocs(villageRef);
        const validVillages = snapshot.docs.filter((doc) => {
          const data = doc.data();
          return data.namaDesa && data.namaDesa.length > 1;
        });
        setTotalVillage(validVillages.length);
      } catch (error) {
        console.error("Error fetching village count:", error);
      }
    };

    const fetchInnovationCount = async () => {
      try {
        const db = getFirestore();
        const innovationsRef = collection(db, "innovations");
        const q = query(innovationsRef, where("namaInovasi", "!=", ""));
        const snapshot = await getDocs(q);
        setTotalInnovation(snapshot.size);
      } catch (error) {
        console.error("Error fetching innovation count:", error);
      }
    };

    fetchUserRole();
    fetchInnovatorCount();
    fetchVillageCount();
    fetchInnovationCount();
  }, []);

  const handleDownload = () => {
    const excelData = [
      {
        Kategori: "Desa Digital",
        Jumlah: totalVillage,
      },
      {
        Kategori: "Innovator",
        Jumlah: totalInnovators,
      },
      {
        Kategori: "Inovasi",
        Jumlah: totalInnovation,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Informasi Umum");
    XLSX.writeFile(workbook, "informasi_umum.xlsx");
  };

  return (
    <Stack>
      <Box p={4}>
        <Flex align="center" justify="space-between" mb={4}>
          <Text fontSize="md" fontWeight="bold">
            Informasi Umum
          </Text>
        </Flex>

        <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={3}>
          {[
            {
              label: "Desa Digital",
              icon: <Image src={VillageActive} alt="Village Icon" w={6} h={6} />,
              iconBg: "#C6D8D0",
              value: totalVillage,
              change: changeVillage,
              isIncrease: isIncreaseVillage,
            },
            {
              label: "Innovator",
              icon: <FaUsers size={20} color="#347357" />,
              iconBg: "#C6D8D0",
              value: totalInnovators,
              change: changeInnovator,
              isIncrease: isIncreaseInnovator,
            },
            {
              label: "Inovasi",
              icon: <Image src={InnovationActive} alt="Innovation Icon" w={6} h={6} />,
              iconBg: "#C6D8D0",
              value: totalInnovation,
              change: changeInnovation,
              isIncrease: isIncreaseInnovation,
            },
          ].map((stat, index) => (
            <Box
              key={index}
              p={4}
              borderRadius="lg"
              boxShadow="md"
              border="1px solid"
              borderColor="gray.200"
              bg="white"
              minW={0}
              overflow="hidden"
              minH="150px"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
            >
              <Box
                bg={stat.iconBg}
                borderRadius="full"
                p={2}
                w="40px"
                h="40px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={2}
              >
                {stat.icon}
              </Box>

              <Text fontSize="22px" fontWeight="bold" color="green.700" lineHeight="1">
                {stat.value}
              </Text>

              <Text fontSize="11px" color="gray.600" mt={1}>
                {stat.label}
              </Text>

              <Flex align="center" color={stat.isIncrease ? "green.500" : "red.500"} mt={1}>
                <Icon as={stat.isIncrease ? ArrowUpRight : ArrowDownRight} boxSize={3} mr={1} />
                <Text fontSize="6px">
                  {Math.abs(stat.change)} {stat.isIncrease ? "bertambah" : "berkurang"} dari bulan lalu
                </Text>
              </Flex>
            </Box>
          ))}
        </Grid>
      </Box>
    </Stack>
  );
};

export default InformasiUmum;
