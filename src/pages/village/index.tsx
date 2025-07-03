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

  const [provinces, setProvinces] = useState<Location[]>([]);
  const [regencies, setRegencies] = useState<Location[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedRegency, setSelectedRegency] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const villagesRef = collection(firestore, "villages");
  const [villages, setVillages] = useState<DocumentData[]>([]);

  const handleFetchProvinces = async () => {
    try {
      const provincesData: Location[] = await getProvinces();
      setProvinces(provincesData);
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

  const handleProvinceChange = (selected: { label: string; value: string } | null) => {
    if (selected) {
      setSelectedProvince(selected.label);
      setSelectedRegency("");
      setRegencies([]);
      handleFetchRegencies(selected.value);
    } else {
      setSelectedProvince("");
      setSelectedRegency("");
      setRegencies([]);
    }
  };
  
  const handleRegencyChange = (selected: { label: string; value: string } | null) => {
    if (selected) {
      setSelectedRegency(selected.label);
    } else {
      setSelectedRegency("");
    }
  };  

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const { data: users, isFetched } = useQuery<any>("villages", getUsers);

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
          status: data.status,
        };
      })
        .filter((item) => item.status === 'Terverifikasi');
      setVillages(villagesData);
    };
    fetchData();
  }, []);

  const filteredVillages = villages.filter((item: any) => {
    const matchProvince =
      selectedProvince === "" || item.provinsi === selectedProvince;
    const matchRegency =
      selectedRegency === "" || item.kabupatenKota === selectedRegency;
    const matchSearch =
      searchTerm === "" ||
      item.namaDesa.toLowerCase().includes(searchTerm.toLowerCase());
    return matchProvince && matchRegency && matchSearch;
  });

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
                options={provinces}
                onChange={handleProvinceChange}
              />
            </Column2>
            <Column2>
              <Text>Pilih Kab/Kota</Text>
              <Dropdown
                placeholder="Pilih Kab/Kota"
                options={regencies}
                onChange={handleRegencyChange}
              />
            </Column2>
          </Column1>
          <Column1>
            <SearchBarVil
              placeholder="Cari nama desa..."
              onChange={(keyword: string) => setSearchTerm(keyword)}
            />
          </Column1>
        </CardContent>
        <Text>
          Menampilkan semua desa untuk{" "}
          <Texthighlight>
            "{selectedProvince || "Semua Provinsi"}"
          </Texthighlight>
        </Text>
        <GridContainer>
          {isFetched &&
            filteredVillages.map((item: any, idx: number) => (
              <CardVillage
                key={idx}
                provinsi={item.provinsi}
                kabupatenKota={item.kabupatenKota}
                namaDesa={item.namaDesa}
                logo={item.logo || defaultLogo}
                header={item.header || defaultHeader}
                id={item.userId}
                isHome={false}
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