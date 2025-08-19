import { Box, Grid } from "@chakra-ui/react";
import Container from "Components/container";
import TopBar from "Components/topBar";
import { useNavigate } from "react-router-dom";
import CategoryInnovation from './components/categoryInnovation';
import ChartInnovation from './components/chartInnovation';
import DetailInnovations from './components/detailInnovations';
import DetailVillagesInnovation from './components/detailVillagesInnovation';
import { getAuth } from "firebase/auth";
import { useState } from "react";

const DashboardMinistryInnovation = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    const userName = user?.displayName || "Kementerian";
    const navigate = useNavigate();

    const [selectedInovator, setSelectedInovator] = useState<string | null>(null);
    const [selectedInovasi, setSelectedInovasi] = useState<string | null>(null);
    const [hasRowClicked, setHasRowClicked] = useState(false);

    const handleSliceClick = (inovatorName: string) => {
        setSelectedInovator(inovatorName);
        setSelectedInovasi(null);
        setHasRowClicked(false);
    };

    const handleInnovationSelect = (inovasi: string) => {
        setSelectedInovasi(inovasi);
        setHasRowClicked(true);
    };

    return (
        <Container page>
        <TopBar title={`Dashboard ${userName} - Inovasi`} onBack={() => navigate(-1)} />
        <CategoryInnovation onSliceClick={handleSliceClick} />
        <DetailInnovations selectedCategory={selectedInovator} onInnovationSelect={handleInnovationSelect} />
        <DetailVillagesInnovation selectedInovasi={selectedInovasi} hasRowClicked={hasRowClicked} />
        <ChartInnovation />
        </Container>
    );
};

export default DashboardMinistryInnovation;