import {
  Box,
  Button,
  Collapse,
  Flex,
  Text,
  Textarea,
  Input,
  useDisclosure,
} from "@chakra-ui/react";
import TopBar from "Components/topBar";
import React, { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import ConfModal from "../../../../components/confirmModal/confModal";
import SecConfModal from "../../../../components/confirmModal/secConfModal";
import DocUpload from "../../../../components/form/DocUpload";
import ImageUpload from "../../../../components/form/ImageUpload";
import VidUpload from "../../../../components/form/VideoUpload";
import { auth, firestore, storage } from "../../../../firebase/clientApp";

import {
  CheckboxGroup,
  Container,
  Field,
  JenisKlaim,
  Label,
  NavbarButton,
  Text1,
  Text2,
} from "../_klaimStyles";

import StatusCard from "Components/card/status/StatusCard";
import RejectionModal from "Components/confirmModal/RejectionModal";
import ActionDrawer from "Components/drawer/ActionDrawer";
import Loading from "Components/loading";
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
import { toast } from "react-toastify";
import { useUser } from "src/contexts/UserContext";

const KlaimInovasiManual: React.FC = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const { id } = useParams<{ id: string }>();
  const [claimData, setClaimData] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string[]>([]);
  const [selectedVid, setSelectedVid] = useState<string>("");
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);
  
  // Separate state for innovation info images
  const [logoFiles, setLogoFiles] = useState<string[]>([]);
  const [innovationImages, setInnovationImages] = useState<string[]>([]);
  
  const selectedFileRef = useRef<HTMLInputElement>(null);
  const selectedVidRef = useRef<HTMLInputElement>(null);
  const selectedDocRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const innovationImageRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const modalBody1 = "Apakah Anda yakin ingin mengajukan klaim?";
  const modalBody2 =
    "Inovasi sudah ditambahkan. Admin sedang memverifikasi pengajuan klaim inovasi. Silahkan cek pada halaman pengajuan klaim";
  const [openModal, setOpenModal] = useState(false);
  const [modalInput, setModalInput] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [disabled, setDisabled] = useState(false);
  const [editable, setEditable] = useState(true); // Set to true for manual form
  const {
    isOpen: isRecOpen,
    onOpen: onRecOpen,
    onClose: onRecClose,
  } = useDisclosure();
  const [textInputsValue, setTextInputsValue] = useState({
    inovationName: "",
    inovatorName: "",
    description: "",
  });

  const location = useLocation();
  const inovasiId = location.state?.id;

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
      setSelectedCheckboxes(
        selectedCheckboxes.filter((item) => item !== checkbox)
      );
    } else {
      setSelectedCheckboxes([...selectedCheckboxes, checkbox]);
    }
  };

  // Validation function
  const validateForm = () => {
    // Check text inputs
    if (!textInputsValue.inovationName.trim() || 
        !textInputsValue.inovatorName.trim() || 
        !textInputsValue.description.trim()) {
      toast.error("Mohon lengkapi semua informasi inovasi", {
        position: "top-center",
        autoClose: 2000,
      });
      return false;
    }

    // Check if at least one evidence type is selected
    if (selectedCheckboxes.length === 0) {
      toast.error(
        "Minimal pilih 1 jenis bukti klaim (Foto, Video, atau Dokumen)",
        {
          position: "top-center",
          autoClose: 2000,
        }
      );
      return false;
    }

    // Check if selected evidence types have corresponding files
    if (selectedCheckboxes.includes("foto") && selectedFiles.length === 0) {
      toast.error("Mohon upload foto bukti klaim", {
        position: "top-center",
        autoClose: 2000,
      });
      return false;
    }

    if (selectedCheckboxes.includes("video") && selectedVid === "") {
      toast.error("Mohon upload video bukti klaim", {
        position: "top-center",
        autoClose: 2000,
      });
      return false;
    }

    if (selectedCheckboxes.includes("dokumen") && selectedDoc.length === 0) {
      toast.error("Mohon upload dokumen bukti klaim", {
        position: "top-center",
        autoClose: 2000,
      });
      return false;
    }

    return true;
  };

  const handleAjukanKlaim = () => {
    if (!validateForm()) {
      return;
    }
    setIsModal1Open(true);
  };

  // File upload handlers
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

  const onSelectLogo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        if (readerEvent.target?.result) {
          setLogoFiles([readerEvent.target.result as string]);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const onSelectInnovationImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        if (readerEvent.target?.result) {
          setInnovationImages([readerEvent.target.result as string]);
        }
      };
      reader.readAsDataURL(files[0]);
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
    if (!validateForm()) {
      return;
    }
    setIsModal1Open(true);
  };

  const submitClaim = async () => {
    console.log("Submitting claim...");
    setLoading(true);
    
    if (!user?.uid) {
      setError("User tidak ditemukan");
      setLoading(false);
      toast.error("User tidak ditemukan");
      return;
    }

    try {
      const userId = user.uid;
      
      // Get village data
      const desaRef = doc(firestore, "villages", userId);
      const desaSnap = await getDoc(desaRef);
      const dataDesa = desaSnap.data();

      if (!dataDesa) {
        throw new Error("Data desa tidak ditemukan");
      }

      // Create the claim document with manual innovation data
      const claimDocData = {
        namaDesa: dataDesa?.namaDesa,
        desaId: userId,
        namaInovasi: textInputsValue.inovationName,
        namaInovator: textInputsValue.inovatorName,
        deskripsiInovasi: textInputsValue.description,
        jenisDokumen: selectedCheckboxes,
        inovasiId: null, // This is manual, so no existing innovation ID
        inovatorId: null, // This is manual, so no existing innovator ID
        status: "Menunggu",
        catatanAdmin: "",
        isManual: true, // Flag to identify manual claims
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(firestore, "claimInnovations"), claimDocData);
      console.log("Document written with ID: ", docRef.id);

      // Upload logo if exists
      if (logoFiles.length > 0) {
        const logoRef = ref(storage, `claimInnovations/${userId}/logo/${Date.now()}`);
        const response = await fetch(logoFiles[0]);
        const blob = await response.blob();
        await uploadBytes(logoRef, blob);
        const downloadURL = await getDownloadURL(logoRef);
        
        await updateDoc(docRef, {
          logoInovator: downloadURL,
        });
        console.log("Logo uploaded", downloadURL);
      }

      // Upload innovation images if exists
      if (innovationImages.length > 0) {
        const innovImgRef = ref(storage, `claimInnovations/${userId}/innovationImage/${Date.now()}`);
        const response = await fetch(innovationImages[0]);
        const blob = await response.blob();
        await uploadBytes(innovImgRef, blob);
        const downloadURL = await getDownloadURL(innovImgRef);
        
        await updateDoc(docRef, {
          fotoInovasi: downloadURL,
        });
        console.log("Innovation image uploaded", downloadURL);
      }

      // Upload evidence images
      if (selectedFiles.length > 0) {
        const storageRef = ref(storage, `claimInnovations/${userId}/evidence/images`);
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
        console.log("Evidence images uploaded", imageUrls);
      }

      // Upload evidence video
      if (selectedVid) {
        const videoRef = ref(storage, `claimInnovations/${userId}/evidence/video_${Date.now()}.mp4`);
        const response = await fetch(selectedVid);
        const blob = await response.blob();
        await uploadBytes(videoRef, blob);
        const downloadURL = await getDownloadURL(videoRef);

        await updateDoc(docRef, {
          video: downloadURL,
        });
        console.log("Evidence video uploaded", downloadURL);
      }

      // Upload evidence documents
      if (selectedDoc.length > 0) {
        const storageRef = ref(storage, `claimInnovations/${userId}/evidence/docs`);
        const docUrls: string[] = [];
        
        for (let i = 0; i < selectedDoc.length; i++) {
          const file = selectedDoc[i];
          const docRef = ref(storageRef, `${Date.now()}_${i}`);
          const response = await fetch(file);
          const blob = await response.blob();
          await uploadBytes(docRef, blob);
          const downloadURL = await getDownloadURL(docRef);
          docUrls.push(downloadURL);
        }
        
        await updateDoc(docRef, {
          dokumen: docUrls,
        });
        console.log("Evidence documents uploaded", docUrls);
      }

      toast.success("Klaim inovasi berhasil diajukan", {
        position: "top-center",
        autoClose: 2000,
      });

      // Reset form after successful submission
      setTextInputsValue({
        inovationName: "",
        inovatorName: "",
        description: "",
      });
      setSelectedCheckboxes([]);
      setSelectedFiles([]);
      setSelectedVid("");
      setSelectedDoc([]);
      setLogoFiles([]);
      setInnovationImages([]);

      // Navigate back or to claims list
      setTimeout(() => {
        navigate(`/village/pengajuan/${user?.uid}`);
      }, 2000);

    } catch (error) {
      console.error("Error submitting claim:", error);
      setError("Gagal mengajukan klaim");
      toast.error("Gagal mengajukan klaim. Silakan coba lagi.");
    } finally {
      setLoading(false);
      setIsModal1Open(false);
    }
  };

  const [isModal1Open, setIsModal1Open] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);
  
  const closeModal = () => {
    setIsModal1Open(false);
    setIsModal2Open(false);
  };

  const handleModal1Yes = async () => {
    console.log("Modal 1 Yes clicked");
    await submitClaim();
  };

  const getDescriptionWordCount = () => {
    return textInputsValue.description
      .split(/\s+/)
      .filter((word) => word !== "").length;
  };

  const onTextChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const wordCount = value.split(/\s+/).filter((word) => word !== "").length;
    
    if (name === "description") {
      if (wordCount <= 80) {
        setTextInputsValue((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else if (name === "inovationName") {
      if (wordCount <= 5) {
        setTextInputsValue((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else if (name === "inovatorName") {
      if (wordCount <= 5) {
        setTextInputsValue((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setTextInputsValue((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    if (isModal1Open || isModal2Open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isModal1Open, isModal2Open]);

  // For existing claims (admin view)
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
            setEditable(claimData.status === undefined || claimData.status === "");
            setSelectedCheckboxes(claimData.jenisDokumen || []);
            setSelectedFiles(claimData.images || []);
            setSelectedVid(claimData.video || "");
            setSelectedDoc(claimData.dokumen || []);
            
            // Set text inputs for existing claims
            if (claimData.isManual) {
              setTextInputsValue({
                inovationName: claimData.namaInovasi || "",
                inovatorName: claimData.namaInovator || "",
                description: claimData.deskripsiInovasi || "",
              });
            }
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

  const handleVerify = async () => {
    setLoading(true);
    try {
      if (id) {
        const claimRef = doc(firestore, "claimInnovations", id);
        await updateDoc(claimRef, {
          status: "Terverifikasi",
        });

        // Only update related collections if this is not a manual claim
        if (!claimData.isManual && claimData.inovasiId && claimData.inovatorId) {
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
        }

        const desaRef = doc(firestore, "villages", claimData.desaId);
        await updateDoc(desaRef, {
          inovasiDiTerapkan: increment(1),
          inovasiId: claimData.inovasiId ? [claimData.inovasiId] : [],
        });
      }
      console.log("Claim verified successfully");
      toast.success("Klaim berhasil diverifikasi");
    } catch (error) {
      setError("Failed to verify claim");
      toast.error("Gagal memverifikasi klaim");
    } finally {
      setLoading(false);
      onClose();
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
      toast.success("Klaim berhasil ditolak");
    } catch (error) {
      setError("Failed to reject claim");
      toast.error("Gagal menolak klaim");
    } finally {
      setLoading(false);
      setOpenModal(false);
      onClose();
    }
  };

  if (fetchLoading) {
    return <Loading />;
  }

  return (
    <Box>
      <form onSubmit={onSubmitForm}>
        <TopBar
          title={isAdmin ? "Verifikasi Klaim Inovasi" : "Klaim Penerapan Inovasi"}
          onBack={() => navigate(-1)}
        />
        <Container>
          <Flex flexDirection="column" gap="2px">
            <Label>Informasi Inovasi</Label>
            <Text2>
              Silahkan masukkan informasi inovator dan inovasi yang akan anda
              klaim penerapannya
            </Text2>
          </Flex>
          
          <Text fontWeight="400" fontSize="14px" mb="-2">
            Nama Inovator <span style={{ color: "red" }}>*</span>
          </Text>
          <Input
            name="inovatorName"
            fontSize="14px"
            placeholder="Nama Inovator"
            isDisabled={!editable}
            _placeholder={{ color: "#9CA3AF" }}
            _focus={{
              outline: "none",
              bg: "white",
              border: "none",
            }}
            value={textInputsValue.inovatorName}
            onChange={onTextChange}
            required
          />
          
          <Text fontWeight="400" fontSize="14px" mb="-2">
            Nama Inovasi <span style={{ color: "red" }}>*</span>
          </Text>
          <Input
            name="inovationName"
            fontSize="14px"
            placeholder="Nama Inovasi"
            isDisabled={!editable}
            _placeholder={{ color: "#9CA3AF" }}
            _focus={{
              outline: "none",
              bg: "white",
              border: "none",
            }}
            value={textInputsValue.inovationName}
            onChange={onTextChange}
            required
          />
          
          <Text fontWeight="400" fontSize="14px" mb="-2">
            Deskripsi Inovasi <span style={{ color: "red" }}>*</span>
          </Text>
          <Flex direction="column" alignItems="flex-start">
            <Textarea
              name="description"
              fontSize="14px"
              placeholder="Masukkan deskripsi singkat tentang inovasi"
              disabled={!editable}
              _placeholder={{ color: "#9CA3AF" }}
              _focus={{
                outline: "none",
                bg: "white",
                border: "none",
              }}
              height="100px"
              value={textInputsValue.description}
              onChange={onTextChange}
              required
            />
            <Text
              fontWeight="400"
              fontStyle="normal"
              fontSize="10px"
              color="gray.500"
            >
              {getDescriptionWordCount()}/80 kata
            </Text>
          </Flex>

          <Field>
            <Flex flexDirection="column" gap="2px">
              <Text1>Logo Inovator</Text1>
              <Text2>Maks 1 foto. format: png, jpg</Text2>
              <ImageUpload
                selectedFiles={logoFiles}
                setSelectedFiles={setLogoFiles}
                selectFileRef={logoFileRef}
                onSelectImage={onSelectLogo}
                maxFiles={1}
              />
            </Flex>
          </Field>

          <Field>
            <Flex flexDirection="column" gap="2px">
              <Text1>Foto Inovasi</Text1>
              <Text2>Maks 1 foto. format: png, jpg</Text2>
              <ImageUpload
                selectedFiles={innovationImages}
                setSelectedFiles={setInnovationImages}
                selectFileRef={innovationImageRef}
                onSelectImage={onSelectInnovationImage}
                maxFiles={1}
              />
            </Flex>
          </Field>

          <Flex flexDirection="column" gap="2px">
            <Label>Bukti Klaim</Label>
            <Text2>Silahkan masukkan bukti klaim penerapan inovasi</Text2>
          </Flex>

          <Flex flexDirection="column" gap="2px">
            {isAdmin && claimData && (
              <Text fontWeight="700" mb={2} fontSize="16px">
                Desa {claimData.namaDesa}
              </Text>
            )}
            <Label>
              Jenis Dokumen Bukti Klaim <span style={{ color: "red" }}>*</span>
            </Label>
            <Text2>Dapat lebih dari 1</Text2>
          </Flex>

          <CheckboxGroup>
            <JenisKlaim>
              <input
                style={{
                  transform: "scale(1.3)",
                  marginRight: "8px",
                }}
                type="checkbox"
                onChange={() => handleCheckboxChange("foto")}
                checked={selectedCheckboxes.includes("foto")}
                disabled={!editable}
              />
              Foto
            </JenisKlaim>
            <JenisKlaim>
              <input
                style={{
                  transform: "scale(1.3)",
                  marginRight: "8px",
                }}
                type="checkbox"
                onChange={() => handleCheckboxChange("video")}
                checked={selectedCheckboxes.includes("video")}
                disabled={!editable}
              />
              Video
            </JenisKlaim>
            <JenisKlaim>
              <input
                style={{
                  transform: "scale(1.3)",
                  marginRight: "8px",
                }}
                type="checkbox"
                onChange={() => handleCheckboxChange("dokumen")}
                checked={selectedCheckboxes.includes("dokumen")}
                disabled={!editable}
              />
              Dokumen
            </JenisKlaim>
          </CheckboxGroup>

          <Collapse in={selectedCheckboxes.includes("foto")} animateOpacity>
            <Field>
              <Flex flexDirection="column" gap="2px">
                <Text1>
                  Foto Bukti Klaim
                  <span style={{ color: "red" }}>*</span>
                </Text1>
                <Text2>Maks 2 foto. format: png, jpg</Text2>
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
                  Video Bukti Klaim
                  <span style={{ color: "red" }}>*</span>
                </Text1>
                <Text2>Maks 100 mb. Format: mp4</Text2>
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
                <Text2>Maks 3 file, 50 mb. Format: pdf, doc, docx</Text2>
              </Flex>
              <DocUpload
                selectedDoc={selectedDoc}
                setSelectedDoc={setSelectedDoc}
                selectDocRef={selectedDocRef}
                onSelectDoc={onSelectDoc}
              />
            </Field>
          </Collapse>
        </Container>

        <div>
          {isAdmin ? (
            claimData && (claimData.status === "Terverifikasi" ||
            claimData.status === "Ditolak") ? (
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
          ) : (
            <NavbarButton>
              <Button
                width="100%"
                isLoading={loading}
                onClick={handleAjukanKlaim}
                type="button"
                disabled={disabled || loading}
              >
                Ajukan Klaim
              </Button>
            </NavbarButton>
          )}

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
            modalBody2={modalBody2}
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