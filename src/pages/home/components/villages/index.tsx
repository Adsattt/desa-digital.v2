import { Box } from "@chakra-ui/react";
import { paths } from "Consts/path";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useQuery } from "react-query";
import { generatePath, useNavigate } from "react-router-dom";
import { getUsers } from "Services/userServices";
import { auth, firestore } from "../../../../firebase/clientApp";
import {Title, Horizontal, CardContainer} from "./_villagesStyle";
import defaultHeader from "@public/images/default-header.svg";
import defaultLogo from "@public/images/default-logo.svg";
import {collection, DocumentData, getDocs } from "firebase/firestore";
import CardVillage from "Components/card/village";

interface Location {
  id: string;
  name: string;
}

  const Village: React.FC = () => {
  const navigate = useNavigate();
  const villagesRef = collection(firestore, "villages");
  const [villages, setVillages] = useState<DocumentData[]>([]);

  const { data: isFetched } = useQuery<any>("villages", getUsers);

  useEffect(() => {
    const fetchData = async () => {
      const snapShot = await getDocs(villagesRef);
      const villagesData = snapShot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          provinsi: data.lokasi?.provinsi?.label || "",
          kabupatenKota: data.lokasi?.kabupatenKota?.label || "",
          namaDesa: data.lokasi?.desaKelurahan?.label || "",
        };
      });
      console.log("villagesData", villagesData);
      setVillages(villagesData);
    };
    fetchData();
  }, [villagesRef]);

return (
  <Box padding="0 14px">
    <Title>Desa Unggulan</Title>
    <CardContainer>
      <Horizontal>
      {isFetched &&
      [...villages]
        .sort((a, b) => {
          if (b.jumlahInovasiDiterapkan !== a.jumlahInovasiDiterapkan) {
            return b.jumlahInovasiDiterapkan - a.jumlahInovasiDiterapkan; 
          }
          return a.namaDesa.localeCompare(b.namaDesa); 
        })
        .slice(0, 5)
        .map((item: any, idx: number) => (
          <CardVillage isHome={true}
            key={idx}
            namaDesa={item.namaDesa}
            logo={item.logo || defaultLogo}
            header={item.header || defaultHeader}
            kabupatenKota={item.kabupatenKota}
            provinsi={item.provinsi}
            jumlahInovasiDiterapkan={item.jumlahInovasiDiterapkan}
            ranking={idx + 1}
            id={item.userId}
            onClick={() => {
              const path = generatePath(paths.DETAIL_VILLAGE_PAGE, {
                id: item.userId,
              });
              navigate(path);
            }}
          />
        ))}
      </Horizontal>
    </CardContainer>
  </Box>
);
}

export default Village;
