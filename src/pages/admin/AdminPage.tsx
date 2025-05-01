import { Box, Flex, Stack } from "@chakra-ui/react";
import Ads from "Components/ads/Ads";
import BestBanner from "Components/banner/BestBanner";
import Container from "Components/container";
import Rediness from "Components/rediness/Rediness";
import SearchBarLink from "Components/search/SearchBarLink";
import TopBar from "Components/topBar";
import React from "react";
import Hero from "../home/components/hero";
import Innovator from "../home/components/innovator";
import Menu from "../home/components/menu";
import { useNavigate } from "react-router-dom";
import Dashboard from "Components/dashboard/dashboard";

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Container page>
      <TopBar title="Desa Digital Indonesia" />
      <Hero
        description="Admin Inovasi Desa"
        text="Digital Indonesia"
        isAdmin={true}
      />
      <Stack direction="column" gap={2}>
        <SearchBarLink />
        <Menu isAdmin={true} />
        <Flex direction="row" justifyContent="space-between" padding="0 14px">
          <Rediness />
          <Ads />
        </Flex>
        <Dashboard></Dashboard>
        <BestBanner />
        <Box mt="120px">
          <Innovator />
        </Box>
      </Stack>
    </Container>
  );
};
export default AdminPage;
