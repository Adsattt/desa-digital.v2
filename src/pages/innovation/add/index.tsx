import { AddIcon, DeleteIcon, MinusIcon } from "@chakra-ui/icons";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { NavbarButton } from "../../village/profile/_profileStyle";
import Container from "Components/container";
import TopBar from "Components/topBar";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
  uploadString,
} from "firebase/storage";
import React, { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import ImageUpload from "../../../components/form/ImageUpload";
import { auth, firestore, storage } from "../../../firebase/clientApp";
import ConfModal from "../../../components/confirmModal/confModal";
import SecConfModal from "../../../components/confirmModal/secConfModal";

type OptionType = {
  value: string;
  label: string;
};

const categoryOptions = [
  { value: "E-Government", label: "E-Government" },
  { value: "E-Tourism", label: "E-Tourism" },
  { value: "Infrastuktur Lokal", label: "Infrastuktur Lokal" },
  { value: "Layanan Keuangan", label: "Layanan Keuangan" },
  { value: "Layanan Sosial", label: "Layanan Sosial" },
  {
    value: "Pemasaran Agri-Food dan E-Commerce",
    label: "Pemasaran Agri-Food dan E-Commerce",
  },
  {
    value: "Pengembangan Masyarakat dan Ekonomi",
    label: "Pengembangan Masyarakat dan Ekonomi",
  },
  { value: "Pengelolaan Sumber Daya", label: "Pengelolaan Sumber Daya" },
  { value: "Pertanian Cerdas", label: "Pertanian Cerdas" },
  { value: "Sistem Informasi", label: "Sistem Informasi" }
];

const predefinedModels = [
  "Gratis",
  "Layanan Berbayar",
  "Subsidi Parsial",
  "Pusat Multi-Layanan",
  "Koperasi",
  "Model Kemitraan",
  "Menciptakan Pasar",
  "Pengumpulan Data",
  "Pelatihan/Pendidikan",
  "Perusahaan Sosial",
  "Lain-lain",
];

const AddInnovation: React.FC = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const selectFileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [textInputsValue, setTextInputsValue] = useState({
    name: "",
    year: "",
    description: "",
    otherBusinessModel: "",
    villages: "",
    priceMin: "",
    priceMax: "",
    //customTargetUser: "",
  });
  const [category, setCategory] = useState("");
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState("");
  const [selectedModels, setSelectedModels] = useState<(string | number)[]>([]);
  const [otherBusinessModel, setOtherBusinessModel] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<OptionType | null>(
    null
  );
  const [benefit, setBenefit] = useState([{ benefit: "", description: "" }]);
  const [alertStatus, setAlertStatus] = useState<"info" | "warning" | "error">(
    "warning"
  );
  const [alertMessage, setAlertMessage] = useState(
    "Profil masih kosong. Silahkan isi data di bawah terlebih dahulu."
  );
  const [selectedStatus, setSelectedStatus] = useState("Masih diproduksi");
  const [status, setStatus] = useState("");
  const [isEditable, setIsEditable] = useState(true);
  const toast = useToast();
  const [innovationId, setInnovationId] = useState("");
  const modalBody1 = "Apakah anda yakin ingin menambah inovasi?"; // Konten Modal
  const modalBody2 =
    "Inovasi sudah ditambahkan. Admin sedang memverifikasi pengajuan tambah inovasi"; // Konten Modal
  
  const [isFormLocked, setIsFormLocked] = useState(false);
  const [confirmedSubmit, setConfirmedSubmit] = useState(false);
  const [submitEvent, setSubmitEvent] = useState<React.FormEvent<HTMLFormElement> | null>(null);
  const [isModal1Open, setIsModal1Open] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);
  const closeModal = () => {
    setIsModal1Open(false);
    setIsModal2Open(false);
  };

  const handleModal1Yes = () => {
    setIsModal2Open(true);
    setIsModal1Open(false); // Tutup modal pertama
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

  const onSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imagesArray: string[] = [];
      if (selectedFiles.length + files.length > 5) {
        alert("Maksimal 5 foto yang bisa diunggah.");
        return; // Batalkan proses jika melebihi batas
      }

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

  const onTextChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const wordCount = value.split(/\s+/).filter((word) => word !== "").length;
    if (name === "priceMin" || name === "priceMax") {
      // Validasi hanya angka
      if (/^\d*$/.test(value)) {
        setTextInputsValue((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else if (name === "description") {
      if (wordCount <= 80) {
        setTextInputsValue((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else if (name === "villages") {
      if (wordCount <= 20) {
        setTextInputsValue((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else if (name === "otherBusinessModel") {
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

  const getDescriptionWordCount = () => {
    return textInputsValue.description
      .split(/\s+/)
      .filter((word) => word !== "").length;
  };

  const getVillagesWordCount = () => {
    return textInputsValue.villages
    .toString()
    .split(/\s+/)
    .filter((word) => word !== "").length;
  };

  const onAddRequirement = () => {
    const wordCount = newRequirement
      .split(/\s+/)
      .filter((word) => word !== "").length;
    if (newRequirement.trim() !== "" && wordCount <= 5) {
      setRequirements((prev) => [...prev, newRequirement]);
      setNewRequirement("");
    }
  };

  const uploadFiles = async (
    files: string[],
    innovationId: string
  ): Promise<string[]> => {
    const promises: Promise<string>[] = [];
    files.forEach((file, index) => {
      const fileName = `image_${Date.now()}_${index}`;
      const storageRef = ref(
        storage,
        `innovations/${innovationId}/images/${fileName}`
      );

      // Convert base64 to Blob
      const byteString = atob(file.split(",")[1]);
      const mimeString = file.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });

      const uploadTask = uploadBytesResumable(storageRef, blob);
      const promise = new Promise<string>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const prog = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            console.log(prog);
          },
          (error) => {
            console.log(error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("File available at", downloadURL);
            resolve(downloadURL);
          }
        );
      });
      promises.push(promise);
    });
    return Promise.all(promises);
  };

  const onSubmitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const { name, year, description, villages, priceMax, priceMin } =
      textInputsValue;

    const modelBisnis = selectedModels.filter((model) => model !== "Lain-lain");
    if (
      selectedModels.includes("Lain-lain") &&
      otherBusinessModel.trim() !== ""
    ) {
      modelBisnis.push(otherBusinessModel);
    }

    if (!isFormValid) {
      setLoading(false);
      return;
    }

    if (selectedModels.length === 0) {
      setError("Pilih setidaknya satu model bisnis digital.");
      return;
    }
    if (!user?.uid) {
      setError("User ID is not defined. Please make sure you are logged in.");
      setLoading(false);
      return;
    }

    // Fetch innovator data
    const userId = user.uid;
    const innovatorDocRef = doc(firestore, "innovators", userId);
    const innovatorDocSnap = await getDoc(innovatorDocRef);

    if (!innovatorDocSnap.exists()) {
      console.error("Innovator document not found");
      setError("Gagal menambahkan inovasi");
      setLoading(false);
      toast({
        title: "Innovator document not found",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    const innovatorData = innovatorDocSnap.data();

    const finalRequirements = [...requirements];
    if (
      newRequirement.trim() !== "" &&
      !finalRequirements.includes(newRequirement.trim())
    ) {
      finalRequirements.push(newRequirement.trim());
    }

    try {
      if (status === "Ditolak") {
        const docRef = doc(firestore, "innovations", innovationId);
        const docSnap = await getDoc(docRef);
        const existingData = docSnap.data();
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
        const imagesRef = ref(storage, `innovations/${innovationId}/images`);
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
              console.log("Updated new img: ", downloadURL);
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
          statusInovasi: selectedStatus,
          namaInovasi: name,
          kategori: selectedCategory?.label,
          //targetPengguna: finalTargetUser,
          tahunDibuat: year,
          modelBisnis: selectedModels,
          deskripsi: description,
          hargaMinimal: priceMin,
          hargaMaksimal: priceMax,
          manfaat: benefit.map((item) => ({
            judul: item.benefit,
            deskripsi: item.description,
          })),
          infrastruktur: finalRequirements,
          editedAt: serverTimestamp(),
          status: "Menunggu",
        });
        setStatus("Menunggu");
        setAlertStatus("info");
      } else {
        const innovationDocRef = await addDoc(
          collection(firestore, "innovations"),
          {
            statusInovasi: selectedStatus,
            namaInovasi: name,
            kategori: selectedCategory?.label,
            //targetPengguna: finalTargetUser,
            tahunDibuat: year,
            inputDesaMenerapkan: villages,
            deskripsi: description,
            hargaMinimal: priceMin,
            hargaMaksimal: priceMax,
            manfaat: benefit.map((item) => ({
              judul: item.benefit,
              deskripsi: item.description,
            })),
            infrastruktur: finalRequirements,
            modelBisnis: modelBisnis,
            createdAt: serverTimestamp(),
            editedAt: serverTimestamp(),
            status: "Menunggu",
            catatanAdmin: null,
            innovatorId: user.uid,
            namaInnovator: innovatorData.namaInovator,
            innovatorImgURL: innovatorData?.logo || null,
          }
        );

        setInnovationId(innovationDocRef.id);
        console.log("ID inovasi: ", innovationDocRef.id);

        if (selectedFiles.length > 0) {
          const imageUrls = await uploadFiles(selectedFiles, innovationId);
          await updateDoc(innovationDocRef, {
            images: imageUrls,
          });
          console.log("Images uploaded", imageUrls);
        }
      }

      toast({
        title:
          "Pengajuan sedang diverifikasi admin. Pengajuan ini akan disimpan pada halaman Pengajuan inovasi.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      console.log("error", error);
      setError("Gagal menambahkan inovasi");
      setLoading(false);
      toast({
        title: "Gagal menambahkan inovasi",
        status: "error",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
    }
    setIsEditable(false);
    setLoading(false);
    setAlertStatus("info");
  };

  // useEffect(() => {
  //   const checkExistingInnovation = async () => {
  //     if (!user?.uid) return;

  //     // Query untuk mengecek apakah pengguna sudah mengajukan inovasi sebelumnya
  //     const innovationsQuery = query(
  //       collection(firestore, "innovations"),
  //       where("innovatorId", "==", user.uid),
  //       where("status", "in", ["Menunggu", "Ditolak"])
  //     );

  //     const querySnapshot = await getDocs(innovationsQuery);
  //     if (!querySnapshot.empty) {
  //       // Jika sudah ada inovasi, set ID inovasi dan statusnya
  //       const existingDoc = querySnapshot.docs[0].data();
  //       setInnovationId(querySnapshot.docs[0].id); // Menyimpan ID inovasi
  //       setStatus(existingDoc.status); // Menyimpan status inovasi
  //       console.log("Data Inovasi: ", existingDoc);
  //     } else {
  //       setInnovationId(""); // Tidak ada inovasi, reset ID
  //     }
  //   };

  //   checkExistingInnovation();
  // }, [user?.uid]);

  useEffect(() => {
    if (!innovationId) return;

    const fetchInnovationData = async () => {
      const docRef = doc(firestore, "innovations", innovationId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTextInputsValue({
          name: data.namaInovasi || "",
          year: data.tahunDibuat || "",
          description: data.deskripsi || "",
          villages: data.inputDesaMenerapkan || "",
          priceMin: data.hargaMinimal || "",
          priceMax: data.hargaMaksimal || "",
          otherBusinessModel: data.otherBusinessModel || "",
          //customTargetUser: data.customTargetUser || "",
        });
        setSelectedStatus(data.statusInovasi || "");
        setSelectedCategory({
          value: data.kategori || "",
          label: data.kategori || "",
        });
        const otherModel = data.modelBisnis?.find(
          (model: string) => !predefinedModels.includes(model)
        );

        if (otherModel) {
          setOtherBusinessModel(otherModel);
          setSelectedModels([
            ...data.modelBisnis.filter((model: string) => model !== otherModel),
            "Lain-lain",
          ]);
        } else {
          setSelectedModels(data.modelBisnis || []);
        }
        const mappedManfaat =
          data.manfaat?.map((item: { judul: string; deskripsi: string }) => ({
            benefit: item.judul || "", // Mapping 'judul' ke 'benefit'
            description: item.deskripsi || "", // Mapping 'deskripsi' ke 'description'
          })) || [];

        setBenefit(mappedManfaat);
        // const mappedInfrastuktur
        setRequirements(data.infrastruktur || []);
        setSelectedFiles(data.images || []);

        if (data.status === "Menunggu") {
          setIsEditable(false); // Jika status "pending", form tidak bisa diedit
          setStatus("Menunggu");
          setAlertStatus("info");
          setAlertMessage(
            `Inovasi sudah didaftakan. Menunggu verifikasi admin.`
          );
        } else if (data.status === "Ditolak") {
          setIsEditable(true); // Jika diverifikasi atau ditolak, form bisa diedit
          setStatus("Ditolak");
          setAlertStatus("error");
          setAlertMessage(
            `Pengajuan ditolak dengan catatan: ${data.catatanAdmin || ""}`
          );
        } else if (data.status === "Terverifikasi") {
          // Update jumlahInovasi in innovators collection
          const innovatorDocRef = doc(
            firestore,
            "innovators",
            user?.uid as string
          );
          await updateDoc(innovatorDocRef, {
            jumlahInovasi: increment(1),
          });
        }
      }
    };
    fetchInnovationData();
  }, [innovationId]);

  const splitModels = (models: string[], num: number) => {
    const midpoint = Math.ceil(models.length / num);
    return [models.slice(0, midpoint), models.slice(midpoint)];
  };

  const isFormValid = () => {
    return (
      // selectedStatus !== "" &&
      // textInputsValue.name.trim() !== "" &&
      // category.trim() !== "" &&
      // textInputsValue.year.trim() !== "" &&
      // textInputsValue.description.trim() !== "" &&
      // selectedModels.length > 0 && // array harus ada isinya
      // textInputsValue.villages.trim() !== "" &&
      // selectedFiles.length > 0 && // cek foto inovasi
      // benefit.length > 0
      true
    );
  };
  
  // Bagi daftar model bisnis menjadi dua kolom
  const [firstColumn, secondColumn] = splitModels(predefinedModels, 2);

  const options = [
    { value: "1", label: "Masih diproduksi" },
    { value: "2", label: "Tidak diproduksi" },
  ];

  const customStyles = {
    control: (base: any) => ({
      ...base,
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
      <TopBar title="Tambahkan Inovasi" onBack={() => navigate(-1)} />
      <Box p="48px 16px 20px 16px">
        <form onSubmit={(e) => {
            e.preventDefault(); 
            if (isFormValid()) {
              setSubmitEvent(e); // Simpan event
              setIsModal1Open(true); // Tampilkan modal
            }
          }} 
          id="innovationForm">
          <Flex direction="column" marginTop="24px">
            <Stack spacing={3} width="100%">
              <Alert
                status={alertStatus}
                fontSize={12}
                borderRadius={4}
                padding="8px"
              >
                {alertMessage}
              </Alert>
              <Text fontWeight="400" fontSize="14px" mb="-2">
                Status Inovasi <span style={{ color: "red" }}>*</span>
              </Text>
              <RadioGroup
                defaultValue="Masih diproduksi"
                name="status"
                onChange={(value) => setSelectedStatus(value)}
                isDisabled={!isEditable || isFormLocked}
              >
                <HStack spacing={4}>
                  {options.map((option) => (
                    <Radio
                      key={option.value}
                      value={option.label}
                      size="md"
                      colorScheme="green"
                      sx={{
                        "& .chakra-radio__control": {
                          borderColor: "#9CA3AF !important", // Warna border
                          borderWidth: "1px !important", // Ketebalan garis
                        },
                      }}
                    >
                      <Text fontSize="14px">{option.label}</Text>
                    </Radio>
                  ))}
                </HStack>
              </RadioGroup>

              <Text fontWeight="400" fontSize="14px" mb="-2">
                Nama Inovasi <span style={{ color: "red" }}>*</span>
              </Text>
              <Input
                name="name"
                fontSize="14px"
                placeholder="Nama Inovasi"
                disabled={!isEditable || isFormLocked}
                _placeholder={{ color: "#9CA3AF" }}
                _focus={{
                  outline: "none",
                  bg: "white",
                  border: "none",
                }}
                value={textInputsValue.name}
                onChange={onTextChange}
                isRequired
              />

              <Text fontWeight="400" fontSize="14px" mb="-2">
                Kategori Inovasi <span style={{ color: "red" }}>*</span>
              </Text>
              <Select
                placeholder="Pilih kategori"
                options={categoryOptions}
                value={selectedCategory}
                isDisabled={!isEditable || isFormLocked}
                onChange={(selectedOption) =>
                  setSelectedCategory(selectedOption)
                }
                styles={customStyles} // Terapkan gaya khusus
                isClearable
              />

              <Text fontWeight="400" fontSize="14px" mb="-2">
                Tahun dibuat inovasi <span style={{ color: "red" }}>*</span>
              </Text>
              <Input
                name="year"
                fontSize="14px"
                placeholder="Ketik tahun"
                disabled={!isEditable || isFormLocked}
                _placeholder={{ color: "#9CA3AF" }}
                _focus={{
                  outline: "none",
                  bg: "white",
                  border: "none",
                }}
                value={textInputsValue.year}
                onChange={onTextChange}
                isRequired
              />

              <Text fontWeight="400" fontSize="14px" mb="-2">
                Deskripsi <span style={{ color: "red" }}>*</span>
              </Text>
              <Flex direction="column" alignItems="flex-start">
                <Textarea
                  name="description"
                  fontSize="14px"
                  placeholder="Masukkan deskripsi singkat tentang inovasi"
                  disabled={!isEditable || isFormLocked}
                  _placeholder={{ color: "#9CA3AF" }}
                  _focus={{
                    outline: "none",
                    bg: "white",
                    border: "none",
                  }}
                  height="100px"
                  value={textInputsValue.description}
                  onChange={onTextChange}
                  isRequired
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

              <Stack spacing={1}>
                <div>
                  <Text fontWeight="400" fontSize="14px">
                    Model Bisnis Digital <span style={{ color: "red" }}>*</span>
                  </Text>
                  <Text fontWeight="400" fontSize="10px" color="#9CA3AF">
                    Dapat lebih dari 1
                  </Text>
                </div>
                <div>
                  <CheckboxGroup
                    colorScheme="green"
                    value={selectedModels}
                    onChange={setSelectedModels}
                    isDisabled={!isEditable || isFormLocked}
                  >
                    <Flex gap={4}>
                      {[firstColumn, secondColumn].map((column, colIndex) => (
                        <Flex key={colIndex} direction="column" gap={1}>
                          {column.map((model, index) => (
                            <Checkbox
                              key={index}
                              value={model}
                              sx={{
                                "& .chakra-checkbox__control": {
                                  borderColor: "#9CA3AF",
                                  borderWidth: "1px",
                                },
                                ".chakra-checkbox__label": {
                                  fontSize: "12px",
                                  fontStyle: "normal",
                                },
                              }}
                            >
                              {model}
                            </Checkbox>
                          ))}
                        </Flex>
                      ))}
                    </Flex>
                  </CheckboxGroup>
                </div>

                {selectedModels.includes("Lain-lain") && (
                  <Flex direction="column" alignItems="flex-start">
                    <Input
                      name="otherBusinessModel"
                      placeholder="Silahkan tulis model bisnis lainnya"
                      value={otherBusinessModel}
                      disabled={!isEditable || isFormLocked}
                      onChange={(e) => {
                        const wordCount = e.target.value
                          .split(/\s+/)
                          .filter((word) => word !== "").length;
                        if (wordCount <= 5) {
                          setOtherBusinessModel(e.target.value);
                        }
                      }}
                      fontSize="14px"
                      fontStyle="normal"
                      mt={-2}
                      _placeholder={{ color: "#9CA3AF" }}
                      _focus={{ outline: "none", boxShadow: "0 0px 0 0 blue" }}
                      border="none"
                      borderBottom="1px solid #9CA3AF"
                      borderRadius="0"
                    />
                    <Text fontWeight="400" fontSize="10px" color="#9CA3AF">
                      {
                        otherBusinessModel
                          .split(/\s+/)
                          .filter((word) => word !== "").length
                      }
                      /5 kata
                    </Text>
                  </Flex>
                )}
              </Stack>

              <Text fontWeight="400" fontSize="14px" mb="-2">
                Desa yang menerapkan <span style={{ color: "red" }}>*</span>
              </Text>
              <Flex direction="column" alignItems="flex-start">
                <Text
                  fontWeight="400"
                  fontStyle="normal"
                  fontSize="10px"
                  color="#9CA3AF"
                >
                  Contoh: Desa A, Desa B, Desa C, dan 50 desa lainnya
                </Text>
                <Textarea
                  name="villages"
                  fontSize="14px"
                  placeholder="Masukkan beberapa desa yang menerapkan"
                  _placeholder={{ color: "#9CA3AF" }}
                  _focus={{
                    outline: "none",
                    bg: "white",
                    border: "none",
                  }}
                  height="100px"
                  value={textInputsValue.villages}
                  disabled={!isEditable || isFormLocked}
                  onChange={onTextChange}
                  isRequired
                />
                <Text
                  fontWeight="400"
                  fontStyle="normal"
                  fontSize="10px"
                  color="gray.500"
                >
                  {getVillagesWordCount()}/20 kata
                </Text>
              </Flex>

              <Text fontWeight="400" fontSize="14px" mb="-2">
                Kisaran harga
              </Text>
              <Flex direction="column" alignItems="flex-start">
                <Text
                  fontWeight="400"
                  fontStyle="normal"
                  fontSize="10px"
                  color="#9CA3AF"
                >
                  Contoh: Rp.1.000.000 - Rp. 2.000.000
                </Text>
                <Flex direction="row" justifyContent="center">
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents="none"
                      color="gray.300"
                      fontSize="12px"
                    >
                      Rp.
                    </InputLeftElement>
                    <Input
                      name="priceMin"
                      fontSize="12px"
                      placeholder="Harga minimal"
                      _placeholder={{ color: "#9CA3AF" }}
                      _focus={{
                        outline: "none",
                        bg: "white",
                        border: "none",
                      }}
                      value={textInputsValue.priceMin}
                      onChange={onTextChange}
                      disabled={!isEditable || isFormLocked}
                    />
                  </InputGroup>
                  <MinusIcon mx="2" color="#9CA3AF" mt="3" />
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents="none"
                      color="gray.300"
                      fontSize="12px"
                    >
                      Rp.
                    </InputLeftElement>
                    <Input
                      name="priceMax"
                      fontSize="12px"
                      placeholder="Harga maksimal"
                      _placeholder={{ color: "#9CA3AF" }}
                      _focus={{
                        outline: "none",
                        bg: "white",
                        border: "none",
                      }}
                      value={textInputsValue.priceMax}
                      onChange={onTextChange}
                      disabled={!isEditable || isFormLocked}
                    />
                  </InputGroup>
                </Flex>
              </Flex>

              <Text fontWeight="400" fontSize="14px" mb="-2">
                Foto inovasi <span style={{ color: "red" }}>*</span>
              </Text>
              <Flex direction="column" alignItems="flex-start">
                <Text
                  fontWeight="400"
                  fontStyle="normal"
                  fontSize="10px"
                  color="#9CA3AF"
                  mb="0"
                >
                  Maks 5 foto, format: png, jpg.
                </Text>
                <ImageUpload
                  selectedFiles={selectedFiles}
                  setSelectedFiles={setSelectedFiles}
                  selectFileRef={selectFileRef}
                  onSelectImage={onSelectImage}
                  maxFiles={5}
                  disabled={!isEditable || isFormLocked}
                />
              </Flex>

              <Text fontWeight="700" fontSize="16px" mb="-2" mt="2">
                Manfaat Inovasi{" "}
                <span
                  style={{ color: "red", fontSize: "14px", fontWeight: "400" }}
                >
                  *
                </span>
              </Text>

              {/* Map untuk manfaat */}
              {benefit.map((item, index) => (
                <Flex key={index} direction="column" mb={2}>
                  <Text fontWeight="400" fontSize="14px">
                    Manfaat {index + 1} <span style={{ color: "red" }}>*</span>
                  </Text>
                  <Flex alignItems="center" position="relative" gap={2} mt={1}>
                    <Input
                      fontSize="14px"
                      placeholder="Masukkan manfaat singkat inovasi"
                      _placeholder={{ color: "#9CA3AF" }}
                      _focus={{ outline: "none", bg: "white", border: "none" }}
                      value={item.benefit}
                      disabled={!isEditable || isFormLocked}
                      //isRequired
                      onChange={(e) => {
                        const wordCount = e.target.value
                          .split(/\s+/)
                          .filter((word) => word !== "").length;
                        if (wordCount <= 5) {
                          const updatedBenefits = [...benefit];
                          updatedBenefits[index].benefit = e.target.value;
                          setBenefit(updatedBenefits);
                        }
                      }}
                    />
                    {benefit.length > 1 && (
                      <Button
                        variant="none"
                        disabled={!isEditable || isFormLocked}
                        onClick={() => {
                          setBenefit((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        <DeleteIcon color="red.500" />
                      </Button>
                    )}
                  </Flex>
                  <Text
                    position="relative"
                    fontSize="10px"
                    color="#9CA3AF"
                    mt="2px"
                  >
                    {
                      (item.benefit || "")
                        .split(/\s+/)
                        .filter((word) => word !== "").length
                    }
                    /5 kata
                  </Text>

                  <Text fontWeight="400" fontSize="14px" mt={2}>
                    Deskripsi Manfaat <span style={{ color: "red" }}>*</span>
                  </Text>
                  <Flex direction="column" position="relative" mt={1}>
                    <Textarea
                      fontSize="14px"
                      placeholder="Masukkan deskripsi manfaat"
                      _placeholder={{ color: "#9CA3AF" }}
                      _focus={{ outline: "none", bg: "white", border: "none" }}
                      value={item.description}
                      disabled={!isEditable || isFormLocked}
                      isRequired
                      onChange={(e) => {
                        const wordCount = e.target.value
                          .split(/\s+/)
                          .filter((word) => word !== "").length;
                        if (wordCount <= 20) {
                          // Batas 10 kata
                          const updatedBenefits = [...benefit];
                          updatedBenefits[index].description = e.target.value;
                          setBenefit(updatedBenefits);
                        }
                      }}
                    />
                    <Text
                      position="relative"
                      fontSize="10px"
                      color="#9CA3AF"
                      mt="2px"
                    >
                      {
                        (item.description || "")
                          .split(/\s+/)
                          .filter((word) => word !== "").length
                      }
                      /20 kata
                    </Text>
                  </Flex>
                </Flex>
              ))}

              {/* Tombol tambah manfaat */}
              <Button
                mt={-3}
                variant="outline"
                leftIcon={<AddIcon />}
                disabled={!isEditable || isFormLocked}
                onClick={() => {
                  // Validasi input terakhir sebelum menambahkan manfaat baru
                  const lastBenefit = benefit[benefit.length - 1];
                  if (!lastBenefit?.benefit || !lastBenefit?.description) {
                    toast({
                      title: "Manfaat dan Deskripsi",
                      description: "Silakan isi sebelum menambahkan yang baru.",
                      status: "error",
                      position: "top",
                      duration: 3000,
                      isClosable: true,
                    });
                    return;
                  }
                  // Tambahkan manfaat baru
                  setBenefit([...benefit, { benefit: "", description: "" }]);
                }}
                _hover={{ bg: "none" }}
              >
                Tambah Manfaat Lain
              </Button>

              {/* Persiapan Infrastruktur */}
              <Text fontWeight="700" fontSize="16px" mb="-2" mt="2">
                Persiapan Infrastruktur{" "}
                <span
                  style={{ color: "red", fontSize: "14px", fontWeight: "400" }}
                >
                  *
                </span>
              </Text>

              <Flex direction="column" mt={0}>
                {/* Map untuk persiapan infrastruktur */}
                {requirements.map((requirement, index) => (
                  <Flex key={index} direction="column" mb={3}>
                    {/* Input untuk persiapan infrastruktur */}
                    <Flex alignItems="center" position="relative" gap={2}>
                      <Input
                        fontSize="14px"
                        placeholder={
                          index === 0 ? "Masukkan persiapan infrastruktur" : ""
                        }
                        _placeholder={{ color: "#9CA3AF" }}
                        _focus={{
                          outline: "none",
                          bg: "white",
                          border: "none",
                        }}
                        value={requirement}
                        disabled={!isEditable || isFormLocked}
                        //isRequired
                        onChange={(e) => {
                          const wordCount = e.target.value
                            .split(/\s+/)
                            .filter((word) => word !== "").length;
                          if (wordCount <= 5) {
                            // Batas maksimal 5 kata
                            const updatedRequirements = [...requirements];
                            updatedRequirements[index] = e.target.value;
                            setRequirements(updatedRequirements);
                          }
                        }}
                      />
                      {/* Ikon hapus hanya muncul jika ada lebih dari satu kolom */}
                      {requirements.length >= 1 && (
                        <Button
                          variant="none"
                          disabled={!isEditable}
                          onClick={() => {
                            setRequirements((prev) =>
                              prev.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          <DeleteIcon color="red.500" />
                        </Button>
                      )}
                    </Flex>
                    {/* Keterangan jumlah kata */}
                    <Text
                      position="relative"
                      fontSize="10px"
                      color="gray.500"
                      mt="2px"
                    >
                      {
                        requirement.split(/\s+/).filter((word) => word !== "")
                          .length
                      }
                      /5 kata
                    </Text>
                  </Flex>
                ))}

                <Text
                  fontWeight="400"
                  fontStyle="normal"
                  fontSize="10px"
                  color="#9CA3AF"
                >
                  Contoh: Mempunyai listrik
                </Text>

                <Flex direction="column" mt={2}>
                  <Input
                    name="newRequirement"
                    fontSize="14px"
                    placeholder="Masukkan persiapan infrastruktur"
                    _placeholder={{ color: "#9CA3AF" }}
                    _focus={{ outline: "none", bg: "white", border: "none" }}
                    value={newRequirement}
                    disabled={!isEditable}
                    //isRequired
                    onChange={(e) => {
                      const wordCount = e.target.value
                        .split(/\s+/)
                        .filter((word) => word !== "").length;
                      if (wordCount <= 5) {
                        // Batas maksimal 5 kata
                        setNewRequirement(e.target.value);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onAddRequirement();
                      }
                    }}
                  />
                  {/* Keterangan jumlah kata untuk input baru */}
                  <Text
                    position="relative"
                    fontSize="10px"
                    color="gray.500"
                    mt="2px"
                  >
                    {
                      newRequirement.split(/\s+/).filter((word) => word !== "")
                        .length
                    }
                    /5 kata
                  </Text>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Validasi infrastruktur terakhir sebelum menambahkan yang baru
                      const lastRequirement = requirements[requirements.length - 1];
                      if (!lastRequirement || lastRequirement.trim() === "") {
                        toast({
                          title: "Persiapan infrasturuktur",
                          description: "Silakan isi sebelum menambahkan yang baru.",
                          status: "error",
                          position: "top",
                          duration: 3000,
                          isClosable: true,
                        });
                        return;
                      }
                      // Tambahkan infrastruktur baru
                      onAddRequirement();
                    }}
                    _hover={{ bg: "none" }}
                    leftIcon={<AddIcon />}
                    disabled={!isEditable}
                    mt={2}
                  >
                    Tambah Infrastruktur Lain
                  </Button>
                </Flex>
              </Flex>
            </Stack>
          </Flex>
        </form>
      </Box>
      {error && (
        <Text color="red.500" fontSize="12px" mt="4px" textAlign="center">
          {error}
        </Text>
      )}
      {status !== "Menunggu" && (
        <>
          <NavbarButton>
            <Button
              type="submit"
              form="innovationForm"
              isLoading={loading}
              width="100%"
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
              {status === "Ditolak" ? "Ajukan Ulang" : "Ajukan Inovasi"}
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

export default AddInnovation;
