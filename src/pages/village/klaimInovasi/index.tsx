import { Collapse } from "@chakra-ui/react";
import Button from "Components/button";
import TopBar from "Components/topBar";
import React, { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import ConfModal from "../../../components/confirmModal/confModal";
import SecConfModal from "../../../components/confirmModal/secConfModal";
import ImageUpload from "../../../components/form/ImageUpload";
import { auth, firestore, storage } from "../../../firebase/clientApp";

import { Box, Flex } from "@chakra-ui/react";
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

import { useDisclosure } from "@chakra-ui/react";
import { doc, getDoc, increment, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes, uploadString } from "firebase/storage";
import { useNavigate, useParams } from "react-router-dom";

const KlaimInovasi: React.FC = () => {
  // const navigate = useNavigate();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const { id } = useParams<{ id: string }>();
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string[]>([]);
  const [selectedVid, setSelectedVid] = useState<string>("");
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);
  const selectedFileRef = useRef<HTMLInputElement>(null);
  const selectedVidRef = useRef<HTMLInputElement>(null);
  const selectedDocRef = useRef<HTMLInputElement>(null);
  const { isOpen, onToggle, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const modalBody1 = "Apakah Anda yakin ingin mengajukan klaim?"; // Konten Modal
  const modalBody2 =
    "Inovasi sudah ditambahkan. Admin sedang memverifikasi pengajuan klaim inovasi. Silahkan cek pada halaman pengajuan klaim"; // Konten Modal

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
    setLoading(true);
    if (!user?.uid) {
      setError("User not found");
      setLoading(false);
      return;
    }
    if (!id) {
      throw new Error("Innovation ID is not defined");
      setLoading(false);
      return;
    }
    try {
      const userId = user.uid;
      const docRef = doc(firestore, "claimInnovations", userId);
      const docSnap = await getDoc(docRef);
      const existingData = docSnap.data();

      const desaRef = doc(firestore, "villages", userId);
      const desaSnap = await getDoc(desaRef);
      const dataDesa = desaSnap.data();

      const inovRef = doc(firestore, "innovations", id);
      const inovSnap = await getDoc(inovRef);
      const dataInov = inovSnap.data();

      const inovatorRef = doc(firestore, "innovators", dataInov?.innovatorId);

      await setDoc(docRef, {
        namaDesa: dataDesa?.namaDesa,
        namaInovasi: dataInov?.namaInovasi,
        inovasiId: id,
        inovatorId: dataInov?.innovatorId,
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

       await updateDoc(inovatorRef, {
        jumlahDesaDampingan: increment(1),
        desaDampingan:[{
          namaDesa: dataDesa?.namaDesa,
          desaId: userId,
        }]
      });
      await updateDoc(desaRef,{
        jumlahInovasi: increment(1),
        inovasiDiterapkan:[{
          namaInovasi: dataInov?.namaInovasi,
          inovasiId: id,
        }]
      })
      await updateDoc(inovRef,{
        jumlahDesaKlaim: increment(1),
      })
       setLoading(false);
       
    } catch (error) {
      setError("Failed to submit claim");
    }
  };

  const [isModal1Open, setIsModal1Open] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);
  const closeModal = () => {
    setIsModal1Open(false);
    setIsModal2Open(false);
  };

  const handleModal1Yes = () => {
    setIsModal2Open(true);
    setIsModal1Open(false); // Tutup modal pertama
    // Di sini tidak membuka modal kedua
  };

  useEffect(() => {
    // Jika salah satu modal terbuka, sembunyikan scrollbar
    if (isModal1Open || isModal2Open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = ""; // Kembalikan scrollbar jika kedua modal tertutup
    }
  }, [isModal1Open, isModal2Open]);

  return (
    <Box>
      <form onSubmit={onSubmitForm}>
        <TopBar title="Klaim Inovasi" onBack={() => navigate(-1)} />
        <Container>
          <Flex flexDirection="column" gap="2px">
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

          {/* <Collapse in={selectedCheckboxes.includes("video")} animateOpacity>
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
          </Collapse> */}

          {/* <Collapse in={selectedCheckboxes.includes("dokumen")} animateOpacity>
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
                onSelectDoc={onSelectDoc}
              />
            </Field>
          </Collapse> */}
        </Container>
        <div>
          <NavbarButton>
            <Button size="m" fullWidth onClick={() => setIsModal1Open(true)}>
              Ajukan Klaim
            </Button>
          </NavbarButton>
          <ConfModal
            isOpen={isModal1Open}
            onClose={closeModal}
            modalTitle=""
            modalBody1={modalBody1} // Mengirimkan teks konten modal
            onYes={handleModal1Yes}
          />
          <SecConfModal
            isOpen={isModal2Open}
            onClose={closeModal}
            modalBody2={modalBody2} // Mengirimkan teks konten modal
          />
        </div>
      </form>
    </Box>
  );
};
export default KlaimInovasi;
