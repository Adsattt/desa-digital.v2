import { Box, Grid } from "@chakra-ui/react";
import Container from "Components/container";
import TopBar from "Components/topBar";
import { useNavigate } from "react-router-dom";
import CategoryInnovation from './components/categoryInnovation';
import ChartInnovation1 from './components/chartInnovation1';
import ChartInnovation2 from './components/chartInnovation2';
import ChartInnovation3 from './components/chartInnovation3';
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

    const handleSliceClick = (inovatorName: string) => {
        setSelectedInovator(inovatorName);
    };

    const [selectedInovasi, setSelectedInovasi] = useState<string | null>(null);

    return (
        <Container page>
        <TopBar
            title={`Dashboard ${userName} - Inovasi`}
            onBack={() => navigate(-1)}
        />

        <CategoryInnovation onSliceClick={handleSliceClick} />
        <DetailInnovations
        selectedCategory={selectedInovator}
        onInnovationSelect={setSelectedInovasi}
        />
        {selectedInovasi && <DetailVillagesInnovation selectedInovasi={selectedInovasi} />}

        {/* <ChartInnovation1 /> */}
        {/* <ChartInnovation2 /> */}
        <ChartInnovation3 />
        </Container>
    );
};

export default DashboardMinistryInnovation;