import {
    Box,
    Flex,
    Text,
    Button,
    useDisclosure,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerBody,
    DrawerCloseButton,
    Image,
    DrawerFooter,
    DrawerHeader,
} from "@chakra-ui/react";
import { FaSeedling } from "react-icons/fa6";
import efisheryLogo from "../../src/assets/images/efishery-logo.jpg";
import React from "react";
import { useNavigate } from "react-router-dom";
import { paths } from "Consts/path";


const Rekomendasi = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate();

    return (
        <>
            {/* Card Rekomendasi */}
            <Box
                mt={4}
                p={6}
                mx="15px"
                bg="white"
                boxShadow="md"
                borderRadius="lg"
                border="1px solid"
                borderColor="gray.200"
                position="relative"
                overflow="hidden"
            >
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                    Inovasi digital terbaik untuk desamu
                </Text>
                <Flex alignItems="center" mb={1}>
                    <Box borderRadius="full" p={1} mr={2}>
                        <FaSeedling color="green" size="30px" />
                    </Box>
                    <Box>
                        <Text fontSize="md" fontWeight="bold" color="green.700">
                            eFeeder
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                            Innovator: eFishery
                        </Text>
                    </Box>
                </Flex>
                <Flex justifyContent="space-between" alignItems="center" mb={0.5} mt={3}>
                    <Text fontSize="10px" color="gray.500">
                        Cek rekomendasi inovasi digital lainnya untuk desamu disini
                    </Text>
                    <Button
                        colorScheme="green"
                        size="xs"
                        fontSize="10px"
                        p={1}
                        borderRadius="4"
                        minW="auto"
                        
                        h="22px"
                        w='180px'
                        onClick={onOpen} 
                        boxShadow="md" 
                        _hover={{ bg: "#16432D" }}
                    >
                        Lihat Rekomendasi
                    </Button>
                </Flex>
            </Box>

            {/* Drawer Rekomendasi */}
            <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent
                    sx={{
                        borderTopRadius: "3xl",
                        width: "360px", // match sama drawer lain
                        h:"770px",
                        my: "auto",
                        mx: "auto",
                    }}
                >
                    <DrawerHeader
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Text fontSize="18px" fontWeight="bold" mt="4px" ml="4px">
                            Rekomendasi Inovasi
                        </Text>
                        <DrawerCloseButton mt="10px" mr="4px"/>
                    </DrawerHeader>

                    <DrawerBody p={0}>
                    <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        textAlign="center"
                        height="100%"
                        px={6}
                        py={8}
                    >
                        <Text fontWeight="bold" fontSize="lg">
                        eFeeder
                        </Text>
                        <Text fontSize="sm" mb={4}>
                        dari eFishery
                        </Text>

                        <Box my={6}>
                        <Image
                            src={efisheryLogo}
                            alt="eFeeder"
                            mx="auto"
                            boxSize="80px"
                        />
                        </Box>

                        <Text fontWeight="bold" mb={1}>
                        Cocok dengan desamu!
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                        Saatnya desamu berinovasi! Terapkan inovasi dan buat perubahan besar di desamu
                        </Text>
                    </Flex>
                    </DrawerBody>

                    <DrawerFooter flexDirection="column" gap={3}>
                        <Button
                            bg="#347357"
                            color="white"
                            w="full"
                            fontSize="sm"
                            border = "2px"
                            _hover={{ bg: "#2e5e4b" }}
                        >
                            Detail Inovasi
                        </Button>
                        <Button
                            variant="outline"
                            colorScheme="green"
                            w="full"
                            fontSize="sm"
                            mb={3}
                            onClick={() => {
                                onClose(); // tutup drawer
                                navigate(paths.VILLAGE_RECOMENDATION); // redirect
                            }}
                        >
                            Rekomendasi Lainnya
                        </Button>

                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default Rekomendasi;
