import TopBar from "Components/topBar";
import { useNavigate } from "react-router-dom";
import ReactSelect from "react-select";
import { NavbarButton } from "./_reportStyle";
import { MinusIcon } from "@chakra-ui/icons";
import { paths } from "Consts/path";
import {
  Box,
  Button,
  Stack,
  Flex,
  Input,
  useToast,
  Text,
} from "@chakra-ui/react";
import LocationSelector from "Components/form/LocationSellector";
import { useEffect, useState } from "react";
import {
  getDistricts,
  getProvinces,
  getRegencies,
  getVillages,
} from "../../../services/locationServices";

interface Option {
  value: string;
  label: string;
}

const categories = [
  "Agribisnis",
  "Akademisi",
  "Dibawah Pemerintah",
  "Layanan Finansial",
  "Lembaga Swadaya Masyarakat (LSM)",
  "Organisasi Pertanian",
  "Pemerintah Daerah",
  "Perusahaan",
  "Start Up",
  "UMKM",
];

const status = [
  "Semua",
  "Terverifikasi",
  "Menunggu",
  "Ditolak",
]

const ReportAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [isEditable, setIsEditable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{
      label: string;
      value: string;
    } | null>(null);
const [selectedStatus, setSelectedStatus] = useState<{
      label: string;
      value: string;
    } | null>(null);

  const [role, setRole] = useState<Option | null>(null);
  const roleOptions: Option[] = [
    { value: "village", label: "Desa" },
    { value: "innovator", label: "Innovator" },
  ];

  const [provinces, setProvinces] = useState<Option[]>([]);
  const [regencies, setRegencies] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [villages, setVillages] = useState<Option[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<Option | null>(null);
  const [selectedRegency, setSelectedRegency] = useState<Option | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<Option | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<Option | null>(null);

  const [textInputsValue, setTextInputsValue] = useState({
      name: "",
      minDate: "",
      maxDate: "",
      link: "",
    });

  const fetchProvinces = async () => {
    try {
      const provincesData = await getProvinces();
      setProvinces(
        provincesData.map((loc) => ({ value: loc.id, label: loc.name }))
      );
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const fetchRegencies = async (provinceId: string) => {
    try {
      const regenciesData = await getRegencies(provinceId);
      setRegencies(
        regenciesData.map((loc) => ({ value: loc.id, label: loc.name }))
      );
    } catch (error) {
      console.error("Error fetching regencies:", error);
    }
  };

  const fetchDistricts = async (regencyId: string) => {
    try {
      const districtsData = await getDistricts(regencyId);
      setDistricts(
        districtsData.map((loc) => ({ value: loc.id, label: loc.name }))
      );
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const fetchVillages = async (districtId: string) => {
    try {
      const villagesData = await getVillages(districtId);
      setVillages(
        villagesData.map((loc) => ({ value: loc.id, label: loc.name }))
      );
    } catch (error) {
      console.error("Error fetching villages:", error);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  const handleProvinceChange = (selected: Option | null) => {
    setSelectedProvince(selected);
    setSelectedRegency(null);
    setSelectedDistrict(null);
    setSelectedVillage(null);
    setRegencies([]);
    setDistricts([]);
    setVillages([]);
    if (selected) fetchRegencies(selected.value);
  };

  const handleRegencyChange = (selected: Option | null) => {
    setSelectedRegency(selected);
    setSelectedDistrict(null);
    setSelectedVillage(null);
    setDistricts([]);
    setVillages([]);
    if (selected) fetchDistricts(selected.value);
  };

  const handleDistrictChange = (selected: Option | null) => {
    setSelectedDistrict(selected);
    setSelectedVillage(null);
    setVillages([]);
    if (selected) fetchVillages(selected.value);
  };

  const handleVillageChange = (selected: Option | null) => {
    setSelectedVillage(selected);
  };

  const categoryOptions = categories.map((category) => ({
    label: category, // Label yang ditampilkan pada dropdown
    value: category.toLowerCase().replace(/\s+/g, "-"), // Menggunakan format value yang lebih aman
  }));

  const statusOptions = status.map((category) => ({
    label: category, // Label yang ditampilkan pada dropdown
    value: category.toLowerCase().replace(/\s+/g, "-"), // Menggunakan format value yang lebih aman
  }));

  const handleCategoryChange = (
    selectedOption: { label: string; value: string } | null
  ) => {
    setSelectedCategory(selectedOption);
  };

  const handleStatusChange = (
    selectedOption: { label: string; value: string } | null
  ) => {
    setSelectedStatus(selectedOption);
  };

  const onTextChange = ({
      target: { name, value },
    }: React.ChangeEvent<HTMLInputElement>) =>
      setTextInputsValue({ ...textInputsValue, [name]: value });

  const customStyles = {
    control: (styles: any) => ({
      ...styles,
      fontSize: "14px",
      borderColor: "#none",
      boxShadow: "none",
      ":hover": {
        borderColor: "#3367D1",
      },
    }),
    menu: (base: any) => ({
      ...base,
      marginTop: 0,
      zIndex: 10,
    }),
    option: (base: any, state: { isFocused: any }) => ({
      ...base,
      fontSize: "14px",
      padding: "2px 10px",
      backgroundColor: state.isFocused ? "#E5E7EB" : "white",
      color: "black",
      cursor: "pointer",
      ":active": {
        backgroundColor: "#D1D5DB",
      },
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#9CA3AF",
    }),
  };

  return (
    <Flex height="100vh" direction="column">
        <TopBar title="Report Admin" onBack={() => navigate(-1)} />
        <Stack gap="16px" paddingTop="30px" />

        <Box flex="1" p="0 16px">
            <form>
                <Stack spacing="12px" width="100%" marginTop="48px">
                    {/* Pilih Role terlebih dahulu */}
                    <Text fontWeight="400" fontSize="14px" mb="-2">
                        Role <span style={{ color: "red" }}>*</span>
                    </Text>
                    <ReactSelect
                        placeholder="Pilih Role"
                        options={roleOptions}
                        value={role}
                        styles={customStyles}
                        isClearable
                        isSearchable
                        isDisabled={!isEditable}
                        onChange={(selected) => setRole(selected)}
                    />

                {/* Form tambahan hanya muncul setelah role dipilih */}
                {role?.value === "village" && (
                    <>
                    <LocationSelector
                        label="Provinsi"
                        placeholder="Pilih Provinsi"
                        options={provinces}
                        value={selectedProvince}
                        onChange={handleProvinceChange}
                        isRequired
                        disabled={!isEditable}
                    />

                    <LocationSelector
                        label="Kabupaten/Kota"
                        placeholder="Pilih Kabupaten/Kota"
                        options={regencies}
                        value={selectedRegency}
                        onChange={handleRegencyChange}
                        isDisabled={!selectedProvince}
                        isRequired
                        disabled={!isEditable}
                    />
                    <LocationSelector
                        label="Kecamatan"
                        placeholder="Pilih Kecamatan"
                        options={districts}
                        value={selectedDistrict}
                        onChange={handleDistrictChange}
                        isDisabled={!selectedRegency}
                        isRequired
                        disabled={!isEditable}
                    />
                    <LocationSelector
                        label="Desa/Kelurahan"
                        placeholder="Pilih Kelurahan"
                        options={villages}
                        value={selectedVillage}
                        onChange={handleVillageChange}
                        isDisabled={!selectedDistrict}
                        isRequired
                        disabled={!isEditable}
                    />
                    <Text fontWeight="400" fontSize="14px" mb="-2">
                        Status Klaim <span style={{ color: "red" }}>*</span>
                    </Text>
                    <ReactSelect
                        placeholder="Status Klaim"
                        options={statusOptions}
                        value={selectedStatus}
                        onChange={handleStatusChange}
                        styles={customStyles}
                        isClearable
                        isSearchable
                        isDisabled={!isEditable}
                    />
                    <Text fontSize="14px" fontWeight="400" mb="-2">
                        Tanggal <span style={{ color: "red" }}>*</span>
                    </Text>
                    <Flex align="center" justify="space-between">
                        <Input
                            placeholder="DD/MM/YYYY"
                            name="minDate"
                            fontSize="10pt"
                            _placeholder={{ color: "gray.500" }}
                            mt={2}
                            type="date"
                            maxW="150px"
                            value={textInputsValue.minDate}
                            onChange={onTextChange}
                        />
                        <MinusIcon fontSize="8pt" />
                        <Input
                            placeholder="DD/MM/YYYY"
                            name="maxDate"
                            fontSize="10pt"
                            _placeholder={{ color: "gray.500" }}
                            mt={2}
                            type="date"
                            maxW="150px"
                            value={textInputsValue.maxDate}
                            onChange={onTextChange}
                        />
                    </Flex>
                    </>
                )}

                {/* Untuk role innovator, tambahkan field lain di sini jika ada */}
                {role?.value === "innovator" && (
                    <>
                    {/* Tambahkan form khusus innovator */}
                    <Text fontWeight="400" fontSize="14px" mb="-2">
                        Kategori Inovator <span style={{ color: "red" }}>*</span>
                    </Text>

                    <ReactSelect
                        placeholder="Pilih kategori"
                        options={categoryOptions}
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        styles={customStyles}
                        isClearable
                        isSearchable
                        isDisabled={!isEditable}
                    />
                    <Text fontWeight="400" fontSize="14px" mb="-2">
                        Status Inovasi <span style={{ color: "red" }}>*</span>
                    </Text>
                    <ReactSelect
                        placeholder="Status Inovasi"
                        options={statusOptions}
                        value={selectedStatus}
                        onChange={handleStatusChange}
                        styles={customStyles}
                        isClearable
                        isSearchable
                        isDisabled={!isEditable}
                    />
                    <Text fontSize="14px" fontWeight="400" mb="-2">
                        Tanggal <span style={{ color: "red" }}>*</span>
                    </Text>
                    <Flex align="center" justify="space-between">
                        <Input
                            placeholder="DD/MM/YYYY"
                            name="minDate"
                            fontSize="10pt"
                            _placeholder={{ color: "gray.500" }}
                            mt={2}
                            type="date"
                            maxW="150px"
                            value={textInputsValue.minDate}
                            onChange={onTextChange}
                        />
                        <MinusIcon fontSize="8pt" />
                        <Input
                            placeholder="DD/MM/YYYY"
                            name="maxDate"
                            fontSize="10pt"
                            _placeholder={{ color: "gray.500" }}
                            mt={2}
                            type="date"
                            maxW="150px"
                            value={textInputsValue.maxDate}
                            onChange={onTextChange}
                        />
                    </Flex>
                    </>
                )}
                </Stack>
            </form>
        </Box>
        {role && (
            <NavbarButton>
                <Button
                    type="submit"
                    fontSize={14}
                    width="100%"
                    height="44px"
                    isLoading={loading} 
                    onClick={() => {navigate(paths.PREVIEW_REPORT_ADMIN)}}
                    >
                    Preview Report
                </Button>
            </NavbarButton>
        )}
    </Flex>
  );
};

export default ReportAdmin;