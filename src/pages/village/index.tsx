import { Box } from "@chakra-ui/react";
import CardVillage from "Components/card/village";
import { paths } from "Consts/path";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useQuery } from "react-query";
import { generatePath, useNavigate } from "react-router-dom";
import { getUsers } from "Services/userServices";
import { auth, firestore } from "../../firebase/clientApp";
import {
  CardContent,
  Column1,
  Column2,
  Containers,
  GridContainer,
  Text,
  Texthighlight,
} from "./_villageStyle";
import Dropdown from "./components/Filter";
import Hero from "./components/hero";
import SearchBarVil from "./components/SearchBarVil";

import defaultHeader from "@public/images/default-header.svg";
import defaultLogo from "@public/images/default-logo.svg";

import { collection, DocumentData, getDocs } from "firebase/firestore";
import { getProvinces, getRegencies } from "../../services/locationServices";

interface Location {
  id: string;
  name: string;
}

const Village: React.FC = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  //TODO nah ini selected province blm kepake. kayanya harus kepake
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [regencies, setRegencies] = useState<Location[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedRegency, setSelectedRegency] = useState<string>("");

  const villagesRef = collection(firestore, "villages");
  const [villages, setVillages] = useState<DocumentData[]>([]);

  const handleFetchProvinces = async () => {
    try {
      const provincesData: Location[] = await getProvinces();
      setProvinces(provincesData); // Simpan data apa adanya
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const handleFetchRegencies = async (provinceId: string) => {
    try {
      const regenciesData = await getRegencies(provinceId);
      setRegencies(regenciesData);
    } catch (error) {
      console.error("Error fetching regencies:", error);
    }
  };
  useEffect(() => {
    handleFetchProvinces();
  }, []);

  const handleProvinceChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const provinceId = event.target.value;
    const provinceName = event.target.options[event.target.selectedIndex].text;
    setSelectedProvince(provinceName);

    setRegencies([]);
    handleFetchRegencies(provinceId);
  };

  const handleRegencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const regencyName = event.target.options[event.target.selectedIndex].text;
    setSelectedRegency(regencyName);
  };

  const { data: users, isFetched } = useQuery<any>("villages", getUsers);
  // const villages = users?.filter((item: any) => item.role === "village");

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

  // filter villages by selected province and regency
  const filteredVillages = villages.filter((item: any) => {
    const isProvinceMatch =
      selectedProvince === "" || item.provinsi === selectedProvince;
    const isRegencyMatch =
      selectedRegency === "" || item.kabupatenKota === selectedRegency;
    return isProvinceMatch && isRegencyMatch;
  });

  //TODO: onchange dropdown juga perlu diperbaiki
  return (
    <Box>
      <Hero />
      <Containers>
        <CardContent>
          <Column1>
            <Column2>
              <Text>Pilih Provinsi</Text>
              <Dropdown
                placeholder="Pilih Provinsi"
                options={provinces} // Data provinsi yang sudah diformat
                onChange={handleProvinceChange}
              ></Dropdown>
            </Column2>
            <Column2>
              <Text>Pilih Kab/Kota</Text>
              <Dropdown
                placeholder="Pilih Kab/Kota"
                options={regencies} // Data provinsi yang sudah diformat
                onChange={handleRegencyChange}
              ></Dropdown>
            </Column2>
          </Column1>
          <Column1>
            <SearchBarVil
              placeholder="Cari desa" />
          </Column1>
        </CardContent>
        <Text>
          {" "}
          Menampilkan semua desa untuk{" "}
          <Texthighlight>"{selectedProvince || "Semua Provinsi"}"</Texthighlight>{" "}
        </Text>
        <GridContainer>
          {isFetched &&
            villages?.map((item: any, idx: number) => (
              <CardVillage
                key={idx}
                provinsi={item.provinsi}
                kabupatenKota={item.kabupatenKota}
                namaDesa={item.namaDesa}
                logo={item.logo || defaultLogo} // Logo default jika tidak ada
                header={item.header || defaultHeader} // Header default jika tidak ada
                id={item.userId}
                // {...item}
                onClick={() => {
                  const path = generatePath(paths.DETAIL_VILLAGE_PAGE, {
                    id: item.userId,
                  });
                  navigate(path);
                }}
              />
            ))}
        </GridContainer>
      </Containers>
    </Box>
  );
};

export default Village;
