import { useEffect, useState } from "react";
import { useLocation, useNavigate, Location } from "react-router-dom";
import { firestore } from "../../../../firebase/clientApp";
import { collection, getDocs } from "firebase/firestore";
import CardInnovation from "Components/card/innovation";
import { paths } from "Consts/path";
import Container from "Components/container";
import TopBar from "Components/topBar";
import { Box, Heading, Text, Flex } from "@chakra-ui/react";
import SearchBarLink from "./SearchBarLink";
import { debounce } from "lodash";

interface InovationData {
  id: string;
  namaInovasi?: string;
  kategori?: string;
  deskripsi?: string;
  tahunDibuat?: string;
  images?: string[];
  innovatorLogo?: string;
  innovatorName?: string;
  manfaat?: { deskripsi: string }[];
  status?: string;
  [key: string]: any;
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchPage() {
  const query = useQuery();
  const initialSearchTerm = query.get("q")?.toLowerCase().trim() || "";
  const [results, setResults] = useState<InovationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState(initialSearchTerm);
  const [role] = useState("user"); // Set default role or fetch from authentication
  const navigate = useNavigate();

  // Debounced fetch and filter function
  const fetchData = debounce(async (keyword: string) => {
    setLoading(true);
    setResults([]);

    try {
      const collectionRef = collection(firestore, "innovations");
      const snapshot = await getDocs(collectionRef);

      console.log("Search keyword:", keyword);
      console.log("Fetched documents:", snapshot.docs.length);

      const filtered = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as InovationData))
        .filter((item) => {
          const namaInovasi = (item.namaInovasi || "").toLowerCase().trim();
          const isVerified = item.status === "Terverifikasi";
          console.log(
            `Item: ${namaInovasi}, Status: ${item.status || "missing"}, Matches: ${namaInovasi.includes(keyword)}, Verified: ${isVerified}`
          );
          if (!isVerified) return false;
          if (!namaInovasi) return false;
          return keyword ? namaInovasi.includes(keyword) : isVerified;
        })
        .sort((a, b) => (a.namaInovasi || "").localeCompare(b.namaInovasi || ""));

      console.log(
        "Filtered and sorted results:",
        filtered.map((item) => ({ id: item.id, namaInovasi: item.namaInovasi, status: item.status }))
      );
      setResults(filtered);
    } catch (error) {
      console.error("Error fetching data:", error);
    }

    setLoading(false);
  }, 300);

  // Run debounced fetch when searchValue changes
  useEffect(() => {
    fetchData(searchValue.toLowerCase().trim());
    return () => fetchData.cancel();
  }, [searchValue]);

  // Reset scroll position on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }
  , []);

  const handleCardClick = (id: string) => {
    // destinasi ke halaman detail inovasi namun pastikan dulu usernya sebagai inovator atau bukan kalau inovator dia punya akses edit kalau bukan inovator dia tidak punya akses edit
    const destination = paths.INNOVATION_DETAIL.replace(":id", id);
    // logic user role
    if (role === "innovator") {
      // check if the user is the owner of the innovation
      const isOwner = results.some((item) => item.id === id && item.status === "Terverifikasi");
      if (isOwner) {
        navigate(destination);
      } else {
        navigate(destination);
      }
    }
    // if the user is not an innovator, just navigate to the detail page
    else {
      navigate(destination);
    }
    navigate(destination);
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchValue(e.currentTarget.value.trim());
      navigate(`/search?q=${encodeURIComponent(e.currentTarget.value.trim())}`);
    }
  };

  return (
    <Container page>
      <TopBar
        title="Hasil Pencarian"
        onBack={() => navigate(paths.LANDING_PAGE)}
      />
      <Box px={5} py={8} >
          <SearchBarLink
            key={(useLocation() as Location & { key: string }).key}
            placeholderText="Cari Inovasi di sini..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearchSubmit}
            width="100%" 
            maxW="100%"
          />

        <Flex align="center" mb={2} mt={6}>
          <Heading fontSize="15px" fontWeight="800" color="gray.700">
            Hasil Pencarian: "{searchValue || 'Semua Inovasi'}"
          </Heading>
        </Flex>

        {loading ? (
          <Text color="gray.500" fontSize="12px">
            Sedang mencari...
          </Text>
        ) : results.length === 0 ? (
          <Text fontSize="12px" color="gray.500">
            Tidak ada inovasi yang ditemukan.
          </Text>
        ) : (
          <Box
            display="grid"
            gridTemplateColumns={{
              base: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(2, 1fr)",
            }}
            gap={4}
            mt={3}
          >
            {results.map((item) => (
              <CardInnovation
                key={item.id}
                images={item.images}
                namaInovasi={item.namaInovasi}
                kategori={item.kategori}
                deskripsi={item.deskripsi}
                tahunDibuat={item.tahunDibuat}
                innovatorLogo={item.innovatorLogo}
                innovatorName={item.innovatorName}
                onClick={() => handleCardClick(item.id)}
              />
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default SearchPage;