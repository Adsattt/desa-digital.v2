import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  Image,
} from "@chakra-ui/react";
import { FaUsers } from "react-icons/fa";
import InnovationActive from "Assets/icons/innovation3.svg";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

interface CardItemProps {
  icon: React.ReactNode;
  mainText: React.ReactNode; // Ubah dari string ke React.ReactNode
  subText: string;
  label: string;
  mainTextSize?: string;
}

const CardItem: React.FC<CardItemProps> = ({
  icon,
  mainText,
  subText,
  label,
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const iconBg = useColorModeValue("#C6D8D0", "green.700");
  const textSecondary = useColorModeValue("gray.500", "gray.400");

  return (
    <Box
      bg={cardBg}
      p={4}
      mt={5}
      ml={4}
      boxShadow="md"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.200"
      w="100%"
      maxW="150px"
    >
      <Flex justify="space-between" align="center">
        <Box>{mainText}</Box>
        <Box
          bg={iconBg}
          w={9}
          h={9}
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="full"
        >
          {icon}
        </Box>
      </Flex>
      <Text mt={1.9} fontSize="15px" fontWeight="semibold">
        {label}
      </Text>
      <Text fontSize="7px" color={textSecondary}>
        {subText}
      </Text>
    </Box>
  );
};

const TwoCard: React.FC = () => {
  const [totalInovasi, setTotalInovasi] = useState({ desa: 0, total: 0 });
  const [totalInovator, setTotalInovator] = useState({ desa: 0, total: 0 });
  const [userDesa, setUserDesa] = useState("Desa");

  useEffect(() => {
    const fetchData = async () => {
      const db = getFirestore();
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("User belum login");
        return;
      }

      try {
        // Ambil data desa berdasarkan userId
        const desaQuery = query(
          collection(db, "villages"),
          where("userId", "==", user.uid)
        );
        const desaSnap = await getDocs(desaQuery);

        if (desaSnap.empty) {
          console.warn("Data desa tidak ditemukan.");
          return;
        }

        const desaData = desaSnap.docs[0].data();
        const namaDesa = desaData.namaDesa || "Desa";
        setUserDesa(namaDesa);

        // Ambil data claimInnovations yang terverifikasi terkait dengan desa
        const claimQuery = query(
          collection(db, "claimInnovations"),
          where("desaId", "==", user.uid)
        );
        const claimSnap = await getDocs(claimQuery);

        // Ambil semua inovasiId terkait dengan klaim desa ini
        const inovasiIds = claimSnap.docs.map(doc => doc.data().inovasiId); // Ambil inovasiId dari klaim

        // Hitung jumlah klaim inovasi yang terverifikasi untuk desa ini
        const totalInovasiDesa = inovasiIds.length; // Jumlah inovasi yang diklaim oleh desa ini

        // Ambil total seluruh inovasi yang ada di database (tidak ada relasi)
        const allInovasiSnap = await getDocs(collection(db, "innovations"));
        const totalAllInovasi = allInovasiSnap.size; // Jumlah total inovasi yang ada di database

        setTotalInovasi({
          desa: totalInovasiDesa, // jumlah inovasi yang diklaim oleh desa ini
          total: totalAllInovasi, // jumlah seluruh inovasi yang ada di database
        });

        // Ambil data inovator yang relevan dengan klaim inovasi
        const inovatorIds = claimSnap.docs.map(doc => doc.data().inovatorId); // Ambil inovatorId dari klaim
        console.log('inovator',inovatorIds);

        const  totalInovatorDesa = inovasiIds.length;
        

        // Ambil total seluruh inovasi yang ada di database (tidak ada relasi)
        const allInovatorSnap = await getDocs(collection(db, "innovators"));
        const totalAllInovator = allInovatorSnap.size; // Jumlah total inovasi yang ada di database

        setTotalInovator({
          desa: totalInovatorDesa, // jumlah inovator yang terkait dengan desa ini
          total: totalAllInovator, // jumlah total inovator yang ada di database
        });

      } catch (error) {
        console.error("Gagal ambil data:", error);
      }
    };

    fetchData();
  }, []);
  // Pastikan effect ini hanya dipanggil sekali ketika komponen di-mount

  const formatStyledText = (x: number, y: number) => (
    <Text as="span" display="flex" alignItems="baseline" fontWeight="bold">
      <Text as="span" fontSize="35px">
        {x}
      </Text>
      <Text as="span" fontSize="16px" ml={0.5} fontWeight="normal">
        /{y}
      </Text>
    </Text>
  );

  return (
    <Flex
      direction="row"
      flexWrap="nowrap"
      gap={2}
      overflowX="auto"
    >
      <CardItem
        icon={<Image src={InnovationActive} alt="Innovation Icon" w={5} h={5} />}
        mainText={formatStyledText(totalInovasi.desa, totalInovasi.total)}
        label="Inovasi"
        subText={`Telah diterapkan oleh ${userDesa}`}
      />
      <CardItem
        icon={<FaUsers size={20} color="#347357" />}
        mainText={formatStyledText(totalInovator.desa, totalInovator.total)}
        label="Inovator"
        subText={`Telah memberikan inovasi untuk ${userDesa}`}
      />
    </Flex>
  );
};

export default TwoCard;