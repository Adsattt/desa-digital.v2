import { Box } from "@chakra-ui/react";
import Container from "Components/container";
import TopBar from "Components/topBar";
import { useNavigate } from "react-router-dom";
import PieChartVillage from "./components/categoryVillage";
import ChartVillage from "./components/chartVillage";
import DetailVillages from "./components/detailVillages";
import DetailInnovationsVillage from "./components/detailInnovationsVillage";
import { getAuth } from "firebase/auth";
import { useState } from "react";

const DashboardMinistryVillage = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;
  const userName = user?.displayName || "Kementerian";

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<string | null>(null);
  const [hasRowClicked, setHasRowClicked] = useState(false);

  const handleCategoryClick = (category: string | null) => {
    setSelectedCategory(category);
    setSelectedVillage(null);
  };
  
  const handleRowClick = (village: string) => {
    setSelectedVillage(village);
    setHasRowClicked(true);
  };

  return (
    <Container page>
      <TopBar title={`Dashboard ${userName} - Desa`} onBack={() => navigate(-1)} />
        <PieChartVillage onSliceClick={handleCategoryClick} />
        <DetailVillages selectedCategory={selectedCategory} onRowClick={handleRowClick} />
        <DetailInnovationsVillage selectedVillage={selectedVillage} hasRowClicked={hasRowClicked} />
        <ChartVillage />
    </Container>
  );
};

export default DashboardMinistryVillage;