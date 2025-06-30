import { Box, Fade, Flex, Image, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import first from "@public/icons/first.svg";
import second from "@public/icons/seccond.svg";
import third from "@public/icons/third.svg";
import banner from "@public/images/banner-unggulan.svg";
import { collection, DocumentData, getDocs } from "firebase/firestore";
import { firestore } from "../../firebase/clientApp";

const BestBanner: React.FC = () => {
  const [visibleBox, setVisibleBox] = useState(0);
  const [villages, setVillages] = useState<DocumentData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const villagesRef = collection(firestore, "villages");
      const snapShot = await getDocs(villagesRef);
      const villagesData = snapShot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          namaDesa: data.lokasi?.desaKelurahan?.label || "",
          jumlahInovasiDiterapkan: data.jumlahInovasiDiterapkan || 0,
        };
      });
      setVillages(villagesData);
    };
    fetchData();
  }, []);

  const top3Villages = [...villages]
    .sort((a, b) => {
          if (b.jumlahInovasiDiterapkan !== a.jumlahInovasiDiterapkan) {
            return b.jumlahInovasiDiterapkan - a.jumlahInovasiDiterapkan; 
          }
          return a.namaDesa.localeCompare(b.namaDesa); 
        })
    .slice(0, 3);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleBox((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box padding="0 14px" pos="relative" >
      <Text fontSize="16px" fontWeight="700" lineHeight="140%" mb="16px" color="#1F2937">
        Inovator dan Desa Unggulan
      </Text>
      <Box>
        <Flex position="relative">
          <Fade in={visibleBox === 0}>
            <Box
              backgroundImage={banner}
              backgroundSize="100%"
              width="332px"
              height="142px"
              padding="23px 23px 14px 23px"
              position="absolute"
            >
              <Flex justifyContent="space-between">
                <Box justifyItems="center" mt="21px">
                  <Image src={second} />
                  <Text
                    fontSize="12px"
                    fontWeight="600"
                    lineHeight="140%"
                    textAlign="center"
                    width="90px"
                    height="auto"
                    color="#1F2937"
                  >
                    Habibi Garden
                  </Text>
                </Box>
                <Box justifyItems="center">
                  <Image src={first} />
                  <Text
                    fontSize="12px"
                    fontWeight="600"
                    lineHeight="140%"
                    textAlign="center"
                    width="90px"
                    height="auto"
                    color="#1F2937"
                  >
                    eFishery
                  </Text>
                </Box>
                <Box justifyItems="center" mt="21px">
                  <Image src={third} />
                  <Text
                    fontSize="12px"
                    fontWeight="600"
                    lineHeight="140%"
                    textAlign="center"
                    width="90px"
                    height="auto"
                    color="#1F2937"
                  >
                    Inagria
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Fade>

         <Fade in={visibleBox === 1}>
          <Box
            backgroundImage={banner}
            backgroundSize="100%"
            width="332px"
            height="142px"
            padding="23px 23px 15px 23px"
            position="absolute"
          >
            <Flex justifyContent="space-between">
              {top3Villages[1] && (
                <Box justifyItems="center" mt="21px">
                  <Image src={second} />
                  <Text
                    fontSize="12px"
                    fontWeight="600"
                    lineHeight="140%"
                    textAlign="center"
                    width="90px"
                    color="#1F2937"
                  >
                    {top3Villages[1].namaDesa}
                  </Text>
                </Box>
              )}

              {top3Villages[0] && (
                <Box justifyItems="center">
                  <Image src={first} />
                  <Text
                    fontSize="12px"
                    fontWeight="600"
                    lineHeight="140%"
                    textAlign="center"
                    width="90px"
                    color="#1F2937"
                  >
                    {top3Villages[0].namaDesa}
                  </Text>
                </Box>
              )}

              {top3Villages[2] && (
                <Box justifyItems="center" mt="21px">
                  <Image src={third} />
                  <Text
                    fontSize="12px"
                    fontWeight="600"
                    lineHeight="140%"
                    textAlign="center"
                    width="90px"
                    color="#1F2937"
                  >
                    {top3Villages[2].namaDesa}
                  </Text>
                </Box>
              )}
            </Flex>
          </Box>
        </Fade>
        </Flex>
      </Box>
    </Box>
  );
  
};

export default BestBanner;
