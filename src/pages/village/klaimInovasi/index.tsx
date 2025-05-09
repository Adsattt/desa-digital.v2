import {
  Box,
  Button,
  Collapse,
  Flex,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import TopBar from "Components/topBar";
import React, { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import ConfModal from "../../../components/confirmModal/confModal";
import SecConfModal from "../../../components/confirmModal/secConfModal";
import DocUpload from "../../../components/form/DocUpload";
import ImageUpload from "../../../components/form/ImageUpload";
import VidUpload from "../../../components/form/VideoUpload";
import { auth, firestore, storage } from "../../../firebase/clientApp";

import {
  CheckboxGroup,
  Container,
  Field,
  JenisKlaim,
  Label,
  NavbarButton,
  Text1,
  Text2,
} from "./_klaimStyles";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useUser } from "src/contexts/UserContext";
import Loading from "Components/loading";
import StatusCard from "Components/card/status/StatusCard";
import RejectionModal from "Components/confirmModal/RejectionModal";
import ActionDrawer from "Components/drawer/ActionDrawer";
import { toast } from "react-toastify"

const KlaimInovasi: React.FC = () => {
  // const navigate = useNavigate();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const { id } = useParams<{ id: string }>();
  const [claimData, setClaimData] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string[]>([]);
  const [selectedVid, setSelectedVid] = useState<string>("");
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);
  const selectedFileRef = useRef<HTMLInputElement>(null);
  const selectedVidRef = useRef<HTMLInputElement>(null);
  const selectedDocRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const modalBody1 = "Apakah Anda yakin ingin mengajukan klaim?"; // Konten Modal
  const modalBody2 =
    "Inovasi sudah ditambahkan. Admin sedang memverifikasi pengajuan klaim inovasi. Silahkan cek pada halaman pengajuan klaim"; 
  const [openModal, setOpenModal] = useState(false);
  const [modalInput, setModalInput] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const location = useLocation();
  const inovasiId = location.state?.id;
  // console.log("Inovasi ID:", inovasiId);

  const { role } = useUser();
  useEffect(() => {
    if (role === "admin") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [role]);

  const handleCheckboxChange = (checkbox: string) => {
    if (selectedCheckboxes.includes(checkbox)) {
      // Jika checkbox sudah dipilih, hapus dari array
      setSelectedCheckboxes(
        selectedCheckboxes.filter((item) => item !== checkbox)
      );
    } else {
      // Jika checkbox belum dipilih, tambahkan ke array
      setSelectedCheckboxes([...selectedCheckboxes, checkbox]);
    }
  };

  const handleAjukanKlaim = () => {
    if (selectedCheckboxes.length === 0) {
      toast.error(
        "Minimal pilih 1 jenis bukti klaim (Foto, Video, atau Dokumen)",
        {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
      return;
    }

    let isValid = true;
    if (selectedCheckboxes.includes("foto") && selectedFiles.length === 0) {
      isValid = false;
    }
    if (selectedCheckboxes.includes("video") && selectedVid === "") {
      isValid = false;
    }
    if (selectedCheckboxes.includes("dokumen") && selectedDoc.length === 0) {
      isValid = false;
    }

    if (!isValid) {
      toast.error(
        "Mohon lengkapi semua bukti klaim yang dipilih (Foto, Video, atau Dokumen)",
        {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
      return;
    }

    setIsModal1Open(true);
  };

  const onSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imagesArray: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
          if (readerEvent.target?.result) {
            imagesArray.push(readerEvent.target.result as string);
            if (imagesArray.length === files.length) {
              setSelectedFiles((prev) => [...prev, ...imagesArray]);
            }
          }
        };
        reader.readAsDataURL(files[i]);
      }
    }
  };

  const onSelectVid = (event: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    if (event.target.files?.[0]) {
      reader.readAsDataURL(event.target.files[0]);
    }
    reader.onload = (readerEvent) => {
      if (readerEvent.target?.result) {
        setSelectedVid(readerEvent.target?.result as string);
      }
    };
  };

  const onSelectDoc = (event: React.ChangeEvent<HTMLInputElement>) => {
    const doc = event.target.files;
    if (doc) {
      const docArray: string[] = [];
      for (let i = 0; i < doc.length; i++) {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
          if (readerEvent.target?.result) {
            docArray.push(readerEvent.target.result as string);
            if (docArray.length === doc.length) {
              setSelectedDoc((prev) => [...prev, ...docArray]);
            }
          }
        };
        reader.readAsDataURL(doc[i]);
      }
    }
  };

  const onSubmitForm = async (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    submitClaim();
  };

  const submitClaim = async () => {
    setLoading(true);
    if (!user?.uid || !id) {
      setError("User atau ID inovasi tidak ditemukan");
      setLoading(false);
      return;
    }
    if (selectedCheckboxes.length === 0) {
      setError("Minimal pilih 1 jenis bukti klaim (Foto, Video, atau Dokumen)");
      setLoading(false);
      return;
    }
    try {
      const userId = user.uid;
      const desaRef = doc(firestore, "villages", userId);
      const desaSnap = await getDoc(desaRef);
      const dataDesa = desaSnap.data();

      const inovRef = doc(firestore, "innovations", inovasiId);
      const inovSnap = await getDoc(inovRef);
      const dataInov = inovSnap.data();

      const docRef = await addDoc(collection(firestore, "claimInnovations"), {
        namaDesa: dataDesa?.namaDesa,
        desaId: userId,
        namaInovasi: dataInov?.namaInovasi,
        jenisDokumen: selectedCheckboxes,
        inovasiId: inovasiId,
        inovatorId: dataInov?.innovatorId,
        status: "Menunggu",
        catatanAdmin: "",
        checkboxes: selectedCheckboxes,
        createdAt: serverTimestamp(),
        catatanAdmin: "",
        status: "Menunggu",
      });
      console.log("Document written with ID: ", docRef.id);
      if (selectedFiles.length > 0) {
        const storageRef = ref(storage, `claimInnovations/${userId}/images`);
        const imageUrls: string[] = [];

        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const imageRef = ref(storageRef, `${Date.now()}_${i}`);
          const response = await fetch(file);
          const blob = await response.blob();
          await uploadBytes(imageRef, blob);
          const downloadURL = await getDownloadURL(imageRef);
          imageUrls.push(downloadURL);
        }

        await updateDoc(docRef, {
          images: imageUrls,
        });
        console.log("Images uploaded", imageUrls);
      }

      if (selectedVid) {
        const videoRef = ref(storage, `claimInnovations/${userId}/video.mp4`);
        const response = await fetch(selectedVid);
        const blob = await response.blob();
        await uploadBytes(videoRef, blob);
        const downloadURL = await getDownloadURL(videoRef);

        await updateDoc(docRef, {
          video: downloadURL,
        });
        console.log("Video uploaded", downloadURL);
      }
      setIsModal1Open(false);
      toast.success("Klaim inovasi berhasil diajukan", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      setError("Failed to submit claim");
    } finally {
      setLoading(false);
      // setIsModal2Open(true);
      navigate(`/village/pengajuan/${user?.uid}`);
    }
  };  

  const [isModal1Open, setIsModal1Open] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);
  const closeModal = () => {
    setIsModal1Open(false);
    setIsModal2Open(false);
  };

  const handleModal1Yes = async () => {
    await submitClaim();
  };

  useEffect(() => {
    // Jika salah satu modal terbuka, sembunyikan scrollbar
    if (isModal1Open || isModal2Open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = ""; // Kembalikan scrollbar jika kedua modal tertutup
    }
  }, [isModal1Open, isModal2Open]);

  useEffect(() => {
    if (id) {
      const fetchClaim = async () => {
        setFetchLoading(true);
        try {
          const claimRef = doc(firestore, "claimInnovations", id);
          const claimSnap = await getDoc(claimRef);
          if (claimSnap.exists()) {
            const claimData = claimSnap.data();
            console.log("Claim data:", JSON.stringify(claimData, null, 2));
            setClaimData(claimData);
            setSelectedCheckboxes(claimData.jenisDokumen || []);
            setSelectedFiles(claimData.images || []);
            setSelectedVid(claimData.video || "");
            setSelectedDoc(claimData.dokumen || []);
          } else {
            console.log("Claim not found");
          }
        } catch (error) {
          console.error("Error fetching claim:", error);
        } finally {
          setFetchLoading(false);
        }
      };
      fetchClaim();
    }
  }, [id]);

  console.log("Claim Data:", JSON.stringify(claimData, null, 2));

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
      }
      console.log("Claim rejected successfully");
    } catch (error) {
      setError("Failed to reject claim");
      
    } finally {
      setLoading(false);
      setOpenModal(false);
      onClose();
    }
  }


  if (fetchLoading) {
    return <Loading />;
  }

  return (
    <Box>
      <form onSubmit={onSubmitForm}>
        <TopBar
          title={isAdmin ? "Verifikasi Klaim Inovasi" : "Klaim Inovasi"}
          onBack={() => navigate(-1)}
        />
        <Container>
          <Flex flexDirection="column" gap="2px">
            {isAdmin && (
              <Text fontWeight="700" mb={2} fontSize="16px">
                Desa {claimData.namaDesa}
              </Text>
            )}
            <Label>
              Jenis Dokumen Bukti Klaim <span style={{ color: "red" }}>*</span>
            </Label>
            <Text2> Dapat lebih dari 1 </Text2>
          </Flex>
          <CheckboxGroup>
            <JenisKlaim>
              <input
                style={{
                  transform: "scale(1.3)", // Memperbesar checkbox
                  marginRight: "8px", // Memberi jarak ke teks
                }}
                type="checkbox"
                onChange={() => handleCheckboxChange("foto")}
                checked={selectedCheckboxes.includes("foto")}
              />
              Foto
            </JenisKlaim>
            <JenisKlaim>
              <input
                style={{
                  transform: "scale(1.3)", // Memperbesar checkbox
                  marginRight: "8px", // Memberi jarak ke teks
                }}
                type="checkbox"
                onChange={() => handleCheckboxChange("video")}
                checked={selectedCheckboxes.includes("video")}
              />
              Video
            </JenisKlaim>
            <JenisKlaim>
              <input
                style={{
                  transform: "scale(1.3)", // Memperbesar checkbox
                  marginRight: "8px", // Memberi jarak ke teks
                }}
                type="checkbox"
                onChange={() => handleCheckboxChange("dokumen")}
                checked={selectedCheckboxes.includes("dokumen")}
              />
              Dokumen
            </JenisKlaim>
          </CheckboxGroup>

          <Collapse in={selectedCheckboxes.includes("foto")} animateOpacity>
            <Field>
              <Flex flexDirection="column" gap="2px">
                <Text1>
                  Foto Inovasi
                  <span style={{ color: "red" }}>*</span>
                </Text1>
                <Text2> Maks 2 foto. format: png, jpg </Text2>
                <ImageUpload
                  selectedFiles={selectedFiles}
                  setSelectedFiles={setSelectedFiles}
                  selectFileRef={selectedFileRef}
                  onSelectImage={onSelectImage}
                  maxFiles={2}
                />
              </Flex>
            </Field>
          </Collapse>

          <Collapse in={selectedCheckboxes.includes("video")} animateOpacity>
            <Field>
              <Flex flexDirection="column" gap="2px">
                <Text1>
                  Video inovasi
                  <span style={{ color: "red" }}>*</span>
                </Text1>
                <Text2> Maks 100 mb. Format: mp4 </Text2>
              </Flex>
              <VidUpload
                selectedVid={selectedVid}
                setSelectedVid={setSelectedVid}
                selectVidRef={selectedVidRef}
                onSelectVid={onSelectVid}
              />
            </Field>
          </Collapse>

          <Collapse in={selectedCheckboxes.includes("dokumen")} animateOpacity>
            <Field>
              <Flex flexDirection="column" gap="2px">
                <Text1>
                  Dokumen Pendukung
                  <span style={{ color: "red" }}>*</span>
                </Text1>
                <Text2> Maks 3 file, 50 mb. Format: pdf, doc, docx </Text2>
              </Flex>
              <DocUpload
                selectedDoc={selectedDoc}
                setSelectedDoc={setSelectedDoc}
                selectDocRef={selectedDocRef}
                onSelectDoc={onSelectDoc} // Ensure this matches the updated DocUploadProps
              />
            </Field>
          </Collapse>
        </Container>
        <div>
          <NavbarButton>
            {isAdmin ? (
              claimData.status === "Terverifikasi" ||
              claimData.status === "Ditolak" ? (
                <StatusCard
                  status={claimData.status}
                  message={claimData.catatanAdmin}
                />
              ) : (
                <Button
                  width="100%"
                  isLoading={loading}
                  onClick={onOpen}
                  type="button"
                >
                  Verifikasi Permohonan Klaim
                </Button>
              )
            ) : (
              <Button
                width="100%"
                isLoading={loading}
                onClick={handleAjukanKlaim}
                type="button"
              >
                Ajukan Klaim
              </Button>
            )}
          </NavbarButton>
          <ConfModal
            isOpen={isModal1Open}
            onClose={closeModal}
            modalTitle=""
            modalBody1={modalBody1}
            onYes={handleModal1Yes}
            isLoading={loading}
          />
          <SecConfModal
            isOpen={isModal2Open}
            onClose={closeModal}
            modalBody2={modalBody2} // Mengirimkan teks konten modal
          />
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
      </form>
    </Box>
  );
};
export default KlaimInovasi;
