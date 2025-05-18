import { AddIcon, DeleteIcon, MinusIcon } from "@chakra-ui/icons";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Select,
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
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import React, { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate, useParams } from "react-router-dom";
import ImageUpload from "../../../components/form/ImageUpload";
import { auth, firestore, storage } from "../../../firebase/clientApp";

const categories = [
  "E-Government",
  "E-Tourism",
  "Layanan Keuangan", 
  "Layanan Sosial",
  "Pemasaran Agri-Food dan E-Commerce",
  "Pengembangan Masyarakat dan Ekonomi",
  "Pengelolaan Sumber Daya",
  "Pertanian Cerdas",
  "Sistem Informasi",
  "UMKM",
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

const EditInnovation: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams<{ id: string }>(); // Assuming the route contains the innovation ID as a parameter

  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const selectFileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [textInputsValue, setTextInputsValue] = useState({
    name: "",
    year: "",
    description: "",
    otherBusinessModel: "",
    villages: "",
    priceMin: "",
    priceMax: "",
  });
  const [category, setCategory] = useState("");
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedModels, setSelectedModels] = useState<(string | number)[]>([]);
  const [otherBusinessModel, setOtherBusinessModel] = useState("");
  const [benefit, setBenefit] = useState([{ benefit: "", description: "" }]);
  const [isOpen, setIsOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  useEffect(() => {
    const fetchInnovation = async () => {
      if (!id) {
        console.error("No ID found in the URL parameters");
        return;
      }
      try {
        console.log("Fetching document with ID:", id);
        const docRef = doc(firestore, "innovations", id);
        const docSnap = await getDoc(docRef);
        console.log("Document fetched:", docSnap.exists());

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Fetched data:", data);
          setTextInputsValue({
            name: data.namaInovasi || "",
            year: data.tahunDibuat || "",
            description: data.deskripsi || "",
            villages: data.inputDesaMenerapkan || "",
            priceMin: data.hargaMinimal || "",
            priceMax: data.hargaMaksimal || "",
            otherBusinessModel: data.otherBusinessModel || "",
          });
          setSelectedStatus(data.statusInovasi || "");
          setCategory(data.kategori || "");
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
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching innovation:", error);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };
    fetchInnovation();
  }, [id]);

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

  const onTextChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTextInputsValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const options = [
    { value: "1", label: "Masih diproduksi" },
    { value: "2", label: "Tidak diproduksi" },
  ];

  const splitModels = (models: string[], num: number) => {
    const midpoint = Math.ceil(models.length / num);
    return [models.slice(0, midpoint), models.slice(midpoint)];
  };

  const [firstColumn, secondColumn] = splitModels(predefinedModels, 2);

  const getVillagesWordCount = () => {
    return textInputsValue.villages.split(/\s+/).filter((word) => word !== "")
      .length;
  };

  const finalRequirements = [...requirements];
    if (
      newRequirement.trim() !== "" &&
      !finalRequirements.includes(newRequirement.trim())
    ) {
      finalRequirements.push(newRequirement.trim());
    }

  const onSelectCategory = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(event.target.value);
  };

  const onAddRequirement = () => {
    if (newRequirement.trim() !== "") {
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

  const onUpdateInnovation = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const { name, year, description, villages, priceMax, priceMin } = textInputsValue;

    if (!name || !year || !description || !category || !villages) {
      setError("Semua kolom harus diisi");
      setLoading(false);
      return;
    }
    try {
      const innovationDocRef = doc(firestore, "innovations", id!);

      await updateDoc(innovationDocRef, {
        statusInovasi: selectedStatus,
        namaInovasi: name,
        kategori: category,
        tahunDibuat: year,
        inputDesaMenerapkan: villages,
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
        images: selectedFiles, // assume previously uploaded images are part of selectedFiles
      });

      console.log("Document updated with ID: ", innovationDocRef.id);

      if (selectedFiles.length > 0) {
        try {
          const imageUrls = await uploadFiles(
            selectedFiles,
            innovationDocRef.id
          );
          await updateDoc(innovationDocRef, {
            images: imageUrls,
          });
          console.log("Images uploaded", imageUrls);
        } catch (uploadError) {
          console.error("Error uploading images:", uploadError);
          setError("Gagal mengupload gambar");
        }
      }

      setLoading(false);
      setIsSuccessOpen(true); // Open the success alert dialog
    } catch (error) {
      console.log("error", error);
      setError("Gagal mengubah inovasi");
      setLoading(false);
    }
  };

  const onDeleteInnovation = async () => {
    setLoading(true);
    try {
      const innovationDocRef = doc(firestore, "innovations", id!);
      await deleteDoc(innovationDocRef);
      setLoading(false);
      toast({
        title: "Inovasi dihapus.",
        description: "Inovasi telah berhasil dihapus.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate("/");
    } catch (error) {
      console.log("error", error);
      setError("Gagal menghapus inovasi");
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSuccessClose = () => {
    setIsSuccessOpen(false);
    navigate(`/innovation/detail/${id}`);
  };

  if (loading) {
    return (
      <Container page px={16}>
        <TopBar title="Edit Inovasi" onBack={() => navigate(-1)} />
        <Text>Loading...</Text>
      </Container>
    );
  }

  return (
    <>
      <TopBar title="Edit Inovasi" onBack={() => navigate(-1)} />
      <Box p="48px 16px 20px 16px">
        <form onSubmit={onUpdateInnovation}>
          <Flex direction="column" marginTop="24px">
            <Stack spacing={3} width="100%">
              <Text fontWeight="400" fontSize="14px" mb="-2">
                Status Inovasi <span style={{ color: "red" }}>*</span>
              </Text>
              <RadioGroup
                defaultValue="Masih diproduksi"
                name="status"
                onChange={(value) => setSelectedStatus(value)}
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
              <Text fontWeight="400" fontSize="14px">
                Nama Inovasi <span style={{ color: "red" }}>*</span>
              </Text>
              <Input
                name="name"
                fontSize="10pt"
                placeholder="Nama Inovasi"
                _placeholder={{ color: "gray.500" }}
                _focus={{
                  outline: "none",
                  bg: "white",
                  border: "1px solid",
                  borderColor: "black",
                }}
                value={textInputsValue.name}
                onChange={onTextChange}
              />
              <Text fontWeight="400" fontSize="14px">
                Kategori Inovasi <span style={{ color: "red" }}>*</span>
              </Text>
              <Select
                placeholder="Pilih kategori"
                name="category"
                fontSize="10pt"
                variant="outline"
                cursor="pointer"
                color={"gray.500"}
                _focus={{
                  outline: "none",
                  bg: "white",
                  border: "1px solid",
                  borderColor: "black",
                }}
                _placeholder={{ color: "gray.500" }}
                value={category}
                onChange={onSelectCategory}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
              <Text fontWeight="400" fontSize="14px">
                Tahun dibuat inovasi <span style={{ color: "red" }}>*</span>
              </Text>
              <Input
                name="year"
                fontSize="10pt"
                placeholder="Ketik tahun"
                _placeholder={{ color: "gray.500" }}
                _focus={{
                  outline: "none",
                  bg: "white",
                  border: "1px solid",
                  borderColor: "black",
                }}
                value={textInputsValue.year}
                onChange={onTextChange}
              />
              <Text fontWeight="400" fontSize="14px">
                Deskripsi <span style={{ color: "red" }}>*</span>
              </Text>
              <Textarea
                name="description"
                fontSize="10pt"
                placeholder="Ketik deskripsi inovasi"
                _placeholder={{ color: "gray.500" }}
                _focus={{
                  outline: "none",
                  bg: "white",
                  border: "1px solid",
                  borderColor: "black",
                }}
                height="100px"
                value={textInputsValue.description}
                onChange={onTextChange}
              />
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
                  onChange={onTextChange}
                  required
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
                      required
                    />
                  </InputGroup>
                </Flex>
              </Flex>
              <Text fontWeight="400" fontSize="14px">
                Foto inovasi <span style={{ color: "red" }}>*</span>
              </Text>
              <ImageUpload
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                selectFileRef={selectFileRef}
                onSelectImage={onSelectImage}
                maxFiles={5}
              />
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
                      required
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
                      required
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
                        required
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
                    required
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
                      if (!lastRequirement) {
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
        <Text color="red.500" fontSize="12px" mt="4px">
          {error}
        </Text>
      )}
      <NavbarButton>
        <Button type="submit" mt="20px" width="100%" isLoading={loading}>
          Update Inovasi
        </Button>
        <Button
          type="button"
          mt="4"
          width="100%"
          bg="red.500"
          color="white"
          _hover={{ bg: "red.600" }}
          onClick={handleDeleteClick}
        >
          Delete Inovasi
        </Button>
      </NavbarButton>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={handleClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Hapus Inovasi
            </AlertDialogHeader>

            <AlertDialogBody>
              Apakah Anda yakin? Anda tidak dapat membatalkan tindakan ini
              setelah inovasi dihapus.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={handleClose}>
                Batal
              </Button>
              <Button
                colorScheme="red"
                onClick={onDeleteInnovation}
                ml={3}
                bg="red.500"
                _hover={{ bg: "red.600" }}
              >
                Hapus
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      <AlertDialog
        isOpen={isSuccessOpen}
        leastDestructiveRef={cancelRef}
        onClose={handleSuccessClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Sukses
            </AlertDialogHeader>
            <AlertDialogBody>
              Inovasi telah berhasil diperbarui.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={handleSuccessClose}>
                OK
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default EditInnovation;
