import { Box } from "@chakra-ui/react";
import CardInnovator from "Components/card/innovator";
import { paths } from "Consts/path";
import {
  DocumentData,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { generatePath, useNavigate } from "react-router-dom";
import { firestore } from "../../../../firebase/clientApp";
import { CardContainer, Horizontal, Title } from "./_innovatorStyle";
import defaultHeader from "@public/images/default-header.svg";
import defaultLogo from "@public/images/default-logo.svg";

interface InnovatorData {
  id: string;
  namaInovator: string;
  jumlahDesaDampingan: number;
  jumlahInovasi: number;
  header?: string;
  logo?: string;
  status?: boolean; 
}


function Innovator() {
  const navigate = useNavigate();
  const [innovators, setInnovators] = useState<DocumentData[]>([]);

  useEffect(() => {
    const fetchInnovators = async () => {
      const innovatorsRef = collection(firestore, "innovators");

      const q = query(
        innovatorsRef,
        // where("status", "==", "Terverifikasi"), // 1. Filter hanya yang terverifikasi
        orderBy("jumlahDesaDampingan", "desc"), // 2. Urutkan dari dampingan terbanyak
        limit(5) // 3. Ambil hanya 5 data teratas
      );

      const innovatorsSnapshot = await getDocs(q);
      const innovatorsData = innovatorsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setInnovators(innovatorsData);
    };
    fetchInnovators();
  }, []); // Hapus dependency agar hanya jalan sekali

  console.log("Innovators:", innovators);
  return (
    <Box padding="0 14px">
      <Title>Inovator Unggulan</Title>
      <CardContainer>
        <Horizontal>
          {innovators.map((item: any, idx) => (
            <CardInnovator
              key={item.id} // Gunakan ID unik dari dokumen
              id={item.id}
              header={item.header || defaultHeader}
              logo={item.logo || defaultLogo}
              namaInovator={item.namaInovator}
              jumlahDesaDampingan={item.jumlahDesaDampingan}
              jumlahInovasi={item.jumlahInovasi}
              ranking={idx + 1}
              onClick={() =>
                navigate(
                  generatePath(paths.INNOVATOR_PROFILE_PAGE, { id: item.id })
                )
              }
            />
          ))}
        </Horizontal>
      </CardContainer>
    </Box>
  );
}

export default Innovator;

