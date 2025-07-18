import {
  Alert,
  Box,
  Button,
  Flex,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { NavbarButton } from "../../village/profile/_profileStyle";
import LocationSelector from "Components/form/LocationSellector";
import MultiSellect from "Components/form/MultiSellect";
import TopBar from "Components/topBar";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc
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
import FormSection from "../../../components/form/FormSection";
import HeaderUpload from "../../../components/form/HeaderUpload";
import ImageUpload from "../../../components/form/ImageUpload";
import LogoUpload from "../../../components/form/LogoUpload";
import { auth, firestore, storage } from "../../../firebase/clientApp";
import {
  getDistricts,
  getProvinces,
  getRegencies,
  getVillages,
} from "../../../services/locationServices";
import ConfModal from "../../../components/confirmModal/confModal";
import SecConfModal from "../../../components/confirmModal/secConfModal";

interface Option {
  value: string;
  label: string;
}

const AddVillage: React.FC = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const [selectedLogo, setSelectedLogo] = useState<string>("");
  const [selectedHeader, setSelectedHeader] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const selectedLogoRef = useRef<HTMLInputElement>(null);
  const selectedHeaderRef = useRef<HTMLInputElement>(null);
  const selectedFileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isEditable, setIsEditable] = useState(true);
  const [isFormLocked, setIsFormLocked] = useState(false);
  const [confirmedSubmit, setConfirmedSubmit] = useState(false);
  const [submitEvent, setSubmitEvent] = useState<React.FormEvent<HTMLFormElement> | null>(null);
  const toast = useToast();
  const [textInputValue, setTextInputValue] = useState({
    name: "",
    description: "",
    geografis: "",
    infrastruktur: "",
    kesiapan: "",
    teknologi: "",
    pelayanan: "",
    sosial: "",
    resource: "",
    whatsapp: "",
    instagram: "",
    website: "",
  });
  const potensiDesa = [
    { value: "pertanian", label: "Pertanian" },
    { value: "perikanan", label: "Perikanan" },
    { value: "peternakan", label: "Peternakan" },
    { value: "pariwisata", label: "Pariwisata" },
    { value: "industri", label: "Industri" },
  ];
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [regencies, setRegencies] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [villages, setVillages] = useState<Option[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<Option | null>(null);
  const [selectedRegency, setSelectedRegency] = useState<Option | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<Option | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<Option | null>(null);
  
   type DropdownValue = {
    kondisijalan: string | null;
    jaringan: string | null;
    listrik: string | null;
    teknologi: string | null;
    kemampuan: string | null;
  };

  const [dropdownValue, setDropdownValue] = useState<DropdownValue>({
    kondisijalan: null,
    jaringan: null,
    listrik: null,
    teknologi: null,
    kemampuan: null,
  });

  const [selectedPotensi, setSelectedPotensi] = useState<
    { value: string; label: string }[]
  >([]);

  const [alertStatus, setAlertStatus] = useState<"info" | "warning" | "error">(
    "warning"
  );
  const [alertMessage, setAlertMessage] = useState(
    "Profil masih kosong. Silahkan isi data di bawah terlebih dahulu."
  );

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
      textInputValue.name.trim() !== "" &&
      selectedProvince !== null &&
      selectedRegency !== null &&
      selectedDistrict !== null &&
      selectedVillage !== null &&
      selectedPotensi !== null &&
      selectedLogo.trim() !== "" &&
      selectedHeader.trim() !== "" &&
      textInputValue.geografis.trim() !== "" &&
      textInputValue.sosial.trim() !== "" &&
      textInputValue.resource.trim() !== "" &&
      textInputValue.whatsapp.trim() !== "" &&
      dropdownValue.kondisijalan !== null &&
      dropdownValue.jaringan !== null &&
      dropdownValue.listrik !== null &&
      dropdownValue.teknologi !== null &&
      dropdownValue.kemampuan !== null 
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  }

   const fetchProvinces = async () => {
     try {
       const provincesData = await getProvinces();
       setProvinces(
         provincesData.map((loc) => ({ value: loc.id, label: loc.name }))
       );
     } catch (error) {
       console.error("Error fetching provinces:", error);
     }
   };

  const fetchRegencies = async (provinceId: string) => {
    try {
      const regenciesData = await getRegencies(provinceId);
      setRegencies(
        regenciesData.map((loc) => ({ value: loc.id, label: loc.name }))
      );
    } catch (error) {
      console.error("Error fetching regencies:", error);
    }
  };

  const fetchDistricts = async (regencyId: string) => {
    try {
      const districtsData = await getDistricts(regencyId);
      setDistricts(
        districtsData.map((loc) => ({ value: loc.id, label: loc.name }))
      );
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const fetchVillages = async (districtId: string) => {
    try {
      const villagesData = await getVillages(districtId);
      setVillages(
        villagesData.map((loc) => ({ value: loc.id, label: loc.name }))
      );
    } catch (error) {
      console.error("Error fetching villages:", error);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  const handleProvinceChange = (selected: Option | null) => {
    setSelectedProvince(selected);
    setSelectedRegency(null);
    setSelectedDistrict(null);
    setSelectedVillage(null);
    setRegencies([]);
    setDistricts([]);
    setVillages([]);
    if (selected) fetchRegencies(selected.value);
  };

  const handleRegencyChange = (selected: Option | null) => {
    setSelectedRegency(selected);
    setSelectedDistrict(null);
    setSelectedVillage(null);
    setDistricts([]);
    setVillages([]);
    if (selected) fetchDistricts(selected.value);
  };

   const handleDistrictChange = (selected: Option | null) => {
     setSelectedDistrict(selected);
     setSelectedVillage(null);
     setVillages([]);
     if (selected) fetchVillages(selected.value);
   };

  const handleVillageChange = (selected: Option | null) => {
    setSelectedVillage(selected);
  };

  
  const onSelectImage = (
    event: React.ChangeEvent<HTMLInputElement>,
    maxFiles: number
  ) => {
    const files = event.target.files;
    if (files) {
      const imagesArray: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
          if (readerEvent.target?.result) {
            imagesArray.push(readerEvent.target.result as string);

            if (imagesArray.length === files.length) {
              setSelectedFiles((prev) => {
                // Cegah lebih dari maxFiles
                if (prev.length + imagesArray.length > maxFiles) {
                  const availableSlots = maxFiles - prev.length;
                  return [...prev, ...imagesArray.slice(0, availableSlots)];
                }
                return [...prev, ...imagesArray];
              });
            }
          }
        };
        reader.readAsDataURL(files[i]);
      }
    }
  };
  const onSelectLogo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedLogo(reader.result as string); // menyimpan data URL ke state
      };
      reader.readAsDataURL(file); // Membaca file sebagai data URL
    }
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
    if (
      textInputValue.name ||
      textInputValue.whatsapp ||
      textInputValue.instagram ||
      textInputValue.website
    ) {
      setTextInputValue((prev) => ({ ...prev, [name]: value }));
    } else if (textInputValue.description) {
      if (wordCount <= 100) {
        setTextInputValue((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      if (wordCount <= 30) {
        setTextInputValue((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  const currentWordCount = (text: string) => {
    return text.split(/\s+/).filter((word) => word !== "").length;
  };

  const onSubmitForm = async (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!user?.uid) {
      setError("User ID is not defined. Please make sure you are logged in.");
      setLoading(false);
      return;
    }

    try {
      const {
        name,
        description,
        geografis,
        infrastruktur,
        kesiapan,
        teknologi,
        pelayanan,
        sosial,
        resource,
        whatsapp,
        instagram,
        website,
      } = textInputValue;

      const {kondisijalan, jaringan, listrik, teknologi: teknologiDropdown, kemampuan} = dropdownValue;

      const userId = user.uid;
      const docRef = doc(firestore, "villages", userId);
      // Cek dan hapus foto lama jika ada yang dihapus
      const docSnap = await getDoc(docRef);
      const existingData = docSnap.data();
      
      if (status === "Ditolak") {
        // Jika logo baru dipilih dan berbeda dengan logo yang ada
        if (selectedLogo && selectedLogo !== existingData?.logo) {
          if (existingData?.logo) {
            // Hapus logo lama dari Firebase Storage
            const logoRef = ref(storage, existingData.logo);
            await deleteObject(logoRef);
            console.log("Logo deleted from storage");
          }

          // Upload logo baru ke Firebase Storage
          const logoRef = ref(storage, `villages/${userId}/logo`);
          await uploadString(logoRef, selectedLogo, "data_url").then(
            async () => {
              const downloadURL = await getDownloadURL(logoRef);
              // Perbarui URL logo di Firestore
              await updateDoc(docRef, {
                logo: downloadURL,
              });
              console.log("Logo updated in Firestore");
            }
          );
        }

        // Jika header baru dipilih dan berbeda dengan header yang ada
        if (selectedHeader && selectedHeader !== existingData?.header) {
          if (existingData?.header) {
            // Hapus header lama dari Firebase Storage
            const headerRef = ref(storage, existingData.header);
            await deleteObject(headerRef);
            console.log("Header deleted from storage");
          }

          // Upload header baru
          const headerRef = ref(storage, `villages/${userId}/header`);
          await uploadString(headerRef, selectedHeader, "data_url").then(
            async () => {
              const downloadURL = await getDownloadURL(headerRef);
              // Update header URL di Firestore
              await updateDoc(docRef, {
                header: downloadURL,
              });
              console.log("Header updated in Firestore");
            }
          );
        }
        const existingImages = existingData?.images || [];
        const imagesToDelete = existingImages.filter(
          (img: string) => !selectedFiles.includes(img)
        );

        // Hapus gambar yang tidak ada dalam selectedFiles
        if (imagesToDelete) {
          for (const image of imagesToDelete) {
            const imageRef = ref(storage, image);
            await deleteObject(imageRef).catch((error) => {
              console.error("Error deleting image:", error);
            });
          }
        }

        // Upload gambar baru yang ada dalam selectedFiles
        const imagesRef = ref(storage, `villages/${userId}/images`);
        const downloadURLs: string[] = [];

        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];

          // Cek apakah file merupakan data URL (base64)
          if (file.startsWith("data:")) {
            // Jika file adalah data URL, upload ke Firebase Storage
            const imageRef = ref(imagesRef, `${i}`);
            await uploadString(imageRef, file, "data_url").then(async () => {
              const downloadURL = await getDownloadURL(imageRef);
              downloadURLs.push(downloadURL); // Tambahkan URL ke array
              console.log("File available at", downloadURL);
            });
          } else {
            // Jika file sudah berupa URL, langsung tambahkan ke array downloadURLs
            downloadURLs.push(file);
            console.log("Existing image URL added:", file);
          }
        }

        // Update images URL di Firestore
        await updateDoc(docRef, {
          images: downloadURLs,
        });

        await updateDoc(docRef, {
          namaDesa: name,
          deskripsi: description,
          potensiDesa: selectedPotensi.map((potensi) => potensi.value),
          geografisDesa: geografis,
          infrastrukturDesa: infrastruktur,
          kesiapanDigital: kesiapan,
          kesiapanTeknologi: teknologi,
          pemantapanPelayanan: pelayanan,
          sosialBudaya: sosial,
          sumberDaya: resource,
          whatsapp: whatsapp,
          instagram: instagram,
          website: website,
          lokasi: {
            provinsi: selectedProvince,
            kabupatenKota: selectedRegency,
            kecamatan: selectedDistrict,
            desaKelurahan: selectedVillage,
          },
          status: "Menunggu", // Set status menjadi "Menunggu" setelah dikirim ulang
          editedAt: serverTimestamp(), // Tandai waktu edit
          kondisijalan: kondisijalan || "",
          jaringan: jaringan || "",
          listrik: listrik || "",
          teknologi: teknologiDropdown || "",
          kemampuan: kemampuan || "",
        });

        console.log("Document updated with ID: ", userId);
        setStatus("Menunggu");
      } else {
        // Jika statusnya bukan "Ditolak", buat dokumen baru seperti biasa
        await setDoc(docRef, {
          namaDesa: name,
          userId: userId,
          deskripsi: description,
          potensiDesa: selectedPotensi.map((potensi) => potensi.value),
          geografisDesa: geografis,
          infrastrukturDesa: infrastruktur,
          kesiapanDigital: kesiapan,
          kesiapanTeknologi: teknologi,
          pemantapanPelayanan: pelayanan,
          sosialBudaya: sosial,
          sumberDaya: resource,
          whatsapp: whatsapp,
          instagram: instagram,
          website: website,
          jumlahInovasiDiterapkan: 0,
          lokasi: {
            provinsi: selectedProvince,
            kabupatenKota: selectedRegency,
            kecamatan: selectedDistrict,
            desaKelurahan: selectedVillage,
          },
          status: "Menunggu", // Status pertama kali dikirim adalah "Menunggu"
          catatanAdmin: "",
          createdAt: serverTimestamp(),
          editedAt: serverTimestamp(),
          kondisijalan: kondisijalan || "",
          jaringan: jaringan || "",
          listrik: listrik || "",
          teknologi: teknologiDropdown || "",
          kemampuan: kemampuan || "",
        });

        if (selectedLogo) {
          const logoRef = ref(storage, `villages/${userId}/logo`);
          await uploadString(logoRef, selectedLogo, "data_url").then(
            async () => {
              const downloadURL = await getDownloadURL(logoRef);
              await updateDoc(doc(firestore, "villages", userId), {
                logo: downloadURL,
              });
              console.log("File available at", downloadURL);
            }
          );
        } else {
          setError("Logo harus diisi");
          setLoading(false);
          return;
        }

        // Upload header if provided
        if (selectedHeader) {
          const headerRef = ref(storage, `villages/${userId}/header`);
          await uploadString(headerRef, selectedHeader, "data_url").then(
            async () => {
              const downloadURL = await getDownloadURL(headerRef);
              await updateDoc(doc(firestore, "villages", userId), {
                header: downloadURL,
              });
              console.log("File available at", downloadURL);
            }
          );
        }
        if (selectedFiles.length > 0) {
          const imagesRef = ref(storage, `villages/${userId}/images`);
          const downloadURLs: string[] = [];

          for (let i = 0; i < selectedFiles.length; i++) {
            const imageRef = ref(imagesRef, `${i}`);
            await uploadString(imageRef, selectedFiles[i], "data_url").then(
              async () => {
                const downloadURL = await getDownloadURL(imageRef);
                downloadURLs.push(downloadURL); // Tambahkan URL ke array
                console.log("File available at", downloadURL);
              }
            );
          }

          // Simpan seluruh array URL ke Firestore
          await updateDoc(doc(firestore, "villages", userId), {
            images: downloadURLs,
          });
        }
        console.log("Document written with ID: ", userId);
        setStatus("Menunggu");
      }

      // TODO: Kirim notifikasi ke user dan admin
      // const notificationRef = collection(firestore, "notifications");
      // await addDoc(notificationRef, {
      //   userId: userId,
      //   message: "Profil desa berhasil didaftarkan",
      //   status: "unread",
      //   createdAt: serverTimestamp(),
      // });

      toast({
        title: "Profile berhasil dibuat",
        status: "success",
        duration: 5000,
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
        duration: 5000,
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
      if (!user) {
        setError("User is not logged in.");
        return;
      }
      const docRef = doc(firestore, "villages", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // Set nilai form dengan data yang diambil dari Firestore
        setTextInputValue({
          name: data.namaDesa || "",
          description: data.deskripsi || "",
          geografis: data.geografisDesa || "",
          infrastruktur: data.infrastrukturDesa || "",
          kesiapan: data.kesiapanDigital || "",
          teknologi: data.kesiapanTeknologi || "",
          pelayanan: data.pemantapanPelayanan || "",
          sosial: data.sosialBudaya || "",
          resource: data.sumberDaya || "",
          whatsapp: data.whatsapp || "",
          instagram: data.instagram || "",
          website: data.website || "",
        });

        setDropdownValue({
          kondisijalan: data.kondisijalan || null,
          jaringan: data.jaringan || null,
          listrik: data.listrik || null,
          teknologi: data.teknologi || null,
          kemampuan: data.kemampuan || null,
        });

        // console.log(data.logo)
        setSelectedPotensi(
          data.potensiDesa.map((potensi: string) => ({
            value: potensi,
            label: potensi.charAt(0).toUpperCase() + potensi.slice(1),
          }))
        );
        
        setSelectedLogo(data.logo);
        setSelectedHeader(data.header);
        setSelectedFiles(Object.values(data.images || {}));

        setSelectedProvince(data.lokasi?.provinsi);
        setSelectedRegency(data.lokasi?.kabupatenKota);
        setSelectedDistrict(data.lokasi?.kecamatan);
        setSelectedVillage(data.lokasi?.desaKelurahan);

        // Tentukan apakah form bisa diedit berdasarkan status
        if (data.status === "Menunggu") {
          setIsEditable(false); // Jika status "pending", form tidak bisa diedit
          setStatus("Menunggu");
          setAlertStatus("info");
          setAlertMessage(
            `Profil sudah didaftakan. Menunggu verifikasi admin.`
          );
        } else if (data.status === "Ditolak") {
          setIsEditable(true); // Jika diverifikasi atau ditolak, form bisa diedit
          setStatus("Ditolak");
          setAlertStatus("error");
          setAlertMessage(
            `Pengajuan ditolak dengan catatan: ${data.catatanAdmin || ""}`
          );
        }
      }
    };

    fetchData();
  }, [user]);

  return (
    <>
      <TopBar title="Registrasi Profil Desa" onBack={() => navigate(-1)} />
      <Box p="48px 16px 20px 16px" mb={16}>
        <form 
           onSubmit={(e) => {
            e.preventDefault(); 
            if (isFormValid()) {
              setSubmitEvent(e); // Simpan event
              setIsModal1Open(true); // Tampilkan modal
            }
          }}
          onKeyDown={handleKeyDown}
          id="VillageForm">
          <Flex direction="column" marginTop="24px">
            <Stack spacing="12px" width="100%">
              <Alert
                status={alertStatus}
                fontSize={12}
                borderRadius={4}
                padding="8px"
              >
                {alertMessage}
              </Alert>

              <FormSection
                title="Nama Desa"
                name="name"
                placeholder="Nama Desa"
                value={textInputValue.name}
                onChange={onTextChange}
                disabled={!isEditable || isFormLocked}
                isRequired
              />
              <LocationSelector
                label="Provinsi"
                placeholder="Pilih Provinsi"
                options={provinces}
                value={selectedProvince}
                onChange={handleProvinceChange}
                isRequired
                disabled={!isEditable || isFormLocked}
              />

              <LocationSelector
                label="Kabupaten/Kota"
                placeholder="Pilih Kabupaten/Kota"
                options={regencies}
                value={selectedRegency}
                onChange={handleRegencyChange}
                isDisabled={!selectedProvince}
                isRequired
                disabled={!isEditable || isFormLocked}
              />
              <LocationSelector
                label="Kecamatan"
                placeholder="Pilih Kecamatan"
                options={districts}
                value={selectedDistrict}
                onChange={handleDistrictChange}
                isDisabled={!selectedRegency}
                isRequired
                disabled={!isEditable || isFormLocked}
              />
              <LocationSelector
                label="Desa/Kelurahan"
                placeholder="Pilih Kelurahan"
                options={villages}
                value={selectedVillage}
                onChange={handleVillageChange}
                isDisabled={!selectedDistrict}
                isRequired
                disabled={!isEditable || isFormLocked}
              />

              <Box>
                <Text fontWeight="400" fontSize="14px">
                  Logo Desa <span style={{ color: "red" }}>*</span>
                </Text>
                <Text fontWeight="400" fontSize="10px" mb="6px" color="#9CA3AF">
                  Maks 1 foto. format: png, jpg.
                </Text>
                <LogoUpload
                  selectedLogo={selectedLogo}
                  setSelectedLogo={setSelectedLogo}
                  selectFileRef={selectedLogoRef}
                  onSelectLogo={onSelectLogo}
                  disabled={!isEditable || isFormLocked}
                />
              </Box>

              <Box>
                <Text fontWeight="400" fontSize="14px">
                  Header Desa <span style={{ color: "red" }}>*</span>
                </Text>
                <Text fontWeight="400" fontSize="10px" mb="6px" color="#9CA3AF">
                  Maks 1 foto. format: png, jpg.
                </Text>
                <HeaderUpload
                  selectedHeader={selectedHeader}
                  setSelectedHeader={setSelectedHeader}
                  selectFileRef={selectedHeaderRef}
                  onSelectHeader={onSelectHeader}
                  disabled={!isEditable || isFormLocked}
                  
                />
              </Box>

              <Box>
                <Text fontWeight="400" fontSize="14px">
                  Foto Inovasi di Desa
                </Text>
                <Text fontWeight="400" fontSize="10px" mb="6px" color="#9CA3AF">
                  Maks 5 foto. format: png, jpg.
                </Text>
                <ImageUpload
                  selectedFiles={selectedFiles}
                  setSelectedFiles={setSelectedFiles}
                  selectFileRef={selectedFileRef}
                  onSelectImage={(e) => onSelectImage(e, 5)}
                  disabled={!isEditable}
                  maxFiles={5}
                />
              </Box>

              <FormSection
                title="Tentang Inovasi di Desa"
                name="description"
                placeholder="Masukkan deskripsi inovasi yang ada di desa"
                value={textInputValue.description}
                onChange={onTextChange}
                disabled={!isEditable}
                isTextArea
                wordCount={currentWordCount(textInputValue.description)}
                maxWords={100}
                isRequired
              />

              <MultiSellect
                label="Potensi Desa"
                placeholder="Pilih Potensi Desa"
                isNoteRequired
                note="Pilih opsi potensi desa atau tambahkan opsi lainnya"
                options={potensiDesa}
                value={selectedPotensi}
                onChange={(selected) => setSelectedPotensi(selected)}
                disabled={!isEditable}
              /> 

              <Box> 
                <Text fontWeight="700" fontSize="16px" mb="6px">
                  Karakteristik Desa
                </Text>
                <FormSection
                  title="Geografis"
                  name="geografis"
                  placeholder="Deskripsi geografis desa"
                  value={textInputValue.geografis}
                  disabled={!isEditable}
                  onChange={onTextChange}
                  wordCount={currentWordCount(textInputValue.geografis)}
                  maxWords={30}
                  isRequired  
                />
              </Box>

              <LocationSelector
                label="Perkembangan Teknologi Digital"
                placeholder="Pilih"
                value={
                  dropdownValue.teknologi
                    ? { value: dropdownValue.teknologi, label: dropdownValue.teknologi }
                    : null
                }
                options={[
                  { value: "Seluruhnya berkembang dengan baik", label: "Seluruhnya berkembang dengan baik" },
                  { value: "Lebih dari 50% sudah dikembangkan", label: "Lebih dari 50% sudah dikembangkan" },
                  { value: "Kurang dari 50% sudah dikembangkan", label: "Kurang dari 50% sudah dikembangkan" },
                  { value: "Baru dimulai", label: "Baru dimulai" },
                  { value: "Belum siap", label: "Belum siap" },
                ]}
                onChange={(selected) => setDropdownValue(prev => ({ ...prev, teknologi: selected?.value ?? null }))}
                disabled={!isEditable}
                isRequired
              />

              <LocationSelector
                label="Kemampuan Teknologi"
                placeholder="Pilih"
                value={
                  dropdownValue.kemampuan
                    ? { value: dropdownValue.kemampuan, label: dropdownValue.kemampuan }
                    : null
                }
                options={[
                  { value: "Kemampuan masyarakat sangat baik", label: "Kemampuan masyarakat sangat baik" },
                  { value: "Kemampuan masyarakat cukup baik", label: "Kemampuan masyarakat cukup baik" },
                  { value: "Hanya beberapa masyarakat yang cukup baik", label: "Hanya beberapa masyarakat yang cukup baik" },
                  { value: "Kemampuan masyarakat terbatas", label: "Kemampuan masyarakat terbatas" },
                  { value: "Masyarakat belum mampu memakai teknologi digital", label: "Masyarakat belum mampu memakai teknologi digital" },
                ]}
                onChange={(selected) => setDropdownValue(prev => ({ ...prev, kemampuan: selected?.value ?? null }))}
                disabled={!isEditable}
                isRequired
              />


              {/* <FormSection
                title="Infrastruktur"
                name="infrastruktur"
                placeholder="Deskripsi infrastruktur desa"
                value={textInputValue.infrastruktur}
                disabled={!isEditable}
                onChange={onTextChange}
                wordCount={currentWordCount(textInputValue.infrastruktur)}
                maxWords={30}
              />

              <FormSection
                title="Kesiapan Digital"
                name="kesiapan"
                placeholder="Deskripsi kesiapan digital desa"
                value={textInputValue.kesiapan}
                disabled={!isEditable}
                onChange={onTextChange}
                wordCount={currentWordCount(textInputValue.kesiapan)}
                maxWords={30}
              />

              <FormSection
                title="Kemampuan Penggunaan Teknologi"
                name="teknologi"
                placeholder="Deskripsi kemampuan digital desa"
                value={textInputValue.teknologi}
                disabled={!isEditable}
                onChange={onTextChange}
                wordCount={currentWordCount(textInputValue.teknologi)}
                maxWords={30}
              />

              <FormSection
                title="Pemantapan Pelayanan"
                name="pelayanan"
                placeholder="Deskripsi pemantapan pelayanan desa"
                value={textInputValue.pelayanan}
                disabled={!isEditable}
                onChange={onTextChange}
                wordCount={currentWordCount(textInputValue.pelayanan)}
                maxWords={30}
              /> */}

              <FormSection
                title="Sosial dan Budaya"
                name="sosial"
                placeholder="Deskripsi sosial dan budaya desa"
                value={textInputValue.sosial}
                disabled={!isEditable}
                onChange={onTextChange}
                wordCount={currentWordCount(textInputValue.sosial)}
                maxWords={30}
                isRequired
              />

              <FormSection
                title="Sumber Daya Alam"
                name="resource"
                placeholder="Deskripsi sumber daya alam desa"
                value={textInputValue.resource}
                disabled={!isEditable}
                onChange={onTextChange}
                wordCount={currentWordCount(textInputValue.resource)}
                maxWords={30}
                isRequired
              />
              
              <Text fontWeight="600" fontSize="16px" mt="px">
                  Infrastruktur 
              </Text>
              <LocationSelector
                label="Kondisi Jalan"
                placeholder="Pilih"
                 value={
                  dropdownValue.kondisijalan
                    ? { value: dropdownValue.kondisijalan, label: dropdownValue.kondisijalan }
                    : null
                }
                options={[
                  { value: "Seluruh jalan beraspal", label: "Seluruh jalan beraspal" },
                  { value: "Lebih dari 50% beraspal", label: "Lebih dari 50% beraspal" },
                  { value: "Kurang dari 50% beraspal", label: "Kurang dari 50% beraspal" },
                  { value: "Beraspal namun rusak", label: "Beraspal namun rusak" },
                  { value: "Masih tanah dan bebatuan", label: "Masih tanah dan bebatuan" },
                ]}
                onChange={(selected) => setDropdownValue(prev => ({...prev ,kondisijalan: selected?.value ?? null}))}
                disabled={!isEditable}
                isRequired
              />

              <LocationSelector
                label="Jaringan Internet"
                placeholder="Pilih"
                value={
                  dropdownValue.jaringan
                    ? { value: dropdownValue.jaringan, label: dropdownValue.jaringan }
                    : null
                }
                options={[
                  { value: "Jaringan Internet baik di seluruh tempat", label: "Jaringan Internet baik di seluruh tempat" },
                  { value: "Jaringan Internet baik di beberapa tempat", label: "Jaringan Internet baik di beberapa tempat" },
                  { value: "Jaringan internet lemah", label: "Jaringan internet lemah" },
                  { value: "Ada sinyal, namun tidak ada jaringan internet", label: "Ada sinyal, namun tidak ada jaringan internet" },
                  { value: "Sinyal lemah, namun ada internet (wifi)", label: "Sinyal lemah, namun ada internet (wifi)" },
                  { value: "Sinyal lemah / tidak ada, dan tidak ada internet", label: "Sinyal lemah / tidak ada, dan tidak ada internet" },
                ]}
                onChange={(selected) => setDropdownValue(prev => ({ ...prev, jaringan: selected?.value ?? null }))}
                disabled={!isEditable}
                isRequired
              />

              <LocationSelector
                label="Ketersediaan Listrik"
                placeholder="Pilih"
                value={
                  dropdownValue.listrik
                    ? { value: dropdownValue.listrik, label: dropdownValue.listrik }
                    : null
                }
                options={[
                  { value: "Listrik tersedia di seluruh tempat", label: "Listrik tersedia di seluruh tempat" },
                  { value: "Listrik tersedia di beberapa tempat", label: "Listrik tersedia di beberapa tempat" },
                  { value: "Listrik 24 jam hanya di beberapa tempat", label: "Listrik 24 jam hanya di beberapa tempat" },
                  { value: "Listrik tersedia, namun waktu terbatas", label: "Listrik tersedia, namun waktu terbatas" },
                  { value: "Listrik tidak tersedia", label: "Listrik tidak tersedia" },
                ]}
                onChange={(selected) => setDropdownValue(prev => ({ ...prev, listrik: selected?.value ?? null }))}
                disabled={!isEditable}
                isRequired
              />

              <FormSection
                title="Lain-lain"
                name="infrastruktur"
                placeholder="Masukkan hal lain terkait infrastruktur"
                value={textInputValue.infrastruktur}
                disabled={!isEditable}
                onChange={onTextChange}
                wordCount={currentWordCount(textInputValue.infrastruktur)}
                maxWords={30}
                isRequired={false}
              />

              <Text fontWeight="700" fontSize="16px">
                Kontak Desa
              </Text>
              <FormSection
                title="Whatsapp"
                name="whatsapp"
                placeholder="628123456789"
                type="number"
                value={textInputValue.whatsapp}
                disabled={!isEditable}
                onChange={onTextChange}
                isRequired
              />

              <FormSection
                title="Link Instagram"
                name="instagram"
                placeholder="https://instagram.com/desa"
                type="url"
                value={textInputValue.instagram}
                disabled={!isEditable}
                onChange={onTextChange}
                isRequired={false}
              />
              <FormSection
                title="Link Website"
                name="website"
                placeholder="https://desa.com"
                type="url"
                value={textInputValue.website}
                disabled={!isEditable}
                onChange={onTextChange}
                isRequired={false}
              />
            </Stack>
          </Flex>
        </form>
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
            form="VillageForm"
            fontSize={14}
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
                  isClosable: true,
                  position: "top",
                });
              }
            }}
          >
            {status === "Ditolak" ? "Kirim Ulang" : "Daftarkan Akun"}
          </Button>
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
        </NavbarButton>
      </>
      )}
    </>
  );
};

export default AddVillage;
