import { Box, Grid } from "@chakra-ui/react";
import { useState } from "react";
import Container from "Components/container";
import TopBar from "Components/topBar";
import { useNavigate } from "react-router-dom";
import TopInnovations from "./components/topInnovations";
import DetailInnovations from "./components/detailInnovations";
import DetailVillages from "./components/detailVillagesInnovation";
import { getAuth } from "firebase/auth";

const DashboardInnovatorInnovation = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const userName = user?.displayName || "Inovator";
  const navigate = useNavigate();
  const [selectedInovasi, setSelectedInovasi] = useState<{ id: string; nama: string } | null>(null);

  return (
    <Container page>
      <TopBar
          title={`Dashboard ${userName} - Inovasi`} 
          onBack={() => navigate(-1)} 
      />
      <TopInnovations></TopInnovations>
      <>
        <DetailInnovations onSelectInnovation={(id, nama) => setSelectedInovasi({ id, nama })} />
        {selectedInovasi && (
          <DetailVillages
            innovationId={selectedInovasi.id}
            namaInovasi={selectedInovasi.nama}
            onBack={() => setSelectedInovasi(null)}
          />
        )}
      </>
    </Container>
  );
};

export default DashboardInnovatorInnovation;