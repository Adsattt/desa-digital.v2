import { AddIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Stack,
  Tooltip,
} from "@chakra-ui/react";
import Ads from "Components/ads/Ads";
import BestBanner from "Components/banner/BestBanner";
import Container from "Components/container";
import Dashboard from "Components/dashboard/dashboard";
import Loading from "Components/loading";
import Rediness from "Components/rediness/Rediness";
import SearchBarLink from "Components/search/SearchBarLink";
import TopBar from "Components/topBar";
import { paths } from "Consts/path";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "src/contexts/UserContext";
import Hero from "./components/hero";
import Innovator from "./components/innovator";
import Menu from "./components/menu";

function Home() {
  const navigate = useNavigate();
  const { role, isInnovatorVerified, loading } = useUser()

  if (loading) {
    return <Loading />
  }

  const handleAddInnovationClick = () => {
    if (role === "innovator" && isInnovatorVerified) {
      navigate(paths.ADD_INNOVATION);
    } else {
      toast.warning(
        "Akun anda belum terdaftar atau terverifikasi sebagai inovator",
        {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
    }
  };

  return (
    <Container page>
      <TopBar title="Desa Digital Indonesia" />
      <Hero
        description="KMS Desa Digital"
        text="Indonesia"
        isAdmin={role === "Admin"}
        isInnovator={role === "innovator"}
        isVillage={role === "village"}
      />
      <Stack direction="column" gap={2}>
        <SearchBarLink placeholderText="Cari Inovasi atau inovator di sini..." />
        <Menu />
        <Flex direction="row" justifyContent="space-between" padding="0 14px">
          <Rediness />
          <Ads />
        </Flex>
        {role === "village" && <Dashboard />}
        <BestBanner />
        <Box mt="120px">
          <Innovator />
        </Box>
      </Stack>
      {role === "innovator" && (
        <Tooltip
          label="Tambah Inovasi"
          aria-label="Tambah Inovasi Tooltip"
          placement="top"
          hasArrow
          bg="#347357"
          color="white"
          fontSize="12px"
          p={1}
          borderRadius="8"
        >
          <Button
            borderRadius="50%"
            width="60px"
            height="60px"
            padding="0"
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="fixed"
            zIndex="999"
            bottom="75px"
            marginLeft="267px"
            marginRight="33px"
            marginBottom="1"
            onClick={handleAddInnovationClick}
          >
            <IconButton icon={<AddIcon />} aria-label="Tambah Inovasi" />
          </Button>
        </Tooltip>
      )}
    </Container>
  );
}

export default Home;
