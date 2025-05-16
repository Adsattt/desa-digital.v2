import { Box, Fade, Flex, Image, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

import first from "@public/icons/first.svg";
import seccond from "@public/icons/seccond.svg";
import third from "@public/icons/third.svg";
import banner from "@public/images/best-banner.svg";

type BestBannerProps = {
  namaDesa?: string;
  namaInovator?: string;
};

const BestBanner: React.FC<BestBannerProps> = () => {
  const [visibleBox, setVisibleBox] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleBox((prev) => (prev === 0 ? 1 : 0));
    }, 5000);

    return () => clearInterval(interval); // Clear interval on component unmount
  }, []);

  return (
    <Box padding="0 14px" pos="relative">
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
              height="140px"
              padding="23px 23px 14px 23px"
              position="absolute"
            >
              <Flex justifyContent="space-between">
                <Box justifyItems="center" mt="21px">
                  <Image src={seccond} />
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
              height="140px"
              padding="23px 23px 15px 23px"
              position="absolute"
            >
              <Flex justifyContent="space-between">
                <Box justifyItems="center" mt="21px">
                  <Image src={seccond} />
                  <Text
                    fontSize="12px"
                    fontWeight="600"
                    lineHeight="140%"
                    textAlign="center"
                    width="90px"
                    height="auto"
                    color="#1F2937"
                  >
                    Desa Soge
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
                    Desa Cikajang
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
                    Desa Dramaga
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Fade>
        </Flex>
      </Box>
    </Box>
  );
};

export default BestBanner;
