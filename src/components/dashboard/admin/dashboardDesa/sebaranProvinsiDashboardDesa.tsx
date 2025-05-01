import {
    Box,
    Flex,
    Text,
    Button,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerCloseButton,
    SimpleGrid,
    Checkbox,
    useDisclosure,
} from "@chakra-ui/react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import { DownloadIcon } from "@chakra-ui/icons";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const SebaranProvinsiDashboardDesa: React.FC = () => {
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
    const [provinceData, setProvinceData] = useState<{ name: string; count: number }[]>([]);
    const [filteredData, setFilteredData] = useState(provinceData);
    const [markers, setMarkers] = useState<{ [key: string]: { lat: number; lon: number } }>({});

    async function getCoordinates(provinsi: string) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(provinsi + ", Indonesia")}`
            );
            const data = await response.json();
            if (data.length > 0) {
                return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
            }
        } catch (error) {
            console.error("Error fetching coordinates:", error);
        }
        return null;
    }

    const fetchProvinceData = async () => {
        try {
            const db = getFirestore();
            const villagesRef = collection(db, "villages");
            const snapshot = await getDocs(villagesRef);

            const provinceCount: { [key: string]: number } = {};
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.lokasi?.provinsi?.label) {
                    const province = data.lokasi.provinsi.label;
                    provinceCount[province] = (provinceCount[province] || 0) + 1;
                }
            });

            const chartData = Object.keys(provinceCount).map((province) => ({
                name: province,
                count: provinceCount[province],
            }));

            setProvinceData(chartData);
            setFilteredData(chartData);
        } catch (error) {
            console.error("Error fetching province data:", error);
        }
    };

    const handleDownloadExcel = () => {
        const excelData = provinceData.map((item, index) => ({
            No: index + 1,
            Provinsi: item.name,
            "Jumlah Desa Digital": item.count,
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sebaran Provinsi");

        XLSX.writeFile(workbook, "sebaran_provinsi_desa_digital.xlsx");
    };

    useEffect(() => {
        async function fetchCoordinates() {
            const newMarkers: { [key: string]: { lat: number; lon: number } } = {};
            for (const item of provinceData) {
                if (!newMarkers[item.name]) {
                    const coords = await getCoordinates(item.name);
                    if (coords) {
                        newMarkers[item.name] = coords;
                    }
                }
            }
            setMarkers(newMarkers);
        }

        fetchCoordinates();
    }, [provinceData]);

    useEffect(() => {
        fetchProvinceData();
    }, []);

    const provinces = provinceData.map((d) => d.name);

    const handleCheckboxChange = (provinsi: string) => {
        setSelectedProvinces((prev) =>
            prev.includes(provinsi) ? prev.filter((p) => p !== provinsi) : [...prev, provinsi]
        );
    };

    const applyFilter = () => {
        if (selectedProvinces.length === 0) {
            setFilteredData(provinceData);
        } else {
            setFilteredData(provinceData.filter((item) => selectedProvinces.includes(item.name)));
        }
        onClose();
    };

    return (
        <Box>
            {/* HEADER + FILTER + DOWNLOAD BUTTON */}
            <Flex justify="space-between" align="center" mt="24px" mx="15px">
                <Text fontSize="sm" fontWeight="bold" color="gray.800">
                    Sebaran Provinsi Desa Digital
                </Text>
                <Flex gap={2}>
                    <Button
                        size="sm"
                        bg="white"
                        boxShadow="md"
                        border="2px solid"
                        borderColor="gray.200"
                        px={2}
                        py={2}
                        display="flex"
                        alignItems="center"
                        _hover={{ bg: "gray.100" }}
                        cursor="pointer"
                        onClick={handleDownloadExcel}
                    >
                        <DownloadIcon boxSize={3} color="black" />
                    </Button>
                    <Button
                        size="sm"
                        bg="white"
                        boxShadow="md"
                        border="2px solid"
                        borderColor="gray.200"
                        px={2}
                        py={2}
                        display="flex"
                        alignItems="center"
                        _hover={{ bg: "gray.100" }}
                        cursor="pointer"
                        leftIcon={<Filter size={14} stroke="#1E5631" fill="#1E5631" />}
                        onClick={onOpen}
                    >
                        <Text fontSize="10px" fontWeight="medium" color="black" mr={1}>
                            Provinsi
                        </Text>
                    </Button>
                </Flex>
            </Flex>

            {/* LEAFLET MAP */}
            <Box
                bg="white"
                borderRadius="xl"
                pt="5px"
                pb="1px"
                mx="15px"
                boxShadow="md"
                borderColor="gray.200"
                mt={4}
                overflow="hidden"
                zIndex={1}
            >
                <MapContainer
                    center={[-2.5, 118]}
                    zoom={3}
                    style={{ height: "250px", width: "100%", borderRadius: "10px", zIndex: 1 }}
                    className="map-container"
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {filteredData.map((item, index) => {
                        const coords = markers[item.name];
                        if (!coords) return null;
                        return (
                            <Marker key={index} position={[coords.lat, coords.lon]}>
                                <Popup>
                                    <Text fontSize="sm" fontWeight="bold">{item.name}</Text>
                                    <Text fontSize="xs">Total Desa: {item.count}</Text>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </Box>

            {/* DRAWER FILTER PROVINSI */}
            <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent
                    sx={{
                        borderTopRadius: "lg",
                        width: "360px",
                        my: "auto",
                        mx: "auto",
                    }}
                >
                    <DrawerHeader display="flex" justifyContent="space-between" alignItems="center">
                        <Text fontSize="15px" fontWeight="bold">Filter Provinsi</Text>
                        <DrawerCloseButton />
                    </DrawerHeader>

                    <DrawerBody>
                        <SimpleGrid columns={2} spacingX={2} spacingY={2} w="full">
                            {provinces.map((provinsi) => (
                                <Checkbox
                                    key={provinsi}
                                    isChecked={selectedProvinces.includes(provinsi)}
                                    onChange={() => handleCheckboxChange(provinsi)}
                                >
                                    {provinsi}
                                </Checkbox>
                            ))}
                        </SimpleGrid>
                    </DrawerBody>

                    <DrawerFooter>
                        <Button bg="#1E5631" color="white" w="full" _hover={{ bg: "#16432D" }} onClick={applyFilter}>
                            Terapkan Filter
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </Box>
    );
};

export default SebaranProvinsiDashboardDesa;
