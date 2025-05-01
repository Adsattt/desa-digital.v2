import Container from "Components/container";
import { paths } from "Consts/path";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { generatePath, useNavigate } from "react-router-dom";
import { getCategories } from "Services/categoryServices";
import { GridContainer, GridItem, MenuContainer } from "./_menuStyle";

import AgriFoodIcon from "@public/icons/agri-food.svg";
import EGovernmentIcon from "@public/icons/e-government.svg";
import InformationSystemIcon from "@public/icons/information-system.svg";
import LocalInfrastructureIcon from "@public/icons/local-infrastructure.svg";
import MenuAllIcon from "@public/icons/menu-all.svg";
import SmartAgriIcon from "@public/icons/smart-agri.svg";

import PembuatanIklanIcon from "@public/icons/pembuatan-innovasi.svg";
import VerifDesaIcon from "@public/icons/verifikasi-desa.svg";
import VerifInnovatorIcon from "@public/icons/verifikasi-innovator.svg";
import VerifKlaimIcon from "@public/icons/verifikasi-klaim.svg";
import VerifTambahInnovasiIcon from "@public/icons/verifikasi-tambah-innovasi.svg";

import { Box, Image, Spinner, Text } from "@chakra-ui/react";
import React from "react";

type MenuProps = {
  isAdmin?: boolean;
};

const LoadingSpinner = () => {
  return (
    <Box style={{ display: "flex", justifyContent: "center", padding: "16px" }}>
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        size="lg"
        color="#347357"
      />
    </Box>
  );
};

const Menu: React.FC<MenuProps> = ({ isAdmin = false }) => {
  const navigate = useNavigate();
  const { data, isLoading, isFetched } = useQuery("menu", getCategories);

  const predefinedCategories = [
    {
      icon: SmartAgriIcon,
      title: "Pertanian Cerdas",
    },
    {
      icon: AgriFoodIcon,
      title: "Pemasaran Agri-Food dan E-Commerce",
    },
    {
      icon: EGovernmentIcon,
      title: "E-Government",
    },
    {
      icon: InformationSystemIcon,
      title: "Sistem Informasi",
    },
    {
      icon: LocalInfrastructureIcon,
      title: "Infrastruktur Lokal",
    },
    {
      icon: MenuAllIcon,
      title: "Semua Kategori Inovasi",
    },
  ];

  const adminMenu = [
    {
      icon: VerifDesaIcon,
      title: "Verifikasi Desa",
    },
    {
      icon: VerifInnovatorIcon,
      title: "Verifikasi Inovator",
    },
    {
      icon: VerifKlaimIcon,
      title: "Verifikasi Klaim Inovasi",
    },
    {
      icon: VerifTambahInnovasiIcon,
      title: "Verifikasi Tambah Inovasi",
    },
    {
      icon: PembuatanIklanIcon,
      title: "Pembuatan Iklan",
    },
    {
      icon: MenuAllIcon,
      title: "Semua Kategori Inovasi",
    },
  ];

  const [menu, setMenu] = useState<
    { icon: string | JSX.Element; title: string }[]
  >([]);
  const menuItems = isAdmin ? adminMenu : predefinedCategories;

  const onClick = (category: string) => {
    if (category === "Semua Kategori Inovasi") {
      navigate(paths.INNOVATION_PAGE);
      return;
    }
    const isAdminCategory = adminMenu.some((item) => item.title === category);

    if (isAdmin && isAdminCategory) {
      const path = generatePath(paths.VERIFICATION_PAGE, {
        category: category,
      });
      navigate(path);
      return;
    } else {
      const path = generatePath(paths.INNOVATION_CATEGORY_PAGE, {
        category: category,
      });
      navigate(path);
    }
  };

  useEffect(() => {
    if (isFetched && data) {
      setMenu(menuItems);
    }
  }, [isFetched, data, isAdmin, menuItems]);

  return (
    <Container>
      <MenuContainer>
        {isLoading && <LoadingSpinner />}
        {!isAdmin && !isLoading && (
          <Text
            textAlign="center"
            // m="16px 0 16px 0"
            mb="16px"
            fontSize="14px"
            fontWeight="700"
            color="brand.100"
          >
            Kategori Inovasi
          </Text>
        )}
        {isFetched && (
          <GridContainer>
            {menu?.map(
              (
                { icon, title }: { icon: string | JSX.Element; title: string },
                idx: number
              ) => (
                <GridItem key={idx} onClick={() => onClick(title)}>
                  {typeof icon === "string" ? (
                    <Image src={icon} alt={title} width={10} height={10} />
                  ) : (
                    icon
                  )}
                  <Text
                    fontSize="12px"
                    fontWeight="400"
                    lineHeight="140%"
                    textAlign="center"
                    mt="8px"
                    width="90px"
                    height="auto"
                  >
                    {title}
                  </Text>
                </GridItem>
              )
            )}
          </GridContainer>
        )}
      </MenuContainer>
    </Container>
  );
};
export default Menu;
