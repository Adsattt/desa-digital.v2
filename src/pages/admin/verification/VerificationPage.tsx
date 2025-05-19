import { ChevronDownIcon, SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Skeleton,
  SkeletonCircle,
  Stack,
  Text,
} from "@chakra-ui/react";
import CardNotification from "Components/card/notification/CardNotification";
import Container from "Components/container";
import TopBar from "Components/topBar";
import { paths } from "Consts/path";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { firestore } from "../../../firebase/clientApp";
import AdsPage from "../ads/AdsPage";

const SkeletonCard = () => {
  return (
    <Box borderWidth="1px" borderRadius="lg" padding="4" mb={4} bg="white">
      <Flex alignItems="center" justifyContent="space-between">
        <Box width="60%">
          <Skeleton height="20px" width="80%" mb={2} />
          <Skeleton height="15px" width="50%" mb={2} />
          <Skeleton height="15px" width="100%" mb={2} />
        </Box>
        <SkeletonCircle size="10" />
      </Flex>
    </Box>
  );
};

const VerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const [verifData, setVerifData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pencarian dan filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [isFirstPage, setIsFirstPage] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const formatShortDate = (timestamp: {
    seconds: number;
    nanoseconds: number;
  }) => {
    if (!timestamp?.seconds) return "Invalid Date";
    // Format: DD/MM/YY
    const date = new Date(timestamp.seconds * 1000);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(2);
    return `${day}/${month}/${year}`;
  };

  const formatLocation = (lokasi: any) => {
    if (!lokasi) return "No Location";
    const kecamatan = lokasi.kecamatan?.label || "Unknown Subdistrict";
    const kabupaten = lokasi.kabupatenKota?.label || "Unknown City";
    const provinsi = lokasi.provinsi?.label || "Unknown Province";

    return `Kecamatan ${kecamatan}, ${kabupaten}, ${provinsi}`;
  };

  const categoryToPathMap: Record<string, string> = {
    "Verifikasi Desa": paths.VILLAGE_PROFILE_PAGE,
    "Verifikasi Inovator": paths.INNOVATOR_PROFILE_PAGE,
    "Verifikasi Tambah Inovasi": paths.DETAIL_INNOVATION_PAGE,
    "Verifikasi Klaim Inovasi": paths.DETAIL_KLAIM_INOVASI_PAGE,
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

  const categoryToCollectionMap: Record<string, string> = {
    "Verifikasi Desa": "villages",
    "Verifikasi Inovator": "innovators",
    "Verifikasi Tambah Inovasi": "innovations",
    "Verifikasi Klaim Inovasi": "claimInnovations",
  };

  const statusOptions = ["Semua", "Menunggu", "Terverifikasi", "Ditolak"];

  const fetchData = async (isNextPage = false) => {
    const collectionName = categoryToCollectionMap[category || ""];
    setLoading(true);

    if (!collectionName) {
      return [];
    }

    try {
      let q;

      if (isNextPage && lastVisible) {
        // Get next batch starting after the last visible document
        q = query(
          collection(firestore, collectionName),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(itemsPerPage)
        );
      } else {
        // Get first batch
        q = query(
          collection(firestore, collectionName),
          orderBy("createdAt", "desc"),
          limit(itemsPerPage)
        );
        setIsFirstPage(true);
      }

      const docSnap = await getDocs(q);

      const data = docSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Fetched data:", data);

      // Check if we have more items
      setHasMore(docSnap.docs.length === itemsPerPage);

      if (docSnap.docs.length > 0) {
        // Save the last visible document
        setLastVisible(docSnap.docs[docSnap.docs.length - 1]);
      } else if (isNextPage) {
        // If no docs returned when navigating forward, there are no more docs
        setHasMore(false);
      }

      return docSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk melakukan pencarian dan filter
  const applySearchAndFilter = () => {
    let filtered = [...verifData];

    // Terapkan pencarian jika ada
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        // Sesuaikan field pencarian berdasarkan kategori
        if (category === "Verifikasi Desa") {
          return (item.namaDesa || "").toLowerCase().includes(searchLower);
        } else if (category === "Verifikasi Inovator") {
          return (item.namaInovator || "").toLowerCase().includes(searchLower);
        } else {
          return (item.namaInovasi || "").toLowerCase().includes(searchLower);
        }
      });
    }

    // Terapkan filter status jika dipilih (selain "Semua")
    if (selectedFilter && selectedFilter !== "Semua") {
      filtered = filtered.filter((item) => item.status === selectedFilter);
    }

    setFilteredData(filtered);
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      const data = await fetchData();
      setVerifData(data || []);
      setFilteredData(data || []);
      setCurrentPage(1);
      setIsFirstPage(true);
      setSearchTerm("");
      setSelectedFilter(null);
    };
    loadInitialData();
  }, [category]);

  // Terapkan pencarian dan filter ketika nilai-nilainya berubah
  useEffect(() => {
    applySearchAndFilter();
  }, [searchTerm, selectedFilter, verifData]);

  // Handle next page navigation
  const handleNextPage = async () => {
    const data = await fetchData(true);
    if (data.length > 0) {
      setVerifData(data);
      setCurrentPage(currentPage + 1);
      setIsFirstPage(false);
    }
  };

  // Handle previous page navigation
  const handlePrevPage = async () => {
    if (currentPage > 1) {
      // For previous page, we need to reset and load from the beginning
      // and then navigate to the correct page
      let data = await fetchData(false);
      setVerifData(data);

      if (currentPage > 2) {
        // If we're not going back to page 1, we need to navigate forward
        // until we reach the desired page
        let lastVisibleDoc = null;
        for (let i = 1; i < currentPage - 1; i++) {
          lastVisibleDoc = data[data.length - 1];
          const q = query(
            collection(firestore, categoryToCollectionMap[category || ""]),
            orderBy("createdAt", "desc"),
            startAfter(lastVisibleDoc),
            limit(itemsPerPage)
          );
          const docSnap = await getDocs(q);
          data = docSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setLastVisible(docSnap.docs[docSnap.docs.length - 1]);
        }
        setVerifData(data);
      }

      setCurrentPage(currentPage - 1);
      setIsFirstPage(currentPage - 1 === 1);
    }
  };

  // Handler untuk pencarian
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handler untuk filter
  const handleFilterSelect = (status: string) => {
    setSelectedFilter(status === "Semua" ? null : status);
  };

  return (
    <Container page>
      <TopBar title={category || "Verification"} onBack={() => navigate(-1)} />

      {category !== "Pembuatan Iklan" && (
        <Stack padding="0 16px" gap={2} marginBottom={4}>
          {/* Search and Filter Bar */}
          <Flex gap={2} mb={2} mt={8}>
            <InputGroup flex={1}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder={
                  category === "Verifikasi Desa"
                    ? "Cari desa di sini"
                    : category === "Verifikasi Inovator"
                    ? "Cari inovator di sini"
                    : "Cari inovasi di sini"
                }
                size="md"
                borderRadius="full"
                value={searchTerm}
                onChange={handleSearch}
                bg="white"
              />
            </InputGroup>

            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon color="#347357" />}
                borderRadius="8px"
                backgroundColor="white"
                border="1px solid"
                borderColor="gray.200"
                textColor={"gray.600"}
                _hover={{ bg: "gray.50" }}
                fontSize="12px"
                fontWeight="normal"
              >
                {selectedFilter || "Filter"}
              </MenuButton>
              <MenuList>
                {statusOptions.map((status) => (
                  <MenuItem
                    key={status}
                    onClick={() => handleFilterSelect(status)}
                    fontWeight={
                      selectedFilter === status ||
                      (status === "Semua" && !selectedFilter)
                        ? "bold"
                        : "normal"
                    }
                  >
                    {status}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </Flex>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filteredData.length > 0 ? (
            filteredData.map((data, index) => {
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
                  status={data.status || "Menunggu"}
                  date={formatShortDate(data.createdAt)}
                  description={description}
                  onClick={() => handleCardClick(data.id)}
                />
              );
            })
          ) : (
            <Text textAlign="center" mt={4}>
              Tidak ada data untuk ditampilkan
            </Text>
          )}
          {/* Pagination Controls */}
          {filteredData.length > 0 && (
            <Flex
              justifyContent="space-between"
              mt={4}
              mb={4}
              alignItems="center"
            >
              <Button
                onClick={handlePrevPage}
                isDisabled={isFirstPage}
                colorScheme="teal"
                size="sm"
                variant="outline"
                borderRadius="md"
                width="120px"
              >
                Sebelumnya
              </Button>
              <Text textAlign="center" fontWeight="medium">
                Halaman {currentPage}
              </Text>
              <Button
                onClick={handleNextPage}
                isDisabled={!hasMore}
                colorScheme="teal"
                size="sm"
                variant="outline"
                borderRadius="md"
                width="120px"
              >
                Selanjutnya
              </Button>
            </Flex>
          )}
        </Stack>
      )}

      {category === "Pembuatan Iklan" && <AdsPage />}
    </Container>
  );
};

export default VerificationPage;
