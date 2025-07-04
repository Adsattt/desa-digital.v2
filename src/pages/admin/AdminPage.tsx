import { Box, Flex, Stack } from "@chakra-ui/react";
import Ads from "Components/ads/Ads";
import BestBanner from "Components/banner/BestBanner";
import Container from "Components/container";
import Dashboard from "Components/dashboard/dashboard";
import Rediness from "Components/rediness/Rediness";
import SearchBarLink from "Components/search/SearchBarLink";
import TopBar from "Components/topBar";
import React from "react";
import Hero from "../home/components/hero";
import Innovator from "../home/components/innovator";
import Menu from "../home/components/menu";
import Villages from "../home/components/villages";

const AdminPage: React.FC = () => {
  
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
        <Dashboard />
        <BestBanner />
        <Box mt="120px">
          <Innovator />
        </Box>
        <Box mt="-10px">
          <Villages />
        </Box>
      </Stack>
    </Container>
  );
};
export default AdminPage;
