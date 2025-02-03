import { Box, Fade, Flex, Image, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

import first from "@public/icons/first.svg";
import seccond from "@public/icons/seccond.svg";
import third from "@public/icons/third.svg";
import banner from "@public/images/banner-unggulan.svg";

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
      <Text fontSize="16px" fontWeight="700" lineHeight="140%" mb="16px" mt="10px">
        Inovator dan Desa Unggulan
      </Text>
      <Box>
        <Flex position="relative">
          <Fade in={visibleBox === 0}>
            <Box
              backgroundImage={banner}
              width="329px"
              height="135px"
              padding="23px 23px 13px 23px"
              position="absolute"
            >
              <Flex justifyContent="center" alignItems="center" gap="16px">
                <Box display="flex" flexDirection="column" alignItems="center"  mt="30px">
                  <Image src={seccond} />
                  <Text
                    fontSize="12px"
                    fontWeight="600"
                    lineHeight="140%"
                    textAlign="center"
                    width="90px"
                    height="auto"
                  >
                    Habibi Garden
                  </Text>
                </Box>
                <Box display="flex" flexDirection="column" alignItems="center" mt="-30px">
                  <Image src={first} />
                  <Text
                    fontSize="12px"
                    fontWeight="600"
                    lineHeight="140%"
                    textAlign="center"
                    width="90px"
                    height="auto"
                  >
                    eFishery
                  </Text>
                </Box>
                <Box display="flex" flexDirection="column" alignItems="center" mt="30px">
                  <Image src={third} />
                  <Text
                    fontSize="12px"
                    fontWeight="600"
                    lineHeight="140%"
                    textAlign="center"
                    width="90px"
                    height="auto"
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
              width="329px"
              height="135px"
              padding="23px 23px 13px 23px"
              position="absolute"
            >
              <Flex justifyContent="center" alignItems="center" gap="16px">
                <Box display="flex" flexDirection="column" alignItems="center"  mt="30px">
                  <Image src={seccond} />
                  <Text
                    fontSize="12px"
                    fontWeight="600"
                    lineHeight="140%"
                    textAlign="center"
                    width="90px"
                    height="auto"
                  >
                    Desa Soge
                  </Text>
                </Box>
                <Box display="flex" flexDirection="column" alignItems="center" mt="-30px">
                  <Image src={first} />
                  <Text
                    fontSize="12px"
                    fontWeight="600"
                    lineHeight="140%"
                    textAlign="center"
                    width="90px"
                    height="auto"
                  >
                    Desa Cikajang
                  </Text>
                </Box>
                <Box display="flex" flexDirection="column" alignItems="center" mt="30px">
                  <Image src={third} />
                  <Text
                    fontSize="12px"
                    fontWeight="600"
                    lineHeight="140%"
                    textAlign="center"
                    width="90px"
                    height="auto"
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
