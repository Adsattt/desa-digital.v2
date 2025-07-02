import { Box, Grid } from "@chakra-ui/react";
import Container from "Components/container";
import TopBar from "Components/topBar";
import Header from "./components/header";
import InfoCards from "./components/infoCards";
import TopVillages from "./components/topVillages";
import TopInnovations from "./components/topInnovations";
import TableInnovator from "./components/categoryInnovation";
import MapVillages from "./components/mapVillages";
import BarChartInnovator from "./components/barchartInnovator";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const DashboardInnovator = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;
  const userName = user?.displayName || "Inovator";

  return (
    <Container page>
      <TopBar
        title={`Dashboard ${userName}`} 
        onBack={() => navigate(-1)} 
      />
      {/* <Header description="KMS Desa Digital" text="Indonesia"/> */}

      <InfoCards />
      <TopInnovations />
      <TopVillages />
      <TableInnovator />
      <MapVillages />
      <BarChartInnovator />
    </Container>
  );
};

export default DashboardInnovator;