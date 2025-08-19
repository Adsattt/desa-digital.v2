import { Box } from "@chakra-ui/react";
import Container from "Components/container";
import TopBar from "Components/topBar";
import { useNavigate } from "react-router-dom";
import PieChartInnovator from "./components/categoryInnovator";
import ChartInnovation from "./components/chartInnovator";
import DetailInnovations from "./components/detailInnovationsInnovator";
import DetailInnovators from "./components/detailInnovators";
import { getAuth } from "firebase/auth";
import { useState } from "react";

const DashboardMinistryInnovator = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;
  const userName = user?.displayName || "Kementerian";

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedInnovator, setSelectedInnovator] = useState<string | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<string | null>(null);

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setSelectedInnovator(null);
    setSelectedVillage(null);
  };

  const handleInnovatorSelect = (innovator: string | null) => {
    setSelectedInnovator(innovator);
    setSelectedVillage(null);
  };

  return (
    <Container page>
      <TopBar title={`Dashboard ${userName} - Inovator`} onBack={() => navigate(-1)} />

      <PieChartInnovator onSliceClick={handleCategorySelect} />

      <DetailInnovators
        kategoriInovator={selectedCategory}
        onSelectInovator={handleInnovatorSelect}
      />
      
      <DetailInnovations
        filterInnovator={selectedInnovator || ""}
        onSelectVillage={setSelectedVillage}
      />
    </Container>
  );
};

export default DashboardMinistryInnovator;