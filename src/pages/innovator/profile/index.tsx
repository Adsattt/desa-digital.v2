import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Image,
  Stack,
  Tag,
  TagLabel,
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
import Loading from "Components/loading";
import { useAdminStatus } from "Hooks/useAdminStatus";
import defaulHeader from "@public/images/default-header.svg";
import defaulLogo from "@public/images/default-logo.svg";
import { DesaIcon } from "Assets/icons/village-active.svg";

const ProfileInnovator: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [userLogin] = useAuthState(auth);
  const [innovatorData, setInnovatorData] = useState<DocumentData | null>(null);
  const [innovations, setInnovations] = useState<DocumentData[]>([]);
  const [villages, setVillages] = useState<DocumentData[]>([]); // Add state for villages
  const [owner, setOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [openModal, setOpenModal] = useState(false);
  const [modalInput, setModalInput] = useState("");

  const { isAdmin, checking } = useAdminStatus();

  const handleVerify = async () => {
    setLoading(true);
    try {
      if (id) {
        const innovatorRef = doc(firestore, "innovators", id);
        await updateDoc(innovatorRef, {
          status: "Terverifikasi",
          catatanAdmin: "",
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

  const toEditInovator = () => {
    navigate(paths.INNOVATOR_FORM);
  };

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

        const villagesRef = collection(firestore, "villages");
        const inovationRef = collection(firestore, "innovations");
        const q = query(
          villagesRef,
          where("userId", "in", innovatorDoc.data()?.desaId)
        );
        const q2 = query(
          inovationRef,
          where("desaId", "==", innovatorDoc.data()?.desaId),
          where("innovatorId", "==", id)
        );
        const inovationDocs = await getDocs(q2);
        const inovationData = inovationDocs.docs.map((doc) => ({
          id: doc.id, // Ensure the ID is included
          namaInovasi: doc.data().namaInovasi,
        }));
        console.log("Fetched innovations:", inovationData);
        const villagesDocs = await getDocs(q);
        const villagesData = villagesDocs.docs.map((doc) => ({
          id: doc.id, // Ensure the ID is included
          ...doc.data(),
          inovasiDiterapkan: inovationData.map(
            (innovation) => innovation.namaInovasi
          ),
        }));
        console.log("Fetched villages:", villagesData);
        setVillages(villagesData);
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

  if (loading || checking) {
    return <Loading />;
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
      <div style={{ position: "relative", width: "100%" }}>
        <Background src={innovatorData.header || defaulHeader} alt="header" />
        <Logo
          src={innovatorData.logo || defaulLogo}
          alt="logo"
          mx={16}
          my={-40}
        />
      </div>
      <div>
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
                  Kategori Inovator
                </Text>
                <Text fontSize="12px" fontWeight="400" color="#4B5563" flex="1">
                  {innovatorData.kategori}
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
            {innovations.length > 0 ? (
              <InnovationPreview innovations={innovations} innovatorId={id} />
            ) : (
              <Text fontSize="14px" color="#9CA3AF" textAlign="center">
              Inovator belum memiliki inovasi
              </Text>
            )}
            </Flex>
          <Flex direction="column" gap={2}>
            <Text fontSize="16px" fontWeight="700" mb={3}>
              Desa Dampingan
            </Text>
            {villages.length > 0 ? (
              villages.map((village) => (
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
                      generatePath(paths.DETAIL_VILLAGE_PAGE, {
                        id: village.id,
                      })
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
                  <Box borderTop="1px" borderColor="gray.300" pt={3} mt={3} />
                  <Text fontSize="12px" fontWeight="400" mb={2} color="#9CA3AF">
                    Inovasi diterapkan
                  </Text>
                  <Flex direction="row" gap={2} flexWrap="wrap">
                    {Array.isArray(village.inovasiDiterapkan) &&
                      village.inovasiDiterapkan.map((inovasi, index) => (
                        <Tag
                          key={index}
                          size="sm"
                          variant="solid"
                          borderRadius="full"
                          color="#E5E7EB"
                        >
                          <TagLabel>{inovasi}</TagLabel>
                        </Tag>
                      ))}
                  </Flex>
                </Box>
              ))
            ) : (
              <Text fontSize="14px" color="#9CA3AF" textAlign="center">
                Belum ada desa yang menerapkan
              </Text>
            )}
          </Flex>
        </ContentContainer>
      </div>
      {isAdmin ? (
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
            {owner ? "Edit Profile" : "Kontak"}
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
        isAdmin={isAdmin}
        role="Inovator"
        loading={loading}
        setOpenModal={setOpenModal}
        contactData={{
          whatsapp: innovatorData.whatsapp || "",
          instagram: innovatorData.instagram || "",
          website: innovatorData?.website || "",
        }}
      />
    </>
  );
};

export default ProfileInnovator;
