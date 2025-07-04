import {
  Alert,
  Box,
  Button,
  Select as ChakraSelect,
  Flex,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { NavbarButton } from "../../village/profile/_profileStyle";
import Container from "Components/container";
import FormSection from "Components/form/FormSection";
import TopBar from "Components/topBar";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadString,
} from "firebase/storage";
import React, { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import ReactSelect from "react-select";
import HeaderUpload from "../../../components/form/HeaderUpload";
import LogoUpload from "../../../components/form/LogoUpload";
import { auth, firestore, storage } from "../../../firebase/clientApp";
import ConfModal from "../../../components/confirmModal/confModal";
import SecConfModal from "../../../components/confirmModal/secConfModal";

const categories = [
  "Agribisnis",
  "Akademisi",
  "Dibawah Pemerintah",
  "Layanan Finansial",
  "Lembaga Swadaya Masyarakat (LSM)",
  "Organisasi Pertanian",
  "Pemerintah Daerah",
  "Perusahaan",
  "Start Up",
  "UMKM",
];

const businessModels = [
  "Layanan Berbayar",
  "Layanan Gratis",
  "Layanan Subsidi",
];

const InnovatorForm: React.FC = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const [selectedCategory, setSelectedCategory] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [owner, setOwner] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<string>("");
  const [selectedHeader, setSelectedHeader] = useState<string>("");
  const selectLogoRef = useRef<HTMLInputElement>(null);
  const selectHeaderRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [textInputsValue, setTextInputsValue] = useState({
    name: "",
    description: "",
    instagram: "",
    website: "",
    whatsapp: "",
  });
  const toast = useToast();
  const [isEditable, setIsEditable] = useState(true);
  const [status, setStatus] = useState("");
  const [alertStatus, setAlertStatus] = useState<
    "info" | "warning" | "error" | undefined
  >("warning");
  const [alertMessage, setAlertMessage] = useState(
    "Profil masih kosong. Silahkan isi data di bawah terlebih dahulu"
  );

  const [submitEvent, setSubmitEvent] = useState<React.FormEvent<HTMLFormElement> | null>(null);
  const [isFormLocked, setIsFormLocked] = useState(false);
  const [confirmedSubmit, setConfirmedSubmit] = useState(false);
  const modalBody1 = "Apakah anda yakin ingin mendaftarkan profil?"; // Konten Modal
  const modalBody2 = "Profil sudah didaftarkan. Admin sedang memverifikasi pengajuan daftar profil"; // Konten Modal
  const [isModal1Open, setIsModal1Open] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);
  const closeModal = () => {
    setIsModal1Open(false);
    setIsModal2Open(false);
  };

  const handleModal1Yes = () => {
  setIsModal1Open(false); //tutup modal pertama
  setIsModal2Open(true);
  setConfirmedSubmit(true);
  if (submitEvent) {
    onSubmitForm(submitEvent); // Kirim data form
  }
};

