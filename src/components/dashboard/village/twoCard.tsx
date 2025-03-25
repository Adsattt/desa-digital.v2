import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  Image,
} from "@chakra-ui/react";
import { FaUsers } from "react-icons/fa";
import InnovationActive from "Assets/icons/innovation1.svg";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

interface CardItemProps {
  icon: React.ReactNode;
  mainText: string;
  subText: string;
  label: string;
}

const CardItem: React.FC<CardItemProps> = ({
  icon,
  mainText,
  subText,
  label,
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const iconBg = useColorModeValue("#F0FFF4", "green.700");
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
        <Text fontSize="23px" fontWeight="bold">
          {mainText}
        </Text>
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
  const [totalInovasi, setTotalInovasi] = useState("0/0");
  const [totalInovator, setTotalInovator] = useState("0/0");
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
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const desa = userSnap.data()?.desa || "Desa";
        setUserDesa(desa);

        const inovasiSnap = await getDocs(collection(db, "innovations"));
        const totalAllInovasi = inovasiSnap.size;

        const desaInovasi = inovasiSnap.docs.filter((doc) => {
          const inputDesaMenerapkan = doc.data().inputDesaMenerapkan || [];
          return inputDesaMenerapkan.includes(desa);
        });
        setTotalInovasi(`${desaInovasi.length}/${totalAllInovasi}`);

        const innovatorSnap = await getDocs(collection(db, "innovators"));
        const totalAllInnovators = innovatorSnap.size;

        const innovatorIds = new Set(
          desaInovasi.map((doc) => doc.data().innovatorId)
        );

        setTotalInovator(`${innovatorIds.size}/${totalAllInnovators}`);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Flex direction={{ base: "column", md: "row" }} gap={2}>
      <CardItem
        icon={<Image src={InnovationActive} alt="Innovation Icon" w={5} h={5} />}
        mainText={totalInovasi}
        label="Inovasi"
        subText={`Telah diterapkan oleh desa ${userDesa}`}
      />
      <CardItem
        icon={<FaUsers size={20} color="#347357" />}
        mainText={totalInovator}
        label="Inovator"
        subText={`Telah memberikan inovasi untuk desa ${userDesa}`}
      />
    </Flex>
  );
};

export default TwoCard;