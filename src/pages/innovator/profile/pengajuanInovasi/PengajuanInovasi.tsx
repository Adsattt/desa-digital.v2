import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Button,
  Flex,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Stack,
} from '@chakra-ui/react';
import TopBar from 'Components/topBar';
import React, { useEffect, useState } from 'react';
import Container from "Components/container";
import { useNavigate, generatePath } from 'react-router-dom';
import { auth } from "../../../../firebase/clientApp";
import { paths } from "Consts/path";
import { useAuthState } from "react-firebase-hooks/auth";
import SearchBarVil from '../../components/hero/SearchBarVil';
import Dropdown from "../../components/hero/Filter";
import { DocumentData } from "firebase/firestore";
import { getDocuments } from "../../../../firebase/inovationTable";
import CardNotification from "Components/card/notification/CardNotification";

const PengajuanInovasi: React.FC = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [data, setData] = useState<DocumentData[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return; // pastikan user sudah login

      try {
        const innovations = await getDocuments("innovations");
        const filtered = innovations.filter((item) => item.innovatorId === user.uid); // filter berdasarkan uid user
        setData(filtered);
      } catch (error) {
        console.error("Error fetching innovations:", error);
      }
    };

    fetchData();
  }, [user]); // reload saat user berubah

  const handleCardClick = (id: string) => {
    navigate(
      generatePath(paths.DETAIL_INNOVATION_PAGE, { id })
    )
  };

  const formatTimestamp = (timestamp: { seconds: number; nanoseconds: number }) => {
    if (!timestamp?.seconds) return "Invalid Date";
    return new Date(timestamp.seconds * 1000).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Container page>
      <TopBar title="Pengajuan Inovasi" onBack={() => navigate(-1)} />
      <Stack padding="0 16px" gap={2}>
        {/* Search Bar dan Filter */}
        <Flex
          padding="16px 0px"
          justifyContent="flex-end"
          alignItems="center"
          gap={2}
          mt="px"
          mb="-20px"
        >
          <SearchBarVil
            placeholder="Cari inovasi di sini"
            onChange={(value) => setSearchKeyword(value)}
          />
          <Popover>
            <PopoverTrigger>
              <Button
                sx={{ _hover: { bg: "none", borderColor: "#347357" } }}
                display="flex"
                variant="outline"
                borderColor="gray.300"
                borderRadius="8px"
                padding="8px 16px"
                width="80px"
                height="35px"
                fontWeight="200"
                fontSize="12px"
                color="gray.600"
                rightIcon={<ChevronDownIcon color="green.600" boxSize={4} />}
              >
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent
              sx={{
                display: "flex",
                width: "100%",
                right: "40px",
                borderRadius: "8px",
                boxShadow: "lg",
              }}
            >
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader fontSize="13px" fontWeight="600" fontFamily="Inter" color="#1f2937">
                Filter Pilihan
              </PopoverHeader>
              <PopoverBody fontFamily="Inter">
                <Dropdown
                  placeholder="Filter Status"
                  options={[
                    { id: "Menunggu", name: "Menunggu" },
                    { id: "Ditolak", name: "Ditolak" },
                    { id: "Terverifikasi", name: "Terverifikasi" },
                  ]}
                  onChange={(selected) => setSelectedStatus(selected?.value || null)}
                />
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Flex>

        {/* List Card Innovation */}
        {data
          .filter((item) => {
            const keyword = searchKeyword.toLowerCase();
            const title = item.namaInovasi || "";
            return title.toLowerCase().includes(keyword);
          })
          .filter((item) => {
            if (!selectedStatus) return true;
            return item.status === selectedStatus;
          })
          .map((item, index) => (
            <CardNotification
              key={index}
              title={item.namaInovasi || "Tanpa Nama Inovasi"}
              status={item.status || "Unknown"}
              date={formatTimestamp(item.createdAt)}
              description={item.deskripsi || "Tidak ada deskripsi"}
              onClick={() => handleCardClick(item.id)}
            />
          ))}
      </Stack>
    </Container>
  );
};

export default PengajuanInovasi;