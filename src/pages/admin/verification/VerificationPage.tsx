import CardNotification from "Components/card/notification/CardNotification";
import Container from "Components/container";
import TopBar from "Components/topBar";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate, useParams } from "react-router-dom";
import { auth, firestore } from "../../../firebase/clientApp";
import AdsPage from "../ads/AdsPage";
import SearchBarVil from '../components/SearchBarVil';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { paths } from "Consts/path";
import {
    Box,
    Flex,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverFooter,
    PopoverArrow,
    PopoverCloseButton,
    Button,
    Checkbox,
    VStack,
    Stack,
} from '@chakra-ui/react';
import Dropdown from "../components/Filter"

const VerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const [user] = useAuthState(auth);
  const [verifData, setVerifData] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  const formatTimestamp = (timestamp: {
    seconds: number;
    nanoseconds: number;
  }) => {
    if (!timestamp?.seconds) return "Invalid Date";
    return new Date(timestamp.seconds * 1000).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatLocation = (lokasi: any) => {
    if (!lokasi) return "No Location";
    const kecamatan = lokasi.kecamatan?.label || "Unknown Subdistrict";
    const kabupaten = lokasi.kabupatenKota?.label || "Unknown City";
    const provinsi = lokasi.provinsi?.label || "Unknown Province";

    return `KECAMATAN ${kecamatan}, ${kabupaten}, ${provinsi}`;
  };

  const categoryToPathMap: Record<string, string> = {
    "Verifikasi Desa": paths.VILLAGE_PROFILE_PAGE,
    "Verifikasi Inovator": paths.INNOVATOR_PROFILE_PAGE,
    "Verifikasi Tambah Inovasi": paths.DETAIL_INNOVATION_PAGE,
    "Verifikasi Klaim Inovasi": paths.DETAIL_INNOVATION_PAGE,
  };

  const handleCardClick = (id: string) => {
    const pathTemplate = categoryToPathMap[category || ""];
    if (pathTemplate) {
      const path = pathTemplate.replace(":id", id);
      navigate(path);
    } else {
      console.error("Unknown category or path mapping missing");
    }
  };

  const fetchCategoryData = async (collectionName: string) => {
    const docRef = collection(firestore, collectionName);
    const docSnap = await getDocs(docRef);
    return docSnap.docs.map((doc) => ({
      id: doc.id, // Include ID for path generation
      ...doc.data(),
    }));
  };

  const fetchData = async () => {
    const categoryToCollectionMap: Record<string, string> = {
      "Verifikasi Desa": "villages",
      "Verifikasi Inovator": "innovators",
      "Verifikasi Tambah Inovasi": "innovations",
      "Verifikasi Klaim Inovasi": "claimInnovations",
    };

    const collectionName = categoryToCollectionMap[category || ""];
    if (collectionName) {
      return await fetchCategoryData(collectionName);
    }
    return [];
  };

  // Memuat data ketika kategori berubah
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchData();
      setVerifData(data || []);
    };
    loadData();
  }, [category]);

  return (
    <Container page>
      <TopBar title={category || "Verification"} onBack={() => navigate(-1)} />
      <Stack padding="0 16px" gap={2}>
        {/* Search Bar dan Filter */}
        <Flex
            padding="16px 0px"
            justifyContent="flex-end"
            alignItems="center"
            gap={2}
            mt="px"
            mb="-20px"
        >
            {/* Search Bar */}
            <SearchBarVil 
              placeholder="Cari pengajuan di sini" 
              onChange={(value) => setSearchKeyword(value)}
            />

            {/* Tombol Filter dengan Popover */}
            <Popover>
                <PopoverTrigger>
                    <Button
                        sx={{
                            _hover: { bg: "none", borderColor: "#347357" },
                        }}
                        display={'flex'}
                        variant="outline"
                        borderColor="gray.300"
                        borderRadius="8px"
                        padding="8px 16px"
                        width="80px"
                        height="35px"
                        fontWeight="200"
                        fontSize="12px"
                        color="gray.600"
                        rightIcon={<ChevronDownIcon color="green.600" boxSize={4} />}
                    >
                        Filter
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    sx={{
                        display: "flex",
                        width: "100%",
                        right: "40px",
                        borderRadius: "8px",
                        boxShadow: "lg",
                    }}

                >
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverHeader width="150px" fontSize="13px" fontWeight={600} fontFamily="Inter" fontStyle="normal" color="#1f2937">
                        Filter Pilihan </PopoverHeader>
                    <PopoverBody fontFamily="Inter" fontStyle="normal">
                      <Dropdown
                        placeholder="Filter Status"
                        options={[
                          { id: "Menunggu", name: "Menunggu" },
                          { id: "Ditolak", name: "Ditolak" },
                          { id: "Terverifikasi", name: "Terverifikasi" },
                        ]}
                        onChange={(selected) => setSelectedStatus(selected?.value || null)}
                      />
                    </PopoverBody>
                </PopoverContent>
            </Popover>
        </Flex>
        {category === "Pembuatan Iklan" ? (
          <AdsPage />
        ) : (
          verifData
            .filter((data) => {
              const keyword = searchKeyword.toLowerCase();
              const title =
                data.namaDesa ||
                data.namaInovator ||
                data.namaInovasi ||
                "";
          
              return title.toLowerCase().includes(keyword);
            })
            .filter((data) => {
              if (!selectedStatus) return true;
              return data.status === selectedStatus;
            })
            .map((data, index) => {
              const isVillageCategory = category === "Verifikasi Desa";
              const description = isVillageCategory
                ? formatLocation(data.lokasi)
                : data.deskripsi || "Klaim " + data.namaInovasi;

            return (
              <CardNotification
                key={index}
                title={
                  data.namaDesa ||
                  data.namaInovator ||
                  data.namaInovasi ||
                  "No Title"
                }
                status={data.status || "Unknown"}
                date={formatTimestamp(data.createdAt)}
                description={description}
                onClick={() => handleCardClick(data.id)}
              />
            );
          })
        )}
      </Stack>
    </Container>
  );
};
export default VerificationPage;
