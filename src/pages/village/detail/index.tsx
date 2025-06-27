import DigitalLit from "Assets/icons/digital-literacy.svg";
import DigitalRead from "Assets/icons/digital-readiness.svg";
import Geography from "Assets/icons/geography.svg";
import GoodService from "Assets/icons/good-service.svg";
import Infrastructure from "Assets/icons/infrastructure.svg";
import Instagram from "Assets/icons/instagram.svg";
import Location from "Assets/icons/location.svg";
import Resource from "Assets/icons/resource-village.svg";
import SocCul from "Assets/icons/socio-cultural.svg";
import Web from "Assets/icons/web.svg";
import Whatsapp from "Assets/icons/whatsapp.svg";
import CardInnovation from "Components/card/innovation";
import TopBar from "Components/topBar";
import { paths } from "Consts/path";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import EnlargedImage from "../components/Image";
import defaultHeader from "@public/images/default-header.svg";
import defaultLogo from "@public/images/default-logo.svg";

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import StatusCard from "Components/card/status/StatusCard";
import {
  DocumentData,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { generatePath, useNavigate } from "react-router-dom";
import { auth, firestore } from "../../../firebase/clientApp";
import {
  ActionContainer,
  Background,
  ButtonKontak,
  CardContainer,
  ChipContainer,
  ContPotensiDesa,
  ContentContainer,
  Description,
  Horizontal,
  Icon,
  Label,
  Logo,
  SubText,
  Title,
} from "./_detailStyle";
import RejectionModal from "Components/confirmModal/RejectionModal";
import ActionDrawer from "Components/drawer/ActionDrawer.tsx";

export default function DetailVillage() {
  const navigate = useNavigate();
  const [userLogin] = useAuthState(auth);
  const innovationRef = collection(firestore, "innovations");
  const [innovations, setInnovations] = useState<DocumentData[]>([]);
  const [village, setVillage] = useState<DocumentData | undefined>();
  const [user, setUser] = useState<DocumentData | undefined>();
  const { id } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [admin, setAdmin] = useState(false);
  const [owner, setOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [modalInput, setModalInput] = useState(""); // Catatan admin

  const formatLocation = (lokasi: any) => {
    if (!lokasi) return "No Location";
    const kecamatan = lokasi.kecamatan?.label || "Unknown Subdistrict";
    const kabupaten = lokasi.kabupatenKota?.label || "Unknown City";
    const provinsi = lokasi.provinsi?.label || "Unknown Province";

    return `KECAMATAN ${kecamatan}, ${kabupaten}, ${provinsi}`;
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      if (id) {
        const docRef = doc(firestore, "villages", id);
        await updateDoc(docRef, {
          status: "Terverifikasi",
        });
        setVillage((prev) => ({
          ...prev,
          status: "Terverifikasi",
        }));
      } else {
        throw new Error("Village ID is undefined");
      }
    } catch (error) {
      // setError(error.message);
    }
    setLoading(false);
    onClose();
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      if (id) {
        const docRef = doc(firestore, "villages", id);
        await updateDoc(docRef, {
          status: "Ditolak",
          catatanAdmin: modalInput, // Simpan alasan penolakan ke Firestore
        });
        setVillage((prev) => ({
          ...prev,
          status: "Ditolak",
          catatanAdmin: modalInput,
        }));
      } else {
        throw new Error("Village ID is undefined");
      }
    } catch (error) {
      console.error("Error during rejection:", error);
    }
    setLoading(false);
    setOpenModal(false); // Tutup modal setelah menyimpan
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (userLogin?.uid) {
        const userRef = doc(firestore, "users", userLogin.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setAdmin(userSnap.data()?.role === "admin");
          if (userSnap.data()?.id === id) {
            setOwner(true);
          }
        }
      }
    };
    fetchUser();
    // console.log("User:", user);
  }, [userLogin, id]);

  useEffect(() => {
    const fetchInnovations = async () => {
      const innovationsSnapshot = await getDocs(innovationRef);
      const innovationsData = innovationsSnapshot.docs.map((doc) => ({
        id: doc.id, // Ambil id dokumen dari Firestore
        ...doc.data(), // Ambil data lainnya
      }));
      setInnovations(innovationsData);
    };

    fetchInnovations();
  }, [innovationRef]);

  useEffect(() => {
    const fetchVillageData = async () => {
      if (id) {
        try {
          const docRef = doc(firestore, "villages", id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            // console.log("Village Data:", docSnap.data());
            setVillage(docSnap.data());
          } else {
            console.error("No such document!");
          }
        } catch (error) {
          console.error("Error fetching village data:", error);
        }
      } else {
        console.error("Village ID is undefined");
      }
    };

    fetchVillageData();
  }, [id]); // Tambahkan id sebagai dependensi

  return (
    <Box paddingBottom={4}>
      <TopBar title="Detail Desa" onBack={() => navigate(-1)} />
      <div style={{ position: "relative", width: "100%" }}>
        <Background src={village?.header || defaultHeader} alt="background" />
        <Logo mx={16} my={-40} src={village?.logo || defaultLogo} alt="logo" />
      </div>
      <div>
        <ContentContainer>
          <Title> {village?.namaDesa} </Title>
          <ActionContainer>
            <Icon src={Location} alt="loc" />
            <Description>{formatLocation(village?.lokasi)}</Description>
          </ActionContainer>
          <div>
            <SubText margin-bottom={16}>Tentang</SubText>
            <Description>{village?.deskripsi}</Description>
          </div>
          <div>
            <SubText>Potensi Desa</SubText>
            <ContPotensiDesa>
              {village?.potensiDesa?.map((potensi: string, index: number) => (
                <ChipContainer key={index}>
                  <Label>{potensi}</Label>
                </ChipContainer>
              ))}
            </ContPotensiDesa>
          </div>
          <div>
            <SubText>Karakteristik Desa</SubText>
            <Accordion defaultIndex={[0]} allowMultiple>
              <AccordionItem>
                <h2>
                  <AccordionButton paddingLeft="4px" paddingRight="4px">
                    <Flex
                      as="span"
                      flex="1"
                      textAlign="left"
                      fontSize="12px"
                      fontWeight="700"
                      gap={2}
                    >
                      <Icon src={Geography} alt="geo" /> Geografis
                    </Flex>
                    <AccordionIcon color="#347357" />
                  </AccordionButton>
                </h2>
                <AccordionPanel
                  pb={4}
                  fontSize={12}
                  paddingLeft="4px"
                  paddingRight="4px"
                >
                  {village?.geografisDesa}
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <h2>
                  <AccordionButton paddingLeft="4px" paddingRight="4px">
                    <Flex
                      as="span"
                      flex="1"
                      textAlign="left"
                      fontSize="12px"
                      fontWeight="700"
                      gap={2}
                    >
                      <Icon src={Infrastructure} alt="Infrastrusture" />{" "}
                      Infrastruktur
                    </Flex>
                    <AccordionIcon color="#347357" />
                  </AccordionButton>
                </h2>
                <AccordionPanel
                  pb={4}
                  fontSize={12}
                  paddingLeft="4px"
                  paddingRight="4px"
                >
                  <Box>
                    <Text fontWeight="bold">Kondisi Jalan:</Text>
                    <Text>{village?.kondisijalan || "Tidak tersedia"}</Text>
                  </Box>
                  <Box mt={2}>
                    <Text fontWeight="bold">Jaringan Internet:</Text>
                    <Text>{village?.jaringan || "Tidak tersedia"}</Text>
                  </Box>
                  <Box mt={2}>
                    <Text fontWeight="bold">Ketersediaan Listrik:</Text>
                    <Text>{village?.listrik || "Tidak tersedia"}</Text>
                  </Box>
                  <Box mt={2}>
                    <Text fontWeight="bold">Lain-lain:</Text>
                    <Text>
                      {village?.infrastrukturDesa || "Tidak tersedia"}
                    </Text>
                  </Box>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <h2>
                  <AccordionButton paddingLeft="4px" paddingRight="4px">
                    <Flex
                      as="span"
                      flex="1"
                      textAlign="left"
                      fontSize="12px"
                      fontWeight="700"
                      gap={2}
                    >
                      <Icon src={DigitalRead} alt="DigR" /> Kesiapan Digital
                    </Flex>
                    <AccordionIcon color="#347357" />
                  </AccordionButton>
                </h2>
                <AccordionPanel
                  pb={4}
                  fontSize={12}
                  paddingLeft="4px"
                  paddingRight="4px"
                >
                  <Box>
                    <Text fontWeight="bold">
                      Perkembangan Teknologi Digital:
                    </Text>
                    <Text>{village?.teknologi || "Tidak tersedia"}</Text>
                  </Box>
                  <Box mt={2}>
                    <Text fontWeight="bold">Kemampuan Teknologi:</Text>
                    <Text>{village?.kemampuan || "Tidak tersedia"}</Text>
                  </Box>
                </AccordionPanel>
              </AccordionItem>
              {/* <AccordionItem>
                <h2>
                  <AccordionButton paddingLeft="4px" paddingRight="4px">
                    <Flex
                      as="span"
                      flex="1"
                      textAlign="left"
                      fontSize="12px"
                      fontWeight="700"
                      gap={2}
                    >
                      <Icon src={DigitalLit} alt="DigL" /> Literasi Digital
                    </Flex>
                    <AccordionIcon color="#347357" />
                  </AccordionButton>
                </h2>
                <AccordionPanel
                  pb={4}
                  fontSize={12}
                  paddingLeft="4px"
                  paddingRight="4px"
                >
                  {village?.kesiapanTeknologi}
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <h2>
                  <AccordionButton paddingLeft="4px" paddingRight="4px">
                    <Flex
                      as="span"
                      flex="1"
                      textAlign="left"
                      fontSize="12px"
                      fontWeight="700"
                      gap={2}
                    >
                      <Icon src={GoodService} alt="GoodService" /> Pemantapan
                      Pelayanan
                    </Flex>
                    <AccordionIcon color="#347357" />
                  </AccordionButton>
                </h2>
                <AccordionPanel
                  pb={4}
                  fontSize={12}
                  paddingLeft="4px"
                  paddingRight="4px"
                >
                  {village?.pemantapanPelayanan}
                </AccordionPanel>
              </AccordionItem> */}
              <AccordionItem>
                <h2>
                  <AccordionButton paddingLeft="4px" paddingRight="4px">
                    <Flex
                      as="span"
                      flex="1"
                      textAlign="left"
                      fontSize="12px"
                      fontWeight="700"
                      gap={2}
                    >
                      <Icon src={SocCul} alt="SocCul" /> Sosial dan Budaya
                    </Flex>
                    <AccordionIcon color="#347357" />
                  </AccordionButton>
                </h2>
                <AccordionPanel
                  pb={4}
                  fontSize={12}
                  paddingLeft="4px"
                  paddingRight="4px"
                >
                  {village?.sosialBudaya}
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <h2>
                  <AccordionButton paddingLeft="4px" paddingRight="4px">
                    <Flex
                      as="span"
                      flex="1"
                      textAlign="left"
                      fontSize="12px"
                      fontWeight="700"
                      gap={2}
                    >
                      <Icon src={Resource} alt="Resource" /> Sumber Daya Alam
                    </Flex>
                    <AccordionIcon color="#347357" />
                  </AccordionButton>
                </h2>
                <AccordionPanel
                  pb={4}
                  fontSize={12}
                  paddingLeft="4px"
                  paddingRight="4px"
                >
                  {village?.sumberDaya}
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </div>
          <div>
            <SubText>Galeri Desa</SubText>
            <CardContainer>
              {village?.images && Object.values(village.images).length > 0 ? (
                <Horizontal>
                  {(Object.values(village.images) as string[]).map(
                    (image: string, index: number) => (
                      <EnlargedImage key={index} src={image} />
                    )
                  )}
                </Horizontal>
              ) : (
                <Text color="gray.400" fontSize={12}>
                  Tidak ada gambar
                </Text>
              )}
            </CardContainer>
          </div>
          <div>
            <Flex
              justifyContent="space-between"
              alignItems="flex-end"
              align-self="stretch"
            >
              <SubText>Inovasi yang Diterapkan</SubText>
              <Text
                onClick={() => navigate("/target-page")} // Ganti "/target-page" dengan rute yang sesuai
                cursor="pointer"
                color="var(--Primary, #347357)"
                fontSize="12px"
                fontWeight="500"
                textDecorationLine="underline"
                paddingBottom="12px"
              >
                {" "}
                Lihat Semua{" "}
              </Text>
            </Flex>
            <CardContainer>
              <Horizontal>
                {innovations.map((innovation, idx) => (
                  <CardInnovation
                    key={idx}
                    images={innovation.images}
                    namaInovasi={innovation.namaInovasi}
                    kategori={innovation.kategori}
                    deskripsi={innovation.deskripsi}
                    tahunDibuat={innovation.tahunDibuat}
                    innovatorLogo={innovation.innovatorImgURL}
                    innovatorName={innovation.namaInnovator}
                    onClick={() => {
                      if (innovation.id) {
                        navigate(
                          generatePath(paths.DETAIL_INNOVATION_PAGE, {
                            id: innovation.id,
                          })
                        );
                      }
                    }}
                  />
                ))}
              </Horizontal>
            </CardContainer>
          </div>
          <Box
            position="fixed"
            bottom="0"
            left="50%"
            transform="translateX(-50%)"
            width="100%"
            maxWidth="360px"
            bg="white"
            p="3.5"
            boxShadow="0px -6px 12px rgba(0, 0, 0, 0.1)"
          >
            {/* Logika untuk Admin */}
            {admin ? (
              village?.status === "Terverifikasi" ||
              village?.status === "Ditolak" ? (
                // Tampilkan StatusCard jika status Terverifikasi atau Ditolak
                <StatusCard
                  message={village?.catatanAdmin}
                  status={village?.status}
                />
              ) : (
                // Tampilkan tombol Verifikasi jika status belum Terverifikasi/Ditolak
                <Button width="100%" fontSize="14px" mb={8} onClick={onOpen}>
                  Verifikasi Permohonan Akun
                </Button>
              )
            ) : (
              // Logika untuk Non-Admin
              <Flex>
                <Button width="100%" onClick={onOpen}>
                  Kontak Desa
                </Button>
              </Flex>
            )}
          </Box>
          <RejectionModal
            isOpen={openModal}
            onClose={() => setOpenModal(false)}
            onConfirm={handleReject}
            message={modalInput}
            setMessage={setModalInput}
            loading={loading}
          />
        </ContentContainer>
      </div>
      <ActionDrawer
        isOpen={isOpen}
        onClose={onClose}
        isAdmin={admin}
        loading={loading}
        onVerify={handleVerify}
        setOpenModal={setOpenModal}
        role="Desa"
        contactData={{
          whatsapp: village?.whatsapp || "",
          instagram: village?.instagram || "https://www.instagram.com/",
          website: village?.website || "https://www.google.com/",
        }}
      />
    </Box>
  );
}
