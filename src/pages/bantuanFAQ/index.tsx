import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Flex,
    Stack,
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Text,
    Button,
    useDisclosure,
} from '@chakra-ui/react';
import {
    Description,
    NavbarButton,
} from "./_bantuanFAQStyle.ts";
import { FaCircle } from "react-icons/fa";
import TopBar from 'Components/topBar';
import circle from "Assets/icons/circlegreen.svg";
import ActionDrawer from "Components/drawer/ActionDrawer.tsx";
import {
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
} from '@chakra-ui/react'
import Whatsapp from "Assets/icons/whatsapp.svg";
import Envelope from "Assets/icons/envelope.svg";


const accordionData = [
    {
        title: "Apa itu KMS Desa Digital Indonesia?",
        description: "KMS Desa Digital Indonesia adalah website yang dirancang untuk mengumpulkan, mengelola, dan menyebarkan informasi inovasi desa digital di berbagai desa digital di Indonesia. Pengguna KMS yaitu masyarakat, inovator, serta perangkat desa."
    },
    {
        title: "Apa yang bisa saya lakukan di KMS?",
        description: "Anda dapat melihat inovasi digital desa melihat inovator dari inovasi, dan melihat berbagai informasi desa digital di Indonesia. Sebagai perangkat desa, Anda bisa mengajukan klaim penerapan inovasi. Sebagai inovator, Anda bisa menambahkan informasi tentang inovasi Anda."
    },
    {
        title: "Bagaimana cara mengklaim inovasi?",
        description: "Anda tidak dapat melakukan klaim perorangan. Klaim hanya dapat dilakukan melalui akun desa. Untuk itu desa Anda harus mendaftarkan akun dan melengkapi profil desa sebelum mengajukan klaim inovasi. Setelah melengkapi profil desa, pengajuan klaim dapat dilakukan melalui halaman inovasi yang anda inginkan."
    },
    {
        title: "Bagaimana mengklaim inovasi yang belum terdaftar pada KMS?",
        description: "Anda dapat mengklaim inovasi yang belum terdaftar pada website dengan melakukan klaim manual. Klaim manual dapat dilakukan melalui halaman pengajuan klaim. Anda perlu memasukkan bukti klaim, informasi inovasi dan inovator."
    },
];

const BantuanFAQ: React.FC = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate();
    return (
        <Box>
            {/* Top Bar */}
            <TopBar title="Bantuan dan FAQ" onBack={() => navigate(-1)} />
            <Stack padding="16px" gap="16px" paddingTop="70px">
                <Flex>
                    <Accordion width="360px" allowMultiple>
                        {accordionData.map((item, index) => (
                            <Flex
                                key={index}
                                mb="12px"
                                border="1px solid var(--Gray-30, #E5E7EB)"
                                borderRadius="8px"
                            >
                                <AccordionItem width="100%" border="none">
                                    <h2>
                                        <AccordionButton>
                                            <Flex justifyContent="space-between"
                                                flexDirection="row"
                                                alignItems="center"
                                                gap="8px"
                                                alignSelf="stretch"
                                                width="100%">
                                                <Flex alignItems="center" gap="12px">
                                                    <img src={circle} alt="circle" width="10px" height="10px" />
                                                    <Text fontSize="12px" fontWeight="700" textAlign="start">
                                                        {item.title}
                                                    </Text>
                                                </Flex>
                                                <AccordionIcon color="#568A73" />
                                            </Flex>
                                        </AccordionButton>
                                    </h2>
                                    <AccordionPanel pb={4}>
                                        <Description>{item.description}</Description>
                                    </AccordionPanel>
                                </AccordionItem>
                            </Flex>
                        ))}
                    </Accordion>
                </Flex>
            </Stack>
            <NavbarButton>
                <Button width="100%" maxWidth="328px" onClick={onOpen} fontSize="16px" >
                    Kontak Support
                </Button>
            </NavbarButton>
            <Drawer
                isOpen={isOpen}
                placement='bottom'
                onClose={onClose}
            >
                <DrawerOverlay />
                <DrawerContent
                sx={{
                    borderRadius: "lg",
                    width: "360px",
                    my: "auto",
                    mx: "auto",
                  }}>
                    <DrawerCloseButton marginTop="4px" color="#1F2937" />
                    <DrawerHeader
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        color: "#1F2937",
                        fontSize: "16px",
                      }}>Kontak Support</DrawerHeader>
                    <DrawerBody fontSize={12} color="#374151" paddingX={4} gap={4}>
                    Hubungi admin KMS Desa Digital Indonesia jika Anda butuh info lebih lanjut
                    <Flex width= "328px" align-items= "flex-start" gap= "16px" padding="4px 0px 4px">
                    <img src={Whatsapp} alt="WA" width="16px" height="16px"/>
                     00000000000 
                    </Flex>
                    <Flex width= "328px" align-items= "flex-start" gap= "16px" padding="0px 0px 8px">
                    <img src={Envelope} alt="WA" width="16px" height="16px"/>
                    dvi@gmail.com
                    </Flex>

                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Box >

    );
};

export default BantuanFAQ;