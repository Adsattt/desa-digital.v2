import React from "react";
import { Flex, Text, Box } from "@chakra-ui/react";
import { generatePath, useNavigate } from "react-router-dom";
import CardInnovation from "Components/card/innovation";
import { paths } from "Consts/path";

const InnovationPreview = ({ innovations, innovatorId }: any) => {
  const navigate = useNavigate();
  const handleClick = (id: string) => {
    const path = generatePath(paths.DETAIL_INNOVATION_PAGE, { id });
    navigate(path);
  };

  // Cek jumlah inovasi
  const hasMoreInnovations = innovations.length > 2;
  const hasInnovations = innovations.length > 0;

  return (
    <Flex direction="column">
      {/* Header Produk Inovasi */}
      <Flex justify="space-between" align="center">
        <Text fontSize="16px" fontWeight="700">
          Produk Inovasi
        </Text>
        {hasMoreInnovations && (
          <Text
            fontSize="12px"
            fontWeight="500"
            color="#347357"
            cursor="pointer"
            textDecoration="underline"
            // onClick={() => navigate(`/innovator/${innovatorId}/all-innovations`)}
          >
            Lainnya
          </Text>
        )}
      </Flex>

      {/* Daftar Produk */}
      {!hasInnovations ? (
        <Text mt={2} color="gray.400" fontSize={12}> Belum memiliki produk inovasi </Text>
      ) : (
        <Flex
          mt={4}
          direction="row" // Mengatur elemen sebaris
          gap={4} // Jarak antar card
          wrap="wrap" // Membungkus ke baris baru jika layar tidak cukup lebar
          justify="flex-start" // Mengatur posisi card
          align="stretch"
        >
          {innovations.slice(0, 2).map((innovation: any, idx: number) => (
            <Box
              key={idx}
              width="calc(50% - 8px)"
              display="flex"
              flexDirection="column"
            >
              <CardInnovation
                images={innovation.images}
                namaInovasi={innovation.namaInovasi}
                kategori={innovation.kategori}
                deskripsi={innovation.deskripsi}
                tahunDibuat={innovation.tahunDibuat}
                innovatorLogo={innovation.innovatorImgURL}
                innovatorName={innovation.namaInnovator}
                onClick={() => handleClick(innovation.id)}
              />
            </Box>
          ))}
        </Flex>
      )}
    </Flex>
  );
};

export default InnovationPreview;
