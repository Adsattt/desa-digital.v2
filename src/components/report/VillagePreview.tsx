import {
  Box,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useDisclosure,
} from "@chakra-ui/react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const PreviewDocs: React.FC = () => {
    const [desaData, setDesaData] = useState<DesaData[]>([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [filteredDesaData, setFilteredDesaData] = useState<DesaData[]>([]);
    const [provinceList, setProvinceList] = useState<string[]>([]);
    const [kabupatenList, setKabupatenList] = useState<string[]>([]);
    const [kecamatanList, setKecamatanList] = useState<string[]>([]);

    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedKabupaten, setSelectedKabupaten] = useState("");
    const [selectedKecamatan, setSelectedKecamatan] = useState("");

    const [filteredKabupatenList, setFilteredKabupatenList] = useState<string[]>([]);
    const [filteredKecamatanList, setFilteredKecamatanList] = useState<string[]>([]);

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchDesaData();
    }, []);
    const fetchDesaData = async () => {
        try {
          const db = getFirestore();
          const villagesRef = collection(db, "villages");
          const snapshot = await getDocs(villagesRef);
    
          const desaList: DesaData[] = [];
          const provinceSet = new Set<string>();
          const kabupatenSet = new Set<string>();
          const kecamatanSet = new Set<string>();
    
          let i = 1;
    
          snapshot.docs.forEach((doc) => {
            const data = doc.data();
    
            const namaDesa = data.namaDesa?.trim() || "";
            const status = data.kesiapanDigital?.trim() || "";
            const jalan = data.infrastrukturDesa?.trim() || "";
            const provinsi = data.lokasi?.provinsi?.label?.trim() || "";
            const kabupaten = data.lokasi?.kabupatenKota?.label?.trim() || "";
            const kecamatan = data.lokasi?.kecamatan?.label?.trim() || "";
    
            if (
              !namaDesa || namaDesa.toLowerCase().includes("lorem ipsum") ||
              !status || status.toLowerCase().includes("lorem ipsum") ||
              !jalan || jalan.toLowerCase().includes("lorem ipsum") ||
              !provinsi || provinsi.toLowerCase().includes("lorem ipsum") ||
              !kabupaten || kabupaten.toLowerCase().includes("lorem ipsum") ||
              !kecamatan || kecamatan.toLowerCase().includes("lorem ipsum")
            ) {
              return;
            }
    
            const limitWords = (text: string) => text.split(" ").slice(0, 3).join(" ");
    
            desaList.push({
              no: i++,
              desa: limitWords(namaDesa),
              status: limitWords(status),
              jalan: limitWords(jalan),
              provinsi: limitWords(provinsi),
              kabupaten: limitWords(kabupaten),
              kecamatan: limitWords(kecamatan),
            });
    
            provinceSet.add(provinsi);
            kabupatenSet.add(kabupaten);
            kecamatanSet.add(kecamatan);
          });
    
          setDesaData(desaList);
          setFilteredDesaData(desaList);
          setProvinceList([...provinceSet]);
          setKabupatenList([...kabupatenSet]);
          setKecamatanList([...kecamatanSet]);
        } catch (error) {
          console.error("❌ Error fetching desa data:", error);
        }
      };
    
      useEffect(() => {
        if (selectedProvince) {
          const filteredKabupaten = desaData.filter(d => d.provinsi === selectedProvince).map(d => d.kabupaten);
          setFilteredKabupatenList([...new Set(filteredKabupaten)]);
          setSelectedKabupaten("");
          setFilteredKecamatanList([]);
        } else {
          setFilteredKabupatenList(kabupatenList);
        }
      }, [selectedProvince, desaData]);
    
      useEffect(() => {
        if (selectedKabupaten) {
          const filteredKecamatan = desaData.filter(d => d.kabupaten === selectedKabupaten).map(d => d.kecamatan);
          setFilteredKecamatanList([...new Set(filteredKecamatan)]);
          setSelectedKecamatan("");
        } else {
          setFilteredKecamatanList(kecamatanList);
        }
      }, [selectedKabupaten, desaData]);
    
      const useFilter = () => {
        if (!selectedProvince && !selectedKabupaten && !selectedKecamatan) {
          const resetData = desaData.map((item, index) => ({
            ...item,
            no: index + 1,
          }));
          setFilteredDesaData(resetData);
          onClose();
          return;
        }
    
        let filtered = desaData;
    
        if (selectedProvince) {
          filtered = filtered.filter((d) => d.provinsi === selectedProvince);
        }
        if (selectedKabupaten) {
          filtered = filtered.filter((d) => d.kabupaten === selectedKabupaten);
        }
        if (selectedKecamatan) {
          filtered = filtered.filter((d) => d.kecamatan === selectedKecamatan);
        }
      }

    interface DesaData {
        no: number;
        desa: string;
        status: string;
        jalan: string;
        provinsi: string;
        kabupaten: string;
        kecamatan: string;
     }

     const currentData = filteredDesaData.slice((currentPage - 1));

    return (
        <Box>
            {/* Table */}
            <Box bg="white" borderRadius="xl" pt={0} pb={3} mx="15px" boxShadow="md" mt={4}>
            <TableContainer>
                <Table variant="simple" size="sm">
                <Thead bg="#F0FFF4">
                    <Tr>
                    <Th p={3} fontSize="8px" textAlign="center">No</Th>
                    <Th p={1} fontSize="8px" textAlign="center">Desa</Th>
                    <Th p={1} fontSize="8px" textAlign="center">Status Desa</Th>
                    <Th p={1} fontSize="8px" textAlign="center">Infrastruktur Jalan</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {currentData.map((row) => (
                    <Tr key={row.no}>
                        <Td p={1} fontSize="8px" textAlign="center" fontWeight="bold">{row.no}</Td>
                        <Td p={1} fontSize="8px" textAlign="center">{row.desa}</Td>
                        <Td p={1} fontSize="8px" textAlign="center">{row.status}</Td>
                        <Td p={1} fontSize="8px" textAlign="center">{row.jalan}</Td>
                    </Tr>
                    ))}
                </Tbody>
                </Table>
            </TableContainer>
        </Box>
        </Box>
    )
}

export default PreviewDocs;