import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../../firebase/clientApp";
import {
  Box,
  Text,
  Image,
  Heading,
  VStack,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Checkbox,
  CheckboxGroup,
  Stack,
} from "@chakra-ui/react";

const DetailKlaim: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [claimData, setClaimData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const renderStatusAlert = () => {
    const status = claimData.status;
    if (status === "Menunggu") {
      return (
        <Alert status="info" borderRadius="md" mb={4}>
          <AlertIcon />
          <AlertDescription>Pengajuan sedang menunggu verifikasi admin.</AlertDescription>
        </Alert>
      );
    }
    if (status === "Terverifikasi") {
      return (
        <Alert status="success" borderRadius="md" mb={4}>
          <AlertIcon />
          <AlertDescription>Pengajuan telah diverifikasi oleh admin.</AlertDescription>
        </Alert>
      );
    }
    if (status === "Ditolak") {
      return (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          <Box>
            <AlertTitle>Pengajuan ditolak oleh admin.</AlertTitle>
            <AlertDescription>
              Catatan: {claimData.catatanAdmin || "Tidak ada catatan"}
            </AlertDescription>
          </Box>
        </Alert>
      );
    }
    return null;
  };

  return (
    <Box p={6}>
      <Button mb={4} onClick={() => navigate(-1)}>Kembali</Button>

      {renderStatusAlert()}

      {/* ✅ Tambahan: Checkbox hasil input */}
      <Box mb={4}>
        <Text fontWeight="bold" mb={2}>Jenis Dokumen Bukti Klaim:</Text>
        <CheckboxGroup value={claimData.jenisDokumen || []}>
          <Stack direction="row">
            <Checkbox value="Foto" isChecked isDisabled>Foto</Checkbox>
            <Checkbox value="Video" isChecked isDisabled>Video</Checkbox>
            <Checkbox value="Dokumen" isChecked isDisabled>Dokumen</Checkbox>
          </Stack>
        </CheckboxGroup>
      </Box>

      <Heading size="md" mb={4}>Detail Klaim Inovasi</Heading>
      <Text><strong>Nama Desa:</strong> {claimData.namaDesa}</Text>
      <Text><strong>Nama Inovasi:</strong> {claimData.namaInovasi}</Text>
      <Text><strong>Status:</strong> {claimData.status}</Text>

      <Box mt={4}>
        <Text fontWeight="bold">Foto:</Text>
        <VStack spacing={3}>
          {claimData.images?.map((url: string, index: number) => (
            <Image key={index} src={url} alt={`Foto ${index + 1}`} width="200px" />
          ))}
        </VStack>
      </Box>

      {claimData.video && (
        <Box mt={4}>
          <Text fontWeight="bold">Video:</Text>
          <video controls width="400px">
            <source src={claimData.video} type="video/mp4" />
            Browser tidak mendukung video tag.
          </video>
        </Box>
      )}

      {claimData.documents && (
        <Box mt={4}>
          <Text fontWeight="bold">Dokumen:</Text>
          <VStack spacing={2} align="start">
            {claimData.documents.map((docUrl: string, index: number) => (
              <a
                key={index}
                href={docUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "blue", textDecoration: "underline" }}
              >
                Dokumen {index + 1}
              </a>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default DetailKlaim;