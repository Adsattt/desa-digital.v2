import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Image,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import TopBar from "Components/topBar/index";
import { paths } from "Consts/path";
import {
  DocumentData,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { LuDot } from "react-icons/lu";
import { TbPlant2 } from "react-icons/tb";
import { generatePath, useNavigate, useParams } from "react-router-dom";
import { auth, firestore } from "../../../firebase/clientApp";
import InnovationPreview from "../components/hero/innovations";
import {
  Background,
  ContentContainer,
  Description,
  Label,
  Logo,
  Title,
} from "./_ProfileStyles";

import Send from "Assets/icons/send.svg";
import { Icon, NavbarButton } from "../../village/profile/_profileStyle";
import StatusCard from "Components/card/status/StatusCard";
import RejectionModal from "Components/confirmModal/RejectionModal";
import ActionDrawer from "Components/drawer/ActionDrawer";
import defaultHeader from "@public/images/default-header.svg";


const ProfileInnovator: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [userLogin] = useAuthState(auth);
  const [innovatorData, setInnovatorData] = useState<DocumentData | null>(null);
  const [innovations, setInnovations] = useState<DocumentData[]>([]);
  const [villages, setVillages] = useState<DocumentData[]>([]); // Add state for villages
  const [owner, setOwner] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [openModal, setOpenModal] = useState(false);
  const [modalInput, setModalInput] = useState("");

  const handleVerify = async () => {
    setLoading(true);
    try {
      if (id) {
        const innovatorRef = doc(firestore, "innovators", id);
        await updateDoc(innovatorRef, {
          status: "Terverifikasi",
        });
        setInnovatorData((prev) => ({ ...prev, status: "Terverifikasi" }));
      }
    } catch (error) {
      console.error("Error verifying user:", error);
      setError("Error verifying user.");
    }
    setLoading(false);
    onClose();
  };

  const toPengajuanInovasi = () => {
    navigate(paths.PENGAJUAN_INOVASI_PAGE);
  };

  const toEditInovator = () => {
    navigate(paths.INNOVATOR_FORM);
  }

  const handleReject = async () => {
    setLoading(true);
    try {
      if (id) {
        const innovatorRef = doc(firestore, "innovators", id);
        await updateDoc(innovatorRef, {
          status: "Ditolak",
          catatanAdmin: modalInput,
        });
        setInnovatorData((prev) => ({
          ...prev,
          status: "Ditolak",
          catatanAdmin: modalInput,
        }));
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
      setError("Error rejecting user.");
    }
    setLoading(false);
    setOpenModal(false);
    // onClose();
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (userLogin?.uid) {
        const userRef = doc(firestore, "users", userLogin.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const user = userDoc.data();
          setAdmin(user?.role === "admin");
        }
      }
    };
    fetchUser();
  });
  // Fetch innovator data
  useEffect(() => {
    if (!id) {
      setError("Invalid innovator ID.");
      setLoading(false);
      return;
    }

    const fetchInnovatorData = async () => {
      try {
        const innovatorRef = doc(firestore, "innovators", id);
        const innovatorDoc = await getDoc(innovatorRef);
        if (innovatorDoc.exists()) {
          setInnovatorData(innovatorDoc.data());
          if (userLogin?.uid) {
            setOwner(innovatorDoc.data().id === userLogin.uid);
          }
        } else {
          console.log("Innovator not found");
          setError("Innovator not found.");
        }
      } catch (error) {
        console.error("Error fetching innovator data:", error);
        setError("Error fetching innovator data.");
      } finally {
        setLoading(false);
      }
    };

    fetchInnovatorData();
  }, [id, userLogin?.uid]);

  // Fetch innovations data
  useEffect(() => {
    const fetchInnovations = async () => {
      try {
        const innovationsRef = collection(firestore, "innovations");
        const q = query(innovationsRef, where("innovatorId", "==", id));
        const innovationsDocs = await getDocs(q);
        const innovationsData = innovationsDocs.docs.map((doc) => ({
          id: doc.id, // Ensure the ID is included
          ...doc.data(),
        }));
        setInnovations(innovationsData);
      } catch (error) {
        console.error("Error fetching innovations data:", error);
        setError("Error fetching innovations data.");
      }
    };

    if (id) {
      fetchInnovations();
    }
  }, [id]);



  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!innovatorData) {
    return <div>No data available</div>;
  }

  const truncateText = (text: string, wordLimit: number) => {
    const words = text.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : text;
  };

  return (
    <>
      <TopBar
        title={owner ? "Profile Saya" : "Profil Inovator"}
        onBack={() => navigate(-1)}
      />
      <Flex position="relative">
        <Background src={innovatorData.header || defaultHeader} alt="header" />
        <Logo src={innovatorData.logo} alt="logo" mx={16} my={-40} />
      </Flex>
      <ContentContainer>
        <Stack gap={2}>
          <Flex direction="column" align="flex-end" mb={owner ? 0 : 6}>
            {owner && (
              <Button
              leftIcon={<Image src={Send} alt="send" />}
              onClick={() => navigate(paths.PENGAJUAN_INOVASI_PAGE)}
              fontSize="12px"
              fontWeight="500"
              height="29px"
              width="136px"
              padding="6px 8px"
              borderRadius="4px"
            >
              Pengajuan Inovasi
            </Button>
            )}
          </Flex>
          <Title>{innovatorData.namaInovator}</Title>
          <Label>{innovatorData.kategori}</Label>
          <Flex direction="row" gap={3} mt={0} alignItems="center">
            <Icon as={FaWandMagicSparkles} color="#4B5563" />
            <Text fontSize="12px" fontWeight="400" color="#4B5563">
              {innovatorData.jumlahInovasi} Inovasi
            </Text>
            <Icon as={LuDot} color="#4B5563" />
            <Icon as={TbPlant2} color="#4B5563" />
            <Text fontSize="12px" fontWeight="400" color="#4B5563">
              {innovatorData.jumlahDesaDampingan} Desa Dampingan
            </Text>
          </Flex>
        </Stack>
        <Flex>
          <Stack direction="column">
            <Text fontSize="16px" fontWeight="700">
              Tentang
            </Text>
            <Flex flexDirection="column" alignItems="flex-start" gap="12px">
              {owner && (
                <>
                  <Flex
                    width="100%"
                    flexDirection="row"
                    alignItems="flex-start"
                    gap="16px"
                    paddingBottom="12px"
                  >
                    <Box color="#4B5563" fontSize="12px" minWidth="110px">
                      Nomor WhatsApp
                    </Box>
                    <Description>{innovatorData.whatsapp}</Description>
                  </Flex>
                  <Flex
                    width="100%"
                    flexDirection="row"
                    alignItems="flex-start"
                    gap="16px"
                    paddingBottom="12px"
                  >
                    <Box color="#4B5563" fontSize="12px" minWidth="110px">
                      Link Instagram
                    </Box>
                    <Description>{innovatorData.instagram}</Description>
                  </Flex>
                  <Flex
                    width="100%"
                    flexDirection="row"
                    alignItems="flex-start"
                    gap="16px"
                    paddingBottom="12px"
                  >
                    <Box color="#4B5563" fontSize="12px" minWidth="110px">
                      Link Website
                    </Box>
                    <Description>{innovatorData.website}</Description>
                  </Flex>
                </>
              )}
            </Flex>
            <Flex direction="row" alignItems="center">
              <Text fontSize="12px" fontWeight="700" color="#4B5563" mr={2}>
                Model bisnis digital:
              </Text>
              <Text fontSize="12px" fontWeight="400" color="#4B5563" flex="1">
                {innovatorData.modelBisnis}
              </Text>
            </Flex>

            <Box fontSize="12px" fontWeight="400" color="#4B5563">
              {isExpanded ? (
                // Tampilkan teks lengkap jika `isExpanded` true
                <>
                  {innovatorData.deskripsi}
                  {innovatorData.deskripsi.split(" ").length > 20 && ( // Tampilkan "Lebih Sedikit" jika lebih dari 20 kata
                    <Text
                      as="span"
                      fontSize="12px"
                      fontWeight="700"
                      color="#347357"
                      cursor="pointer"
                      textDecoration="underline"
                      onClick={() => setIsExpanded(!isExpanded)} // Toggle state
                    >
                      Lebih Sedikit
                    </Text>
                  )}
                </>
              ) : (
                // Tampilkan teks terpotong jika `isExpanded` false
                <>
                  {truncateText(innovatorData.deskripsi, 20)}
                  {innovatorData.deskripsi.split(" ").length > 20 && ( // Tampilkan "Selengkapnya" jika lebih dari 20 kata
                    <Text
                      as="span"
                      fontSize="12px"
                      fontWeight="700"
                      color="#347357"
                      cursor="pointer"
                      textDecoration="underline"
                      onClick={() => setIsExpanded(!isExpanded)} // Toggle state
                    >
                      {" "}
                      Selengkapnya
                    </Text>
                  )}
                </>
              )}
            </Box>
          </Stack>
        </Flex>
        <Flex direction="column">
          {/* Komponen Produk Inovasi */}
          <InnovationPreview innovations={innovations} innovatorId={id} />
        </Flex>
        <Flex direction="column">
          <Text fontSize="16px" fontWeight="700" mb={3}>
            Desa Dampingan
          </Text>
          {villages.map((village) => (
            <Box
              key={village.id}
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              p={2}
              mb={4}
              cursor="pointer"
              backgroundColor="white"
              borderColor="gray.200"
              onClick={() =>
                navigate(
                  generatePath(paths.DETAIL_VILLAGE_PAGE, { id: village.id })
                )
              }
            >
              <Flex alignItems="center" mb={3}>
                <Image
                  src={village.logo}
                  alt={`${village.namaDesa} Logo`}
                  boxSize="40px"
                  borderRadius="full"
                  mr={4}
                />
                <Text fontSize="12px" fontWeight="600">
                  {village.namaDesa}
                </Text>
                <ChevronRightIcon color="gray.500" ml="auto" />
              </Flex>
              {/* Menambahkan Border Pembatas Di Atas "Inovasi Diterapkan" */}
              <Box borderTop="1px" borderColor="gray.300" pt={3} mt={3}></Box>
              <Text fontSize="12px" fontWeight="400" mb={2} color="#9CA3AF">
                Inovasi diterapkan
              </Text>
              <Flex direction="row" gap={2} flexWrap="wrap">
                {Array.isArray(village.inovasiDiterapkan) &&
                  village.inovasiDiterapkan.map((inovasi, index) => (
                    <Box
                      key={index}
                      px={0}
                      py={0}
                      backgroundColor="gray.100"
                      borderRadius="full"
                      fontSize="12px"
                      display="inline-flex"
                    >
                      {inovasi}
                    </Box>
                  ))}
              </Flex>
            </Box>
          ))}
        </Flex>
      </ContentContainer>
      {admin ? (
        innovatorData.status === "Terverifikasi" ||
        innovatorData.status === "Ditolak" ? (
          <StatusCard
            status={innovatorData.status}
            message={innovatorData.catatanAdmin}
          />
        ) : (
          <NavbarButton>
            <Button width="100%" fontSize="14px" onClick={onOpen}>
              Verifikasi Permohonan Akun
            </Button>
          </NavbarButton>
        )
      ) : (
        <NavbarButton>
          <Button
            width="100%"
            onClick={() => {
              if (owner) {
                toEditInovator(); // Arahkan ke halaman edit inovator jika owner
              } else {
                onOpen(); // Buka modal jika bukan owner
              }
            }}
          >
            {owner ? "Edit" : "Kontak"}
          </Button>
        </NavbarButton>

      )}
      <RejectionModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={handleReject}
        setMessage={setModalInput}
        message={modalInput}
        loading={loading}
      />
      <ActionDrawer
        isOpen={isOpen}
        onClose={onClose}
        onVerify={handleVerify}
        isAdmin={admin}
        role="Inovator"
        loading={loading}
        setOpenModal={setOpenModal}
        contactData={{
          whatsapp: innovatorData.whatsapp || "", 
          instagram: innovatorData.instagram || "",
          website: innovatorData?.website || ""
        }}
      />
    </>
  );
};

export default ProfileInnovator;