useEffect(() => {
  if (confirmedSubmit) {
    setIsFormLocked(true);        
    setIsModal2Open(true);        
    setConfirmedSubmit(false);    
  }
}, [confirmedSubmit]);


  const isFormValid = () => {
    return (
      selectedCategory !== null &&
      selectedLogo.trim() !== "" &&
      selectedHeader.trim() !== "" &&
      textInputsValue.name.trim() !== "" &&
      textInputsValue.description.trim() !== "" &&
      textInputsValue.whatsapp.trim() !== ""
    );
  };

  const categoryOptions = categories.map((category) => ({
    label: category, // Label yang ditampilkan pada dropdown
    value: category.toLowerCase().replace(/\s+/g, "-"), // Menggunakan format value yang lebih aman
  }));

  const onSelectLogo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    if (event.target.files?.[0]) {
      reader.readAsDataURL(event.target.files[0]);
    }
    reader.onload = (readerEvent) => {
      if (readerEvent.target?.result) {
        setSelectedLogo(readerEvent.target?.result as string);
      }
    };
  };

  const onSelectHeader = (event: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    if (event.target.files?.[0]) {
      reader.readAsDataURL(event.target.files[0]);
    }
    reader.onload = (readerEvent) => {
      if (readerEvent.target?.result) {
        setSelectedHeader(readerEvent.target?.result as string);
      }
    };
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
    } else if (name === "name") {
      if (wordCount <= 10) {
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

  const getNameWordCount = () => {
    return textInputsValue.name
      .split(/\s+/)
      .filter((word) => word !== "").length;
  };

  const getDescriptionWordCount = () => {
    return textInputsValue.description
      .split(/\s+/)
      .filter((word) => word !== "").length;
  };

  const handleCategoryChange = (
    selectedOption: { label: string; value: string } | null
  ) => {
    setSelectedCategory(selectedOption);
  };

  const onSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    // Ensure user and user.uid are defined
    if (!user?.uid) {
      setError("User ID is not defined. Please make sure you are logged in.");
      setLoading(false);
      return;
    }

    try {
      const { name, description, instagram, website, whatsapp } =
        textInputsValue;

      const userId = user.uid;
      const docRef = doc(firestore, "innovators", userId);
      const docSnap = await getDoc(docRef);
      const existingData = docSnap.data();

      if (status === "Ditolak") {
        if (selectedLogo && selectedLogo !== existingData?.logo) {
          if (existingData?.logo) {
            const existingLogoRef = ref(storage, existingData.logo);
            await deleteObject(existingLogoRef);
            console.log("Existing logo deleted");
          }

          const logoRef = ref(storage, `innovators/${userId}/logo`);
          await uploadString(logoRef, selectedLogo, "data_url").then(
            async () => {
              const downloadURL = await getDownloadURL(logoRef);
              await updateDoc(docRef, {
                logo: downloadURL,
              });
              console.log("Logo update at: ", downloadURL);
            }
          );
        }

        if (selectedHeader && selectedHeader !== existingData?.header) {
          if (existingData?.header) {
            const existingHeaderRef = ref(storage, existingData.header);
            await deleteObject(existingHeaderRef);
            console.log("Existing header deleted");
          }

          const headerRef = ref(storage, `innovators/${userId}/header`);
          await uploadString(headerRef, selectedHeader, "data_url").then(
            async () => {
              const downloadURL = await getDownloadURL(headerRef);
              await updateDoc(docRef, {
                header: downloadURL,
              });
              console.log("Header update at: ", downloadURL);
            }
          );
        }

        await updateDoc(docRef, {
          namaInovator: name,
          deskripsi: description,
          kategori: selectedCategory?.label,
          instagram: instagram,
          website: website,
          whatsapp: whatsapp,
          editedAt: serverTimestamp(),
          status: "Menunggu",
        });
        console.log("Document updated with ID: ", userId);
        setStatus("Menunggu");
        setAlertStatus("info");
      } else {
        await setDoc(docRef, {
          namaInovator: name,
          id: userId,
          deskripsi: description,
          kategori: selectedCategory?.label,
          editedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          jumlahInovasi: 0,
          jumlahDesaDampingan: 0,
          instagram,
          website,
          whatsapp,
          catatanAdmin: "",
          status: "Menunggu",
        });
        console.log("Document written with ID: ", userId);
        if (selectedLogo) {
          const logoRef = ref(storage, `innovators/${userId}/logo`);
          await uploadString(logoRef, selectedLogo, "data_url").then(
            async () => {
              const downloadURL = await getDownloadURL(logoRef);
              await updateDoc(doc(firestore, "innovators", userId), {
                logo: downloadURL,
              });
              console.log("Logo upload at", downloadURL);
            }
          );
        } else {
          setError("Logo harus diisi");
          setLoading(false);
          return;
        }

        // Upload header if provided
        if (selectedHeader) {
          const headerRef = ref(storage, `innovators/${userId}/header`);
          await uploadString(headerRef, selectedHeader, "data_url").then(
            async () => {
              const downloadURL = await getDownloadURL(headerRef);
              await updateDoc(doc(firestore, "innovators", userId), {
                header: downloadURL,
              });
              console.log("Header upload at", downloadURL);
            }
          );
        }
        setStatus("Menunggu");
        setAlertStatus("info");
      }
      toast({
        title: "Profile berhasil dibuat",
        status: "success",
        duration: 1000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      console.error("Error adding document: ", error);
      setLoading(false);
      setError("Error adding document");
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menambahkan dokumen.",
        status: "error",
        duration: 1000,
        isClosable: true,
        position: "top",
      });
    }
    setLoading(false);
    setIsEditable(false);
    setAlertStatus("info");
  };

  useEffect(() => {
    const fetchData = async () => {
      const userId = user?.uid;
      if (userId) {
        const docRef = doc(firestore, "innovators", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTextInputsValue({
            name: data.namaInovator || "",
            description: data.deskripsi || "",
            instagram: data.instagram || "",
            website: data.website || "",
            whatsapp: data.whatsapp || "",
          });
          setSelectedCategory({
            label: data.kategori,
            value: data.kategori.toLowerCase().replace(/\s+/g, "-"),
          });
          setSelectedLogo(data?.logo || "");
          setSelectedHeader(data?.header || "");
          setStatus(data.status);

          if (data.status === "Menunggu") {
            setAlertStatus("info");
            setIsEditable(false);
            setStatus("Menunggu");
            setAlertMessage(
              `Profil sudah didaftarkan. Menunggu verifikasi admin.`
            );
          } else if (data.status === "Ditolak") {
            setAlertStatus("error");
            setIsEditable(true);
            setStatus("Ditolak");
            setAlertMessage(
              `Profil ditolak dengan catatan: ${data.catatanAdmin || ""}`
            );
          }
        }
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const checkIfOwner = async () => {
      if (user?.uid) {
        const docRef = doc(firestore, "innovators", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOwner(true);
          setStatus("Terverifikasi"); // Set status for owner
        } else {
          setOwner(false);
        }
      }
    };
    checkIfOwner();
  }, [user]);

  const customStyles = {
    control: (styles: any) => ({
      ...styles,
      fontSize: "14px",
      borderColor: "#none",
      boxShadow: "none",
      ":hover": {
        borderColor: "#3367D1",
      },
    }),
    menu: (base: any) => ({
      ...base,
      marginTop: 0,
      zIndex: 10,
    }),
    option: (base: any, state: { isFocused: any }) => ({
      ...base,
      fontSize: "14px",
      padding: "2px 10px",
      backgroundColor: state.isFocused ? "#E5E7EB" : "white",
      color: "black",
      cursor: "pointer",
      ":active": {
        backgroundColor: "#D1D5DB",
      },
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#9CA3AF",
    }),
  };

  return (
    <>
      <TopBar
        title={owner ? "Edit Profil Inovator" : "Register Inovator"} 
        onBack={() => navigate(-1)} />
      <Box p="16px">
      <form
      id="InnovatorForm"
          onSubmit={(e) => {
            e.preventDefault(); 
            if (isFormValid()) {
              setSubmitEvent(e); // Simpan event
              setIsModal1Open(true); // Tampilkan modal
            }
          }}
        >
          <Flex direction="column" marginTop="50px" marginBottom={16}>
            <Alert
              status={alertStatus}
              fontSize={12}
              borderRadius={4}
              padding="8px"
              mb={4}
            >
              {alertMessage}
            </Alert>
            <Stack spacing="8px" width="100%">
              <FormSection
                title="Nama Inovator"
                name="name"
                placeholder="Nama Inovator"
                value={textInputsValue.name}
                onChange={onTextChange}
                wordCount={getNameWordCount()}
                maxWords={10}
                disabled={!isEditable || isFormLocked}
                isRequired
              />
              <Text fontWeight="400" fontSize="14px" mb="-2">
                Kategori Inovator <span style={{ color: "red" }}>*</span>
              </Text>

              <ReactSelect
                placeholder="Pilih kategori"
                options={categoryOptions}
                value={selectedCategory}
                onChange={handleCategoryChange}
                styles={customStyles}
                isClearable
                isSearchable
                isDisabled={!isEditable || isFormLocked}
              />

              <FormSection
                isTextArea
                title="Deskripsi Inovator"
                name="description"
                placeholder="Deskripsi singkat tentang inovator"
                value={textInputsValue.description}
                onChange={onTextChange}
                wordCount={getDescriptionWordCount()}
                maxWords={80}
                disabled={!isEditable || isFormLocked}
                isRequired
              />

              <Text fontWeight="400" fontSize="14px" mb="-2">
                Logo Inovator <span style={{ color: "red" }}>*</span>
              </Text>
              <Flex direction="column" alignItems="flex-start">
                <Text
                  fontWeight="400"
                  fontStyle="normal"
                  fontSize="10px"
                  color="#9CA3AF"
                  mb="-2"
                >
                  Maks 1 foto, format: png, jpg.
                </Text>
                <LogoUpload
                  selectedLogo={selectedLogo}
                  setSelectedLogo={setSelectedLogo}
                  selectFileRef={selectLogoRef}
                  onSelectLogo={onSelectLogo}
                  disabled={!isEditable || isFormLocked}
                />
              </Flex>
              <Text fontWeight="400" fontSize="14px" mb="-2">
                Header Inovator <span style={{ color: "red" }}>*</span>
              </Text>
              <Flex direction="column" alignItems="flex-start">
                <Text
                  fontWeight="400"
                  fontStyle="normal"
                  fontSize="10px"
                  color="#9CA3AF"
                >
                  Maks 1 foto, format: png, jpg.
                </Text>
                <HeaderUpload
                  selectedHeader={selectedHeader}
                  setSelectedHeader={setSelectedHeader}
                  selectFileRef={selectHeaderRef}
                  onSelectHeader={onSelectHeader}
                  disabled={!isEditable || isFormLocked}
                  
                />
              </Flex>

              <Text fontWeight="700" fontSize="16px">
                Kontak Inovator
              </Text>
              <FormSection
                title="Nomor WhatsApp"
                name="whatsapp"
                placeholder="628123456789"
                type="number"
                value={textInputsValue.whatsapp}
                onChange={onTextChange}
                disabled={!isEditable || isFormLocked}
                isRequired={true}
              />
              <FormSection
                title="Instagram"
                name="instagram"
                placeholder="https://instagram.com/username"
                type="url"
                value={textInputsValue.instagram}
                disabled={!isEditable || isFormLocked}
                onChange={onTextChange}
                isRequired={false}
              />
              <FormSection
                title="Website"
                name="website"
                placeholder="https://website.com"
                type="url"
                value={textInputsValue.website}
                disabled={!isEditable || isFormLocked}
                onChange={onTextChange}
                isRequired={false}
              />
            </Stack>
          </Flex>
        </form >
      </Box>
      {error && (
        <Text color="red" fontSize="10pt" textAlign="center" mt={2}>
          {error}
        </Text>
      )}
      {status !== "Menunggu" && (
        <>
          <NavbarButton>
            <Button
              type="submit"
              form="InnovatorForm"
              width="100%"
              isLoading={loading}
              onClick={() => {
                if (isFormValid()) {
                  setIsModal1Open(true);
                } else {
                  toast({
                    title: "Form belum lengkap!",
                    description: "Harap isi semua field wajib.",
                    status: "error",
                    duration: 3000,
                    position: "top",
                    isClosable: true,
                  });
                }
              }}
            >
              {user?.uid ? (
                // Jika status sudah "Ditolak" dan pengguna adalah owner
                status === "Ditolak" 
                  ? "Kirim Ulang" 
                  : owner
                  ? "Update Inovator" // Jika owner, tombol berubah jadi "Update Inovator"
                  : "Daftarkan Akun" // Jika bukan owner, tetap "Daftarkan Akun"
              ) : (
                "Daftarkan Akun" // Jika tidak ada user yang terautentikasi, tetap "Daftarkan Akun"
              )}
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
        </>
      )}
    </>
  );
};

export default InnovatorForm;
