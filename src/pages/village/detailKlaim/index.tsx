import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import TopBar from "Components/topBar";
import StatusCard from "Components/card/status/StatusCard";
import { useUser } from "src/contexts/UserContext";
import { firestore } from "../../../firebase/clientApp";
import { 
  NavbarButton, 
  Text1 } from "../../village/klaimInovasi/_klaimStyles";
import RejectionModal from "Components/confirmModal/RejectionModal";
import ActionDrawer from "Components/drawer/ActionDrawer";
import DocPreviewList from "../../../components/form/DocPreviewList";
import {
  Box,
  Text,
  Image,
  Flex,
  Button,
  Alert,
  Checkbox,
  CheckboxGroup,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";

const DetailKlaim: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [claimData, setClaimData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [modalInput, setModalInput] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const {
      isOpen: isRecOpen,
      onOpen: onRecOpen,
      onClose: onRecClose,
    } = useDisclosure();

  const { role } = useUser();
    useEffect(() => {
      if (role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }, [role]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const docRef = doc(firestore, "claimInnovations", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setClaimData(docSnap.data());
        } else {
          console.log("Dokumen klaim tidak ditemukan");
        }
      } catch (error) {
        console.error("Error mengambil data klaim:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <Text>Loading...</Text>;
  if (!claimData) return <Text>Klaim tidak ditemukan</Text>;

  const handleVerify = async () => {
    setLoading(true);
    try {
      if (id) {
        const claimRef = doc(firestore, "claimInnovations", id);
        await updateDoc(claimRef, {
          status: "Terverifikasi",
        });

        const inovasiRef = doc(firestore, "innovations", claimData.inovasiId);
        await updateDoc(inovasiRef, {
          desaId: [claimData.desaId],
          jumlahKlaim: increment(1),
        });

        const inovatorRef = doc(firestore, "innovators", claimData.inovatorId);
        await updateDoc(inovatorRef, {
          jumlahDesaDampingan: increment(1),
          desaId: [claimData.desaId],
        });

        const desaRef = doc(firestore, "villages", claimData.desaId);
        await updateDoc(desaRef, {
          inovasiDiTerapkan: increment(1),
          inovasiId: [claimData.inovasiId],
        });
        const docRef = doc(firestore, "claimInnovations", id);
        const updatedDoc = await getDoc(docRef);
        if (updatedDoc.exists()) {
          setClaimData(updatedDoc.data());
        }
      }
      console.log("Claim verified successfully");
    } catch (error) {
      setError("Failed to verify claim");
    } finally {
      setLoading(false);
      onClose();
      // navigate(`/village/pengajuan/${user?.uid}`);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      if (id) {
        const claimRef = doc(firestore, "claimInnovations", id);
        await updateDoc(claimRef, {
          status: "Ditolak",
          catatanAdmin: modalInput,
        });
        const docRef = doc(firestore, "claimInnovations", id);
        const updatedDoc = await getDoc(docRef);
        if (updatedDoc.exists()) {
          setClaimData(updatedDoc.data());
        }
      }
      console.log("Claim rejected successfully");
    } catch (error) {
      setError("Failed to reject claim");
    } finally {
      setLoading(false);
      setOpenModal(false);
      onClose();
    }
  };

  const detectUploadedTypes = () => {
  const uploaded: string[] = [];

    if (claimData.images && claimData.images.length > 0) {
      uploaded.push("Foto");
    }

    if (claimData.video) {
      uploaded.push("Video");
    }

    if (claimData.dokumen && claimData.dokumen.length > 0) {
      uploaded.push("Dokumen");
    }

    return uploaded;
  };

  const uploadedTypes = detectUploadedTypes();

  const renderStatusAlert = () => {
    const status = claimData.status;
    if (status === "Menunggu") {
      return (
        <Alert 
          status="info" 
          mb={4}
          fontSize={12}
          borderRadius={4}
          padding="8px">
          <Text>Pengajuan sedang menunggu verifikasi admin.</Text>
        </Alert>
      );
    }
    if (status === "Terverifikasi") {
      return (
        <Alert 
          status="success" 
          fontSize={12}
          borderRadius={4}
          padding="8px"
          mb={4}>
          <Text>Pengajuan telah diverifikasi oleh admin.</Text>
        </Alert>
      );
    }
    if (status === "Ditolak") {
      return (
        <Alert 
          status="error" 
          fontSize={12}
          borderRadius={4}
          padding="8px"
          mb={4}>
          <Box>
            <Text>Pengajuan ditolak dengan catatan: {claimData.catatanAdmin || "Tidak ada catatan"} </Text>
          </Box>
        </Alert>
      );
    }
    return null;
  };

  return (
    <>
      <TopBar
        title={isAdmin ? "Verifikasi Klaim Inovasi" : "Klaim Inovasi"}
        onBack={() => navigate(-1)}
      />
      <Box p={6} mt={12}>
        {renderStatusAlert()}

        {/*
          <Heading size="md" mb={4}>Detail Klaim Inovasi</Heading>
          <Text><strong>Desa:</strong> {claimData.namaDesa}</Text>
          <Text><strong>Inovasi:</strong> {claimData.namaInovasi}</Text>
        */}

        {/* Tambahan: Checkbox hasil input */}
        <Box mb={4}>
          <Text fontWeight="bold" mb={2}>Jenis Dokumen Bukti Klaim</Text>
          <CheckboxGroup value={uploadedTypes}>
            <Stack direction="row">
              <Checkbox
                value="Foto"
                isChecked={uploadedTypes.includes("Foto")}
                isDisabled={!uploadedTypes.includes("Foto")}
              >
                Foto
              </Checkbox>
              <Checkbox
                value="Video"
                isChecked={uploadedTypes.includes("Video")}
                isDisabled={!uploadedTypes.includes("Video")}
              >
                Video
              </Checkbox>
              <Checkbox
                value="Dokumen"
                isChecked={uploadedTypes.includes("Dokumen")}
                isDisabled={!uploadedTypes.includes("Dokumen")}
              >
                Dokumen
              </Checkbox>
            </Stack>
          </CheckboxGroup>
        </Box>
        
        {claimData.images && (
          <Box mt={4}>
            <Text1>
              Foto Inovasi
              <span style={{ color: "red" }}>*</span>
            </Text1>
            <Flex 
              flexDirection="column"
              gap={2}
              mt={2}>
              {claimData.images?.map((url: string, index: number) => (
                <Image key={index} src={url} alt={`Foto ${index + 1}`} maxWidth="130px" maxHeight="130px" />
              ))}
            </Flex>
          </Box>
        )}

        {claimData.video && (
          <Box mt={4}>
            <Text1>
              Video inovasi
              <span style={{ color: "red" }}>*</span>
            </Text1>
            <video controls width="300px">
              <source src={claimData.video} type="video/mp4" />
              Browser tidak mendukung video tag.
            </video>
          </Box>
        )}

        {claimData.dokumen && (
          <Box mt={4}>
            <Text1>
              Dokumen Pendukung
              <span style={{ color: "red" }}>*</span>
            </Text1>
            <DocPreviewList docs={claimData.dokumen} />
          </Box>
        )}
      </Box>
      <div>
        {isAdmin ? (
          claimData.status === "Terverifikasi" ||
          claimData.status === "Ditolak" ? (
            <StatusCard
              status={claimData.status}
              message={claimData.catatanAdmin}
            />
          ) : (
            <NavbarButton>
              <Button
                width="100%"
                isLoading={loading}
                onClick={onOpen}
                type="button"
                disabled={disabled}
              >
                Verifikasi Permohonan Klaim
              </Button>
            </NavbarButton>
            )
          ) : null
        }
          <RejectionModal
            isOpen={openModal}
            onClose={() => setOpenModal(false)}
            onConfirm={handleReject}
            message={modalInput}
            setMessage={setModalInput}
            loading={loading}
          />
          <ActionDrawer
            isOpen={isOpen}
            onClose={onClose}
            setOpenModal={setOpenModal}
            isAdmin={isAdmin}
            loading={loading}
            onVerify={handleVerify}
            role="admin"
          />
      </div>
    </>
  );
};

export default DetailKlaim;