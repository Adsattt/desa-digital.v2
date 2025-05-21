import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  VStack,
  Flex,
  Image,
  Badge,
  HStack,
} from "@chakra-ui/react";
import Loading from "Components/loading";
import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../../../../firebase/clientApp"; 
import { paths } from "Consts/path";

interface SearchResult {
  id: string;
  name: string;
  description: string;
  category: string;
  innovator: string;
  imageUrl: string;
  appliedInVillages: number;
}

const SearchPage = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const queryParam = new URLSearchParams(location.search).get("q") || "";
  const category = new URLSearchParams(location.search).get("category") || "";

  useEffect(() => {
    const fetchInnovations = async () => {
      if (queryParam || category) {
        setLoading(true);
        setError(null);
        try {
          const innovationsRef = collection(firestore, "innovations");
          let q = query(innovationsRef, where("status", "==", "Terverifikasi"));

          if (category) {
            q = query(q, where("kategori", "==", category));
          }
          if (queryParam) {
            q = query(
              q,
              where("namaInovasi", ">=", queryParam),
              where("namaInovasi", "<=", queryParam + "\uf8ff")
            );
          }

          const snapshot = await getDocs(q);
          const results = snapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().namaInovasi,
            description: doc.data().deskripsi,
            category: doc.data().kategori,
            innovator: doc.data().namaInnovator,
            imageUrl: doc.data().images?.[0] || "",
            appliedInVillages: doc.data().inputDesaMenerapkan?.split(",").length || 0,
          }));
          setSearchResults(results);
          setLoading(false);
        } catch (error) {
          console.error("Fetch error:", error);
          setError("Gagal memuat hasil pencarian. Silakan coba lagi.");
          setLoading(false);
        }
      }
    };

    fetchInnovations();
  }, [queryParam, category]);

  const handleResultClick = (id: string) => {
    navigate(paths.DETAIL_INNOVATION_PAGE.replace(":id", id));
  };

  return (
    <Box p={4}>
      <Heading size="md" mb={4}>
        Menampilkan {searchResults.length} hasil pencarian untuk "{queryParam || category}"
      </Heading>
      {loading ? (
        <Loading />
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : searchResults.length > 0 ? (
        <VStack spacing={4} align="stretch">
          {searchResults.map((item) => (
            <Box
              key={item.id}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              onClick={() => handleResultClick(item.id)}
              cursor="pointer"
              _hover={{ bg: "gray.50" }}
            >
              <Flex>
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  boxSize="100px"
                  objectFit="cover"
                  borderRadius="md"
                  mr={4}
                  fallbackSrc="https://via.placeholder.com/100"
                />
                <VStack align="start" spacing={1}>
                  <Heading size="sm">{item.name}</Heading>
                  <Text fontSize="sm" color="gray.600">
                    {item.description}
                  </Text>
                  <HStack>
                    <Badge colorScheme="green">{item.category}</Badge>
                    <Text fontSize="sm">
                      Diterapkan di {item.appliedInVillages} desa
                    </Text>
                  </HStack>
                </VStack>
              </Flex>
            </Box>
          ))}
        </VStack>
      ) : (
        <Text>Tidak ada hasil ditemukan untuk "{queryParam || category}"</Text>
      )}
    </Box>
  );
};

export default SearchPage;