import React, { useEffect, useState } from "react";
import { useNavigate, generatePath, useParams } from "react-router-dom";
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
  Image,
} from "@chakra-ui/react";
import { ChevronDownIcon, SearchIcon } from "@chakra-ui/icons";
import TopBar from "Components/topBar";
import Container from "Components/container";
import { auth, firestore } from "../../../firebase/clientApp";
import { paths } from "Consts/path";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  getDocs,
  orderBy,
  query,
  startAfter,
  limit,
  where,
} from "firebase/firestore";
import CardNotification from "Components/card/notification/CardNotification";
import Right from "Assets/icons/arrow-right.svg";
import Left from "Assets/icons/arrow-left.svg";

const SkeletonCard = () => (
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

const PengajuanKlaim: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pencarian dan filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // Pagination Status
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 5;

  const fetchData = async (isNextPage = false) => {
    setLoading(true);

    type klaimInovasi = {
      id: string;
      namaInovasi: string;
      deskripsi?: string;
      status: string;
      desaId: string;
      createdAt: { seconds: number; nanoseconds: number };
    };

    try {
      let q;
      if (isNextPage && lastVisible) {
        q = query(
          collection(firestore, "claimInnovations"),
          where("desaId", "==", user?.uid),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(itemsPerPage)
        );
      } else {
        q = query(
          collection(firestore, "claimInnovations"),
          where("desaId", "==", user?.uid),
          orderBy("createdAt", "desc"),
          limit(itemsPerPage)
        );
      }

      const docs = await getDocs(q);
      setLastVisible(docs.docs[docs.docs.length - 1]);
      setHasMore(docs.docs.length === itemsPerPage);

      const newData: klaimInovasi[] = docs.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as klaimInovasi)
      );
      const filteredByUser = newData.filter(
        (item) => item.desaId === user?.uid
      );

      setData(filteredByUser);
      setFilteredData(filteredByUser);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    let filtered = [...data];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        (item.namaInovasi || "").toLowerCase().includes(lower)
      );
    }
    if (selectedFilter && selectedFilter !== "Semua") {
      filtered = filtered.filter((item) => item.status === selectedFilter);
    }
    setFilteredData(filtered);
  }, [searchTerm, selectedFilter, data]);

  const handleNextPage = async () => {
    if (hasMore) {
      setCurrentPage((prev) => prev + 1);
      await fetchData(true);
    }
  };

  const handlePrevPage = async () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      await fetchData(false);
    }
  };

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

  return (
    <Container page>
      <TopBar title="Pengajuan Klaim" onBack={() => navigate(-1)} />
      <Stack padding="0 16px" gap={2}>
        <Flex 
          flexDirection="column" 
          mb={2}
          mt={3}
          backgroundColor="#DCFCE7"
          alignItems="center"
          ml="-16px" // Netralisir padding dari Stack
          mr="-16px">
          <Text
            fontSize={12}
            mb={2}
            mt={3}
            textAlign={"center"}
            color={"#347357"}>
            Inovasi belum terdaftar pada sistem ?
          </Text>
          <Button 
            mb={2} 
            fontSize={12}
            backgroundColor="#FFFFFF"
            color="#347357"
            width="90%"
            borderRadius={6}
            border="1px solid #347357"
            _hover={{
              backgroundColor: "#347357",
              color: "#FFFFFF"
            }}
            onClick={() => navigate(generatePath(paths.MANUAL_KLAIM_INOVASI))}>
            Klaim manual di sini
          </Button>
        </Flex>
        <Flex gap={2} mb={2}>
          <InputGroup flex={1}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Cari pengajuan di sini"
              size="md"
              borderRadius="full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="white"
              fontSize="10pt"
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
              {["Semua", "Menunggu", "Terverifikasi", "Ditolak"].map(
                (status) => (
                  <MenuItem
                    key={status}
                    fontSize={12}
                    onClick={() =>
                      setSelectedFilter(status === "Semua" ? null : status)
                    }
                  >
                    {status}
                  </MenuItem>
                )
              )}
            </MenuList>
          </Menu>
        </Flex>

        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : filteredData.map((item, idx) => (
              <CardNotification
                key={idx}
                title={item.namaInovasi || "Tanpa Nama Inovasi"}
                status={item.status || "Unknown"}
                date={formatTimestamp(item.createdAt)}
                description={item.deskripsi || "Tidak ada deskripsi"}
                onClick={() =>
                  navigate(
                    paths.DETAIL_KLAIM_INOVASI_PAGE.replace(":id", item.id)
                  )
                }
              />
            ))}

        {/* Pagination Buttons */}
        <Flex gap={4} mt={4} mb={4} alignItems="center" alignSelf="center">
          <Button
            rightIcon={<Image src={Left} alt="back" />}
            iconSpacing={0}
            onClick={handlePrevPage}
            isDisabled={currentPage === 1}
            colorScheme="teal"
            size="sm"
            variant="outline"
            borderRadius="md"
            width="16px"
          >
          </Button>
          <Text textAlign="center" fontSize="10pt">
            Halaman {currentPage}
          </Text>
          <Button
            rightIcon={<Image src={Right} alt="back" />}
            iconSpacing={0}
            onClick={handleNextPage}
            isDisabled={!hasMore}
            colorScheme="teal"
            size="sm"
            variant="outline"
            borderRadius="md"
            width="16px"
          >
          </Button>
        </Flex>
      </Stack>
    </Container>
  );
};

export default PengajuanKlaim;
