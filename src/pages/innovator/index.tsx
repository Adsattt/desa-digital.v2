import Hero from "./components/hero";
import { useNavigate, generatePath } from "react-router-dom";
import { GridContainer, 
        CardContent, 
        Containers,
        Text, 
        Texthighlight,
        Column } from "./_innovatorStyle";
import CardInnovator from "Components/card/innovator";
import { paths } from "Consts/path";
import { Box, Select } from "@chakra-ui/react";
import SearchBarInnov from "./components/hero/SearchBarInnov";
import { collection, DocumentData, getDocs } from "firebase/firestore";
import { firestore } from "../../firebase/clientApp";
import { useEffect, useState } from "react";

const categories = [
  "Semua Kategori",
  "Start-up",
  "Di bawah Pemerintah",
  "Pemerintah Daerah",
  "Agribisnis",
  "Perusahaan",
  "Organisasi Pertanian",
  "Layanan Finansial",
  "Lembaga Swadaya Masyarakat (LSM)",
  "Akademisi",
];

function Innovator() {
  const navigate = useNavigate();
  const innovatorsRef = collection(firestore, "innovators");
  const [innovators, setInnovators] = useState<DocumentData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [innovatorsShowed, setInnovatorsShowed] = useState<DocumentData[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("Semua Kategori");

  useEffect(() => {
    const fetchData = async () => {
      const snapShot = await getDocs(innovatorsRef);
      const innovatorsData = snapShot.docs.map((doc) => doc.data());
      setInnovators(innovatorsData);
      setInnovatorsShowed(innovatorsData);
    };
    fetchData();
  }, [firestore]);

  function filterSearch(searchKey: string, categoryKey: string) {
    const filteredInnovators = innovators.filter((item: any) => {
      const isNameMatch = item.namaInovator?.toLowerCase().includes(searchKey.toLowerCase());
      const isCategoryMatch = categoryKey === "Semua Kategori" || item.kategori === categoryKey;
      return isNameMatch && isCategoryMatch;
    });
    setInnovatorsShowed(filteredInnovators);
  }

  return (
    <Box>
      <Hero />
      <Containers>
        <CardContent>
          <Column>
            <Text>Pilih Inovator</Text>
            <Select
              placeholder="Pilih Kategori Inovator"
              name="category"
              fontSize="10pt"
              variant="outline"
              cursor="pointer"
              color={"gray.500"}
              _focus={{
                outline: "none",
                bg: "white",
                border: "1px solid",
                borderColor: "#E5E7EB",
              }}
              value={categoryFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setCategoryFilter(e.target.value);
                filterSearch(searchQuery, e.target.value);
              }}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
            <SearchBarInnov 
              placeholder="Search"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchQuery(e.target.value);
                filterSearch(e.target.value, categoryFilter);
              }} 
            />
          </Column>
        </CardContent>
        <Text>
          {" "}
          Menampilkan semua inovator untuk{" "}
          <Texthighlight> "{categoryFilter}" </Texthighlight>{" "}
        </Text>
        <GridContainer>
          {innovatorsShowed.map((item: any, idx: number) => (
            <CardInnovator
              key={idx}
              {...item}
              onClick={() =>
                navigate(generatePath(paths.INNOVATOR_PROFILE_PAGE, { id: item.id }))
              }
            />
          ))}
        </GridContainer>
      </Containers>
    </Box>
  );
}

export default Innovator;
