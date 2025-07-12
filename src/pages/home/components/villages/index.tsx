import { Box } from "@chakra-ui/react";
import CardVillage from "Components/card/village";
import { paths } from "Consts/path";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { generatePath, useNavigate } from "react-router-dom";
import { getUsers } from "Services/userServices";
import { firestore } from "../../../../firebase/clientApp";
import { CardContainer, Horizontal, Title } from "./_villagesStyle";

import defaultHeader from "@public/images/default-header.svg";
import defaultLogo from "@public/images/default-logo.svg";

import {
  collection,
  DocumentData,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";

const Village: React.FC = () => {
  const navigate = useNavigate();
  const [villages, setVillages] = useState<DocumentData[]>([]);
  // const { data: isFetched } = useQuery<any>("villages", getUsers);

  useEffect(() => {
    const fetchData = async () => {
      const villagesRef = collection(firestore, "villages");
      const q = query(
        villagesRef,
        orderBy("jumlahInovasiDiterapkan", "desc"), // Urutkan dari inovasi terbanyak
        limit(5) // Ambil hanya 5 desa teratas
      );

      const snapShot = await getDocs(q);
      const villagesData = snapShot.docs.map((doc) => ({
        id: doc.id, // Selalu sertakan ID unik dari dokumen
        ...doc.data(),
      }));
      setVillages(villagesData);
    };
    fetchData();
  }, []);

  return (
    <Box padding="0 14px">
      <Title>Desa Unggulan</Title>
      <CardContainer>
        <Horizontal>
          {villages.map((item: any, idx: number) => (
            <CardVillage
              isHome={true}
              key={item.id} // ✅ Gunakan ID dokumen yang unik
              namaDesa={item.namaDesa || item.lokasi?.desaKelurahan?.label}
              logo={item.logo || defaultLogo}
              header={item.header || defaultHeader}
              kabupatenKota={
                item.kabupatenKota || item.lokasi?.kabupatenKota?.label
              }
              provinsi={item.provinsi || item.lokasi?.provinsi?.label}
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
};

export default Village;
