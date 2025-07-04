import { Box } from "@chakra-ui/react";
import CardInnovator from "Components/card/innovator";
import { paths } from "Consts/path";
import { DocumentData, collection, getDocs } from "firebase/firestore";
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
  const innovatorsRef = collection(firestore, "innovators");
  const [innovators, setInnovators] = useState<DocumentData[]>([]);

  useEffect(() => {
  const fetchInnovators = async () => {
    const innovatorsSnapshot = await getDocs(innovatorsRef);
    const innovatorsData: InnovatorData[] = innovatorsSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          namaInovator: data.namaInovator,
          jumlahDesaDampingan: data.jumlahDesaDampingan,
          jumlahInovasi: data.jumlahInovasi,
          header: data.header,
          logo: data.logo,
          status: data.status,
        };
      })
      .filter((item) => item.status === 'Terverifikasi'); // Filter hanya inovator yang terverifikasi

    setInnovators(innovatorsData);
  };
  fetchInnovators();
}, [innovatorsRef]);


  return (
    <Box padding="0 14px">
      <Title>Inovator Unggulan</Title>
      <CardContainer>
        <Horizontal>
          {/* {innovators.map((item, idx) => (
            <CardInnovator
              key={idx}
              id={item.id}
              header={item.header || defaultHeader}
              logo={item.logo || defaultLogo}
              namaInovator={item.namaInovator}
              jumlahDesaDampingan={item.jumlahDesaDampingan}
              jumlahInovasi={item.jumlahInovasi}
              onClick={() =>
                navigate(
                  generatePath(paths.INNOVATOR_PROFILE_PAGE, { id: item.id })
                )
              }
            />
          ))} */}
          {[...innovators]
          .sort((a, b) => {
              if (b.jumlahDesaDampingan !== a.jumlahDesaDampingan){
                return b.jumlahDesaDampingan - a.jumlahDesaDampingan;
              }
              return a.namaInovator.localeCompare(b.namaInovator);
            }) 
          .slice(0, 5) // ambil 5 teratas
          .map((item, idx) => (
            <CardInnovator
              key={idx}
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
