import DigitalLit from "Assets/icons/digital-literacy.svg";
import DigitalRead from "Assets/icons/digital-readiness.svg";
import Geography from "Assets/icons/geography.svg";
import GoodService from "Assets/icons/good-service.svg";
import Infrastructure from "Assets/icons/infrastructure.svg";
import Location from "Assets/icons/location.svg";
import Resource from "Assets/icons/resource-village.svg";
import Send from "Assets/icons/send.svg";
import SocCul from "Assets/icons/socio-cultural.svg";
import CardInnovation from "Components/card/innovation";
import TopBar from "Components/topBar";
import { paths } from "Consts/path";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import EnlargedImage from "../components/Image";

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Text,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
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
import { useAuthState } from "react-firebase-hooks/auth";
import { generatePath, useNavigate } from "react-router-dom";
import { auth, firestore } from "../../../firebase/clientApp";
import {
  ActionContainer,
  Background,
  CardContainer,
  ChipContainer,
  ContPotensiDesa,
  ContentContainer,
  Description,
  Horizontal,
  Icon,
  Label,
  Logo,
  NavbarButton,
  SubText,
  Title,
} from "./_profileStyle";
import StatusCard from "Components/card/status/StatusCard";
import RejectionModal from "Components/confirmModal/RejectionModal";
import ActionDrawer from "Components/drawer/ActionDrawer";

export default function ProfileVillage() {
  const navigate = useNavigate();
  const [userLogin] = useAuthState(auth);
  const innovationsRef = collection(firestore, "innovations");
  const [innovations, setInnovations] = useState<DocumentData[]>([]);
  const [village, setVillage] = useState<DocumentData | undefined>(undefined);
  const [owner, setOwner] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [openModal, setOpenModal] = useState(false);
  const [modalInput, setModalInput] = useState("");

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

const toEditVillage = () => {
  navigate(paths.VILLAGE_FORM);
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
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const user = userDoc.data();
          setAdmin(user?.role === "admin");
        }
      }
    };
    fetchUser();
  });

  useEffect(() => {
    const fetchVillageData = async () => {
      if (id) {
        const docRef = doc(firestore, "villages", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setVillage(docSnap.data());
          if (docSnap.data()?.userId === userLogin?.uid) {
            setOwner(true);
          }
        }
      }
    };
    fetchVillageData();
  });

   useEffect(() => {
     const fetchVillageAndInnovations = async () => {
       if (!id) return;

       // Fetch data dari collection villages berdasarkan id
       const villageRef = doc(firestore, "villages", id);
       const villageSnap = await getDoc(villageRef);

       if (villageSnap.exists()) {
         const villageData = villageSnap.data();
         const inovasiDiterapkan = villageData?.inovasiDiterapkan || [];

         // Ambil semua inovasiId dari field inovasiDiterapkan
         const inovasiIds = inovasiDiterapkan.map(
           (inovasi: any) => inovasi.inovasiId
         );
         if (inovasiIds.length > 0) {
           // Fetch data dari collection innovations berdasarkan inovasiId
           const innovationsRef = collection(firestore, "innovations");
           const innovationsQuery = query(
             innovationsRef,
             where("__name__", "in", inovasiIds)
           );
           const innovationsSnapshot = await getDocs(innovationsQuery);

           const innovationsData = innovationsSnapshot.docs.map((doc) =>
             doc.data()
           );
           setInnovations(innovationsData);
         }
       }
     };

     fetchVillageAndInnovations();
   }, [id]);

  return (
    <Box>
      <TopBar title="Profil Desa" onBack={() => navigate(-1)} />
      <div style={{ position: "relative", width: "100%" }}>
        <Background src={village?.header} alt="background" />
        <Logo mx={16} my={-40} src={village?.logo} alt="logo" />
      </div>
      <div>
        <ContentContainer>
          <Flex flexDirection="column" alignItems="flex-end" mb={owner ? 0 : 4}>
            {owner && (
              <Button size="xs" onClick={() => navigate("/PengajuanKlaim")}>
                <Icon src={Send} alt="send" />
                Pengajuan Klaim
              </Button>
            )}
          </Flex>

          <Title> {village?.namaDesa} </Title>
          <ActionContainer>
            <Icon src={Location} alt="loc" />
            <Description>{formatLocation(village?.lokasi)}</Description>
          </ActionContainer>
          <div>
            <SubText margin-bottom={16}>Tentang</SubText>
            <Description>{village?.deskripsi}</Description>
          </div>
          <SubText>Kontak Desa</SubText>
          <Flex flexDirection="column" alignItems="flex-start" gap="12px">
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
              <Description>{village?.whatsapp}</Description>
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
              <Description>{village?.website}</Description>
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
              <Description>{village?.instagram}</Description>
            </Flex>
          </Flex>
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
                  {village?.infrastrukturDesa}
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
                  {village?.kesiapanDigital}
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
              <Horizontal>
                {village?.images &&
                  (Object.values(village.images) as string[]).map(
                    (image: string, index: number) => (
                      <EnlargedImage key={index} src={image} />
                    )
                  )}
              </Horizontal>
            </CardContainer>
          </div>
          <div>
            <Flex
              justifyContent="space-between"
              alignItems="flex-end"
              alignSelf="stretch"
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
                    onClick={() =>
                      navigate(
                        generatePath(paths.DETAIL_INNOVATION_PAGE, {
                          id: innovation.id,
                        })
                      )
                    }
                  />
                ))}
              </Horizontal>
            </CardContainer>
          </div>
        </ContentContainer>
      </div>
      <Box>
        {admin ? (
          village?.status === "Terverifikasi" ||
          village?.status === "Ditolak" ? (
            <StatusCard
              status={village?.status}
              message={village?.catatanAdmin}
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
                  toEditVillage();
                 } else {
                   onOpen();
                 }
              }}>
              
              {owner ? "Edit Profile" : " "}
            </Button>
          </NavbarButton>
        )}
        <RejectionModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          onConfirm={handleReject}
          loading={loading}
          setMessage={setModalInput}
          message={modalInput}
        />
        <ActionDrawer
          isOpen={isOpen}
          onClose={onClose}
          onVerify={handleVerify}
          isAdmin={admin}
          role="Desa"
          loading={loading}
          setOpenModal={setOpenModal}
        />
      </Box>
    </Box>
  );
}
