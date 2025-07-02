import { Box, Grid } from "@chakra-ui/react";
import Container from "Components/container";
import TopBar from "Components/topBar";
import Header from "./components/header";
import { useNavigate } from "react-router-dom";
import InfoCards from "./components/infoCards";
import PieChartInnovation from "./components/categoryInnovation";
import PieChartInnovator from "./components/categoryInnovator";
import PieChartVillage from "./components/categoryVillage";
import BarChartMinistry from "./components/barChart";
import MapVillages from "./components/mapVillages";
import LogoutButton from "Components/topBar/RightContent/LogoutButton";
import { getAuth } from "firebase/auth";

const DashboardMinistry = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;
  const userName = user?.displayName || "Kementerian";

  return (
    <Container page>
    <TopBar 
      title={`Dashboard ${userName}`}
      rightElement={<LogoutButton />} 
    />
      {/* <Header description="KMS Desa Digital" text="Indonesia"/> */}
      <InfoCards></InfoCards>
      <PieChartVillage></PieChartVillage>
      <PieChartInnovation></PieChartInnovation>
      <PieChartInnovator></PieChartInnovator>
      <MapVillages></MapVillages>
      <BarChartMinistry></BarChartMinistry>
    </Container>
  );
};

export default DashboardMinistry;