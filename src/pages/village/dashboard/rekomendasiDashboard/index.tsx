import { Box, Flex, Image, Text, VStack, Stack, HStack } from "@chakra-ui/react";
import TopBar from "Components/topBar";
import { useNavigate } from "react-router-dom";
import efisheryLogo from "../../../../assets/images/efishery-logo.jpg";

const dummyData = [
  { rank: 1, name: "eFeeder", innovator: "eFishery" },
  { rank: 2, name: "Habibi Garden", innovator: "Habibi Garden" },
  { rank: 3, name: "Inagri", innovator: "Inagri" },
  { rank: 4, name: "Aruna", innovator: "Aruna" },
  { rank: 5, name: "Digides", innovator: "PT Digital Desa Indonesia" },
  { rank: 6, name: "FishGo", innovator: "FishGo" },
  { rank: 7, name: "Silawas", innovator: "Departemen Ilkom" },
  { rank: 8, name: "Innovillage", innovator: "Telkom University" },
  { rank: 9, name: "OpenSID", innovator: "Opendesa" },
  { rank: 10, name: "PINANG", innovator: "Bank Rakyat Indonesia" },
];

const RekomendasiInovasi = () => {
  const navigate = useNavigate();

  // ambil 3 besar berdasarkan dummyData
  const topThree = dummyData.slice(0, 3);
  // susun ulang untuk tampil: [2nd, 1st, 3rd]
  const displayThree = [
    { ...topThree[1], displayLabel: "2nd", height: 100 },  // rank 2 di kiri
    { ...topThree[0], displayLabel: "1st", height: 140 },  // rank 1 di tengah
    { ...topThree[2], displayLabel: "3rd", height: 70 },   // rank 3 di kanan
  ];

  const others = dummyData.slice(3);

  return (
    <Box>
      <TopBar title="Rekomendasi Inovasi" onBack={() => navigate(-1)} />

      {/* Bagian Top 3: susunan bar = 2,1,3 */}
      <Stack pt="60px" px={4} spacing={6} mt="8">
        <Flex justify="center" align="flex-end" gap="25px" mb="-25px">
          {displayThree.map((item) => (
            <VStack key={item.rank} spacing={2}>
              <Image
                src={efisheryLogo}
                boxSize="40px"
                borderRadius="full"
                objectFit="cover"
              />
              <Text fontSize="xs" fontWeight="semibold" textAlign="center">
                {item.name}
              </Text>
              <Box
                w="50px"
                h={`${item.height}px`}
                bg="green.700"
                borderTopRadius="10px"
                pt="15px"
                display="flex"
                alignItems="flex-start"
                justifyContent="center"
              >
                <Text color="white" fontWeight="bold" fontSize="sm">
                  {item.displayLabel}
                </Text>
              </Box>
            </VStack>
          ))}
        </Flex>
      </Stack>

      {/* Bagian Rank 4–10 */}
      <Box
        bg="#D6E3DD"
        borderTopRadius="3xl"
        pt={6}
        pb={10}
        px={4}
        w="full"
        mt="24px"
      >
        <VStack spacing={3}>
          {others.map((item) => (
            <HStack
              key={item.rank}
              bg="white"
              w="full"
              p={3}
              boxShadow="sm"
              borderColor="gray.200"
              borderRadius={10}
              align="center"
              spacing={3}
            >
              <Text fontWeight="bold" fontSize="sm" color="gray.600" w="30px" ml={2}>
                {String(item.rank).padStart(2, "0")}
              </Text>
              <Image
                src={efisheryLogo}
                boxSize="40px"
                borderRadius="full"
                objectFit="cover"
              />
              <Box>
                <Text fontSize="14px" fontWeight="semibold">{item.name}</Text>
                <Text fontSize="xs" color="gray.500">
                  Inovator: <b>{item.innovator}</b>
                </Text>
              </Box>
            </HStack>
          ))}
        </VStack>
      </Box>
    </Box>
  );
};

export default RekomendasiInovasi;
