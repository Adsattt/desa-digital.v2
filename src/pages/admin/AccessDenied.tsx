import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Image,
  Text,
} from "@chakra-ui/react";
// import TopBar from "Components/topBar";
import React from "react";
import { useNavigate } from "react-router-dom";
import Sutet from "Assets/images/Sutet.svg";
import DeniedImage from "Assets/images/denied-image.svg";

const AccessDenied: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{ height: "100vh", bg: "#EEF8F4" }}
      position="relative"
      overflow="hidden"
    >
      {/* <TopBar title="Back" onBack={() => navigate(-1)} /> */}
      <Image
        src={Sutet}
        alt="sutet"
        position="absolute"
        right="0"
        top="40%"
        height="60%"
        transform="translateY(-50%)"
      />
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={`calc(100% - 60px)`}
        position="relative"
      >
        <Box position="relative">
          <Image
            src={DeniedImage}
            alt="denied"
            position="absolute"
            bottom="-30px"
            left="-20px"
            // width="80px"
            marginBottom="-20px"
            zIndex="1"
          />
          <Card width="262px" position="relative" zIndex="0">
            <CardHeader
              sx={{
                bg: "#347357",
                borderRadius: "6px 6px 0 0",
                height: "19px",
                padding: 0,
              }}
            />
            <CardBody padding="8px 20px">
              <Flex direction="column" alignItems="center">
                <Text fontSize="28px" fontWeight="600" color="#347357">
                  403
                </Text>
                <Text fontSize="22px" fontWeight="500" color="#347357">
                  Akses Dilarang
                </Text>
                <Text fontSize="12px" color="#347357" textAlign="center">
                  Maaf, kamu tidak memiliki akses ke halaman ini
                </Text>
              </Flex>
            </CardBody>
          </Card>
          <Flex justifyContent="flex-end">
            <Button
              mt="9px"
              size="sm"
              fontWeight="500"
              fontSize="10px"
              padding="6px 8px"
              width="67px"
              height="21px"
              borderRadius="4px"
              onClick={() => navigate("/")}
            >
              Kembali
            </Button>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};
export default AccessDenied;
