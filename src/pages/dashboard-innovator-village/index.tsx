import { Box, Grid } from "@chakra-ui/react";
import { useState } from "react";
import Container from "Components/container";
import TopBar from "Components/topBar";
import { useNavigate } from "react-router-dom";
import TopInnovations from "./components/topVillages";
import DetailInnovations from "./components/detailInnovationsVillage";
import DetailVillages from "./components/detailVillages";
import { getAuth } from "firebase/auth";

const DashboardInnovatorVillage = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const userName = user?.displayName || "Inovator";
  const navigate = useNavigate();
  const [selectedDesa, setSelectedDesa] = useState<{ id: string; nama: string } | null>(null);

  return (
    <Container page>
      <TopBar
        title={`Dashboard ${userName} - Desa`}
        onBack={() => navigate(-1)}
      />

      <TopInnovations />

      <>
        <DetailVillages onSelectVillage={(id, nama) => setSelectedDesa({ id, nama })} />
        {selectedDesa && (
          <DetailInnovations
            innovationId={selectedDesa.id}
            namaDesa={selectedDesa.nama}
            onBack={() => setSelectedDesa(null)}
          />
        )}
      </>
    </Container>
  );
};

export default DashboardInnovatorVillage;