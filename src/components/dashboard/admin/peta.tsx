import React, { useEffect, useState } from 'react';
import {
    Box,
    Flex,
    Text,
    Spinner,
    Button as ChakraButton,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerFooter,
    DrawerCloseButton,
    Select,
    SimpleGrid,
    Button,
    useDisclosure,
} from '@chakra-ui/react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Filter } from 'lucide-react';

interface MarkerItem {
    name: string;
    lat: number;
    lon: number;
    details: { label: string; value: string | number }[];
    raw: any;
}

const Peta: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<'desa' | 'inovator' | 'inovasi'>('desa');
    const [markers, setMarkers] = useState<MarkerItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const { isOpen, onOpen, onClose } = useDisclosure();

    const [filterA, setFilterA] = useState<string>('');
    const [filterB, setFilterB] = useState<string>('');
    const [filterC, setFilterC] = useState<string>('');

    const fetchData = async () => {
        setLoading(true);
        const db = getFirestore();
        let colName = '';

        switch (selectedCategory) {
            case 'desa':
                colName = 'villages';
                break;
            case 'inovator':
                colName = 'innovators';
                break;
            case 'inovasi':
                colName = 'innovations';
                break;
        }

        try {
            const snapshot = await getDocs(collection(db, colName));
            const results: MarkerItem[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                const lat = parseFloat(data.latitude);
                const lon = parseFloat(data.longitude);

                if (!isNaN(lat) && !isNaN(lon)) {
                    let details: { label: string; value: string | number }[] = [];

                    if (selectedCategory === 'desa') {
                        details = [
                            { label: 'Nama Inovasi', value: data.namaInovasi || 'Tidak diketahui' },
                            { label: 'Jumlah Inovasi', value: data.jumlahInovasi || 0 },
                        ];
                    } else if (selectedCategory === 'inovator') {
                        details = [
                            { label: 'Jumlah Inovasi', value: data.jumlahInovasi || 0 },
                            { label: 'Jumlah Desa Dampingan', value: data.jumlahDesaDampingan || 0 },
                        ];
                    } else if (selectedCategory === 'inovasi') {
                        details = [
                            { label: 'Nama Inovator', value: data.namaInovator || 'Tidak diketahui' },
                            { label: 'Tahun Dibuat', value: data.tahunDibuat || 'Tidak diketahui' },
                        ];
                    }

                    let name = 'Tanpa Nama';
                    if (selectedCategory === 'desa') {
                        name = data.namaDesa || 'Tanpa Nama';
                    } else if (selectedCategory === 'inovator') {
                        name = data.namaInovator || 'Tanpa Nama';
                    } else if (selectedCategory === 'inovasi') {
                        name = data.namaInovasi || 'Tanpa Nama';
                    }

                    results.push({ name, lat, lon, details, raw: data });
                }
            });

            setMarkers(results);
        } catch (err) {
            console.error('Error fetching markers:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        setFilterA('');
        setFilterB('');
        setFilterC('');
    }, [selectedCategory]);

    const getCategoryLabel = () => {
        switch (selectedCategory) {
            case 'desa': return 'Desa Digital';
            case 'inovator': return 'Inovator';
            case 'inovasi': return 'Inovasi';
            default: return '';
        }
    };

    const handleFilterChange = (setter: any, convertToNumber = false) =>
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const value = convertToNumber ? Number(e.target.value) : e.target.value;
            setter(value);
        };

    const getFilterOptions = () => {
        const allData = markers.map(m => m.raw);
        let filtered = allData;

        if (filterA) {
            if (selectedCategory === 'desa') filtered = filtered.filter(item => item.provinsi === filterA);
            if (selectedCategory === 'inovator') filtered = filtered.filter(item => item.kategori === filterA);
            if (selectedCategory === 'inovasi') filtered = filtered.filter(item => item.tahunDibuat === filterA);
        }

        if (filterB) {
            if (selectedCategory === 'desa') filtered = filtered.filter(item => item.namaDesa === filterB);
            if (selectedCategory === 'inovator') filtered = filtered.filter(item => item.namaInovator === filterB);
            if (selectedCategory === 'inovasi') filtered = filtered.filter(item => item.namaInovasi === filterB);
        }

        const extractUnique = (data: any[], field: string) =>
            [...new Set(data.map(item => item[field]).filter(Boolean))];

        switch (selectedCategory) {
            case 'desa':
                return {
                    a: extractUnique(allData, 'provinsi'), // tetap global
                    b: extractUnique(filtered, 'namaDesa'),
                    c: extractUnique(filtered, 'kategoriInovasi')
                };
            case 'inovator':
                return {
                    a: extractUnique(allData, 'kategori'),
                    b: extractUnique(filtered, 'namaInovator')
                };
            case 'inovasi':
                return {
                    a: extractUnique(allData, 'tahunDibuat'), // tetap global
                    b: extractUnique(filtered, 'namaInovasi'),
                    c: extractUnique(filtered, 'kategori')
                };
            default:
                return { a: [], b: [], c: [] };
        }
    };


    const getFilteredMarkers = () => {
        return markers.filter((marker) => {
            const data = marker.raw;
            const conditions: boolean[] = [];

            if (filterA) {
                if (selectedCategory === 'desa') conditions.push(data.provinsi === filterA);
                if (selectedCategory === 'inovator') conditions.push(data.kategori === filterA);
                if (selectedCategory === 'inovasi') conditions.push(data.tahunDibuat === filterA);
            }
            if (filterB) {
                if (selectedCategory === 'desa') conditions.push(data.namaDesa === filterB);
                if (selectedCategory === 'inovator') conditions.push(data.namaInovator === filterB);
                if (selectedCategory === 'inovasi') conditions.push(data.namaInovasi === filterB);
            }
            if (filterC) {
                if (selectedCategory === 'desa') conditions.push(data.kategoriInovasi === filterC);
                if (selectedCategory === 'inovasi') conditions.push(data.kategori === filterC);
            }

            return conditions.every(Boolean);
        });
    };

    const filterOptions = getFilterOptions();

    return (
        <Box>
            <Flex justify="space-between" align="center" mt={2} mx="15px" mb={3}>
                <Text fontSize="md" fontWeight="bold" color="gray.800">
                    Peta {getCategoryLabel()}
                </Text>
            </Flex>
            <Flex gap={2}>
                {['desa', 'inovator', 'inovasi'].map((cat) => (
                    <ChakraButton
                        key={cat}
                        onClick={() => setSelectedCategory(cat as any)}
                        variant={selectedCategory === cat ? 'outline' : 'solid'}
                        fontSize="10"
                        ml={cat === 'desa' ? 4 : 0}
                        mr={cat === 'inovasi' ? 1 : 0}
                        height={8}
                        boxShadow={selectedCategory === cat ? 'none' : 'md'}
                        bg={selectedCategory === cat ? 'transparent' : '#347357'}
                        borderColor={selectedCategory === cat ? '#347357' : 'transparent'}
                        color={selectedCategory === cat ? '#347357' : 'white'}
                        _hover={{
                            bg: selectedCategory === cat ? 'transparent' : '#C5D9D1',
                            borderColor: '#347357',
                            color: '#347357',
                        }}
                        _active={{
                            bg: '#347357',
                            boxShadow: 'none',
                        }}
                    >
                        {cat === 'desa' ? 'Desa Digital' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </ChakraButton>
                ))}
                <ChakraButton
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
                    onClick={onOpen}
                    leftIcon={<Filter size={14} stroke="#1E5631" fill="#1E5631" />}
                >
                    <Text fontSize="10px" fontWeight="medium" color="black" mr={1}>
                        Filter
                    </Text>
                </ChakraButton>
            </Flex>

            <Box mt={4} mx={4} borderRadius="xl" overflow="hidden" boxShadow="md">
                {loading ? (
                    <Flex justify="center" align="center" height="250px">
                        <Spinner color="green.500" size="lg" />
                    </Flex>
                ) : (
                    <MapContainer center={[-2.5, 118]} zoom={3} style={{ height: '250px', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {getFilteredMarkers().map((marker, index) => (
                            <Marker key={index} position={[marker.lat, marker.lon]}>
                                <Popup>
                                    <Text fontWeight="bold" fontSize="sm">{marker.name}</Text>
                                    {marker.details.map((item, idx) => (
                                        <Text key={idx} fontSize="xs">{item.label}: {item.value}</Text>
                                    ))}
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </Box>

            <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent sx={{ borderTopRadius: 'lg', width: '360px', my: 'auto', mx: 'auto' }}>
                    <DrawerHeader display="flex" justifyContent="space-between" alignItems="center">
                        <Text fontSize="15px" fontWeight="bold">Filter {getCategoryLabel()}</Text>
                        <DrawerCloseButton />
                    </DrawerHeader>

                    <DrawerBody>
                        <SimpleGrid columns={1} spacing={3}>
                            {/* Filter A */}
                            {filterOptions.a && (
                                <Select
                                    fontSize="sm" // label / tampilan luar tetap normal
                                    sx={{
                                        option: {
                                            fontSize: '9px',           // perkecil hanya isi opsi
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }
                                    }}
                                    placeholder={`Pilih ${selectedCategory === 'desa'
                                        ? 'Provinsi'
                                        : selectedCategory === 'inovator'
                                            ? 'Kategori'
                                            : 'Tahun Dibuat'
                                        }`}
                                    value={filterA}
                                    onChange={handleFilterChange(setFilterA, selectedCategory === 'inovasi')} // hanya konversi ke number untuk inovasi
                                >
                                    {filterOptions.a.map((val) => (
                                        <option key={val} value={val}>{val}</option>
                                    ))}
                                </Select>
                            )}

                            {/* Filter B */}
                            {filterOptions.b && (
                                <Select
                                    fontSize="sm" // label / tampilan luar tetap normal
                                    sx={{
                                        option: {
                                            fontSize: '9px',           // perkecil hanya isi opsi
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }
                                    }}
                                    placeholder="Pilih Nama Inovator"
                                    value={filterB}
                                    onChange={handleFilterChange(setFilterB)}
                                >
                                    {filterOptions.b.map((val) => (
                                        <option key={val} value={val}>{val}</option>
                                    ))}
                                </Select>

                            )}

                            {/* Filter C */}
                            {filterOptions.c && (
                                <Select
                                fontSize="sm" // label / tampilan luar tetap normal
                                    sx={{
                                        option: {
                                            fontSize: '9px',           // perkecil hanya isi opsi
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }
                                    }}
                                    placeholder={`Pilih ${selectedCategory === 'desa'
                                        ? 'Kategori Inovasi'
                                        : 'Kategori'
                                        }`}
                                    value={filterC}
                                    onChange={handleFilterChange(setFilterC)}
                                >
                                    {filterOptions.c.map((val) => (
                                        <option key={val} value={val}>{val}</option>
                                    ))}
                                </Select>
                            )}
                        </SimpleGrid>
                    </DrawerBody>

                    <DrawerFooter>
                        <Button bg="#1E5631" color="white" w="full" _hover={{ bg: '#16432D' }} onClick={onClose}>
                            Terapkan Filter
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </Box>
    );
};

export default Peta;