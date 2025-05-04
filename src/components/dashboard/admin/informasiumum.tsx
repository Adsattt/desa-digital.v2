import {
    Box,
    Flex,
    Stack,
    Text,
    Icon,
    Image,
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
  import UserActive from 'Assets/icons/user-active.svg'
  import InnovationActive from "Assets/icons/innovation2.svg";
  import { DownloadIcon } from "@chakra-ui/icons";
  import * as XLSX from "xlsx";
  
  type InfoCardProps = {
    icon: React.ReactNode;
    title: string;
    value: number;
    change: number;
    isIncrease: boolean;
  };
  
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
  
    // ✅ FUNCTION DOWNLOAD EXCEL
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
      <Stack spacing={4} p={4}>
        <Flex align="center" justify="space-between">
          <Text fontSize="m" fontWeight="bold">
            Informasi Umum
          </Text>
          {/* <Button
            size="sm"
            bg="white"
            boxShadow="md"
            border="2px solid"
            borderColor="gray.200"
            px={2}
            py={2}
            display="flex"
            alignItems="center"
            _hover={{ bg: "gray.100" }}
            cursor="pointer"
            onClick={handleDownload}
          >
            <DownloadIcon boxSize={3} color="black" />
          </Button> */}
        </Flex>
  
        <InfoCard
          icon={<Image src={VillageActive} alt="Village Icon" boxSize={6} />}
          title="Desa Digital"
          value={totalVillage}
          change={changeVillage}
          isIncrease={isIncreaseVillage}
        />
        <InfoCard
          icon={<FaUsers size={24} color="#347357" />}
          title="Innovator"
          value={totalInnovators}
          change={changeInnovator}
          isIncrease={isIncreaseInnovator}
        />
        <InfoCard
          icon={<Image src={InnovationActive} alt="Innovation Icon" boxSize={6} />}
          title="Inovasi"
          value={totalInnovation}
          change={changeInnovation}
          isIncrease={isIncreaseInnovation}
        />
      </Stack>
    );
  };
  
  const InfoCard: React.FC<InfoCardProps> = ({ icon, title, value, change, isIncrease }) => {
    return (
      <Flex
        align="center"
        gap="13px"
        bg="white"
        borderRadius="xl"
        p="15px"
        boxShadow="lg"
        border="2px solid"
        borderColor="gray.200"
        transition="all 0.2s ease-in-out"
        height="100px"
      >
        <Box bg="green.50" p="8px" borderRadius="full">
          {icon}
        </Box>
        <Box>
          <Text fontSize="15px" fontWeight="semibold" color="green.700">
            {title}
          </Text>
          <Flex justify="space-between" align="center" w="full">
            <Text fontSize="25px" fontWeight="bold" color="green.800" mr={2}>
              {value}
            </Text>
            <Flex align="center" color={isIncrease ? "green.500" : "red.500"}>
              <Icon as={isIncrease ? ArrowUpRight : ArrowDownRight} boxSize={3} mt={2} />
              <Text ml="2px" fontWeight="medium" fontSize="14px" mt={2}>
                {Math.abs(change)} {isIncrease ? "bertambah" : "berkurang"} dari bulan lalu
              </Text>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    );
  };
  
  export default InformasiUmum;
  