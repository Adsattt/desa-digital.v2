import {
  useDisclosure
} from "@chakra-ui/react";
import Container from "Components/container";
import TopBar from "Components/topBar";
import React from "react";
import { useQuery } from "react-query";
import { getUsers } from "Services/userServices";
import { useNavigate, generatePath } from "react-router-dom";
import { GridContainer, 
        CardContent, 
        Containers,
        Text, 
        Texthighlight,
        Column } from "./_innovatorStyle";
import CardInnovator from "Components/card/innovator";
import { paths } from "Consts/path";
import { Box, Select,} from "@chakra-ui/react";
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
import Hero from "./components/hero";

function Innovator() {
  const navigate = useNavigate();
  // const { data: users, isFetched } = useQuery<any>("innovators", getUsers);
  // const innovators = users?.filter((item: any) => item.role === "innovator");

  const innovatorsRef = collection(firestore, "innovators")
  const [innovators, setInnovators] = useState<DocumentData[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const snapShot = await getDocs(innovatorsRef)
      const innovatorsData = snapShot.docs.map((doc) => doc.data())
      
      setInnovators(innovatorsData)
    }
    fetchData()
  }, [firestore])
  
  return (
  <Box>
    <Hero />
    <Containers>
      <CardContent>
        <Column>
        <Text>
            Pilih Innovator
          </Text>
          <Select
            placeholder= "Pilih Kategori Innovator"
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
          >
            {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
            ))}
          </Select>
          <SearchBarInnov/>
        </Column>
      </CardContent>
      <Text> Menampilkan 2 innovator untuk <Texthighlight> "Semua Kategori" </Texthighlight> </Text>
      <GridContainer >
        {
          innovators?.map((item: any, idx: number) => (
          <CardInnovator
            key={idx}
            {...item}
            onClick={() =>
              navigate(
                generatePath(paths.DETAIL_INNOVATOR_PAGE, { id: item.id})
              )
            }
          />
        ))}
      </GridContainer>
    </Containers>
  </Box>
  );
}
     
export default Innovator;