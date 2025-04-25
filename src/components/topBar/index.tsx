import { ArrowBackIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Text, IconButton } from "@chakra-ui/react";
import { paths } from "Consts/path";
import { useAuthState } from "react-firebase-hooks/auth";
import { useLocation, useNavigate, useParams } from "react-router";
import { auth, firestore } from "../../firebase/clientApp";
import UserMenu from "./RightContent/UserMenu";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import faq from "Assets/icons/faq.svg";

type TopBarProps = {
  title: string | undefined;
  onBack?: () => void;
};

function TopBar(props: TopBarProps) {
  const { title, onBack } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [user] = useAuthState(auth);
  const [village, setVillage] = useState(false);

  const allowedPaths = [paths.LANDING_PAGE, paths.ADMIN_PAGE];
  const isUserMenuVisible = allowedPaths.includes(location.pathname);

  const isClaimButtonVisible =
    location.pathname.includes("/innovation/detail/") && id;

  useEffect(() => {
    const fecthVillage = async () => {
      if (user) {
        const Ref = doc(firestore, "villages", user.uid);
        const docSnap = await getDoc(Ref);
        if (docSnap.exists()) {
          setVillage(true);
        }
      }
    };
    fecthVillage();
  }, [user]);

  return (
    <Box
      padding="0 16px"
      backgroundColor="#347357"
      position="fixed"
      top="0"
      maxW="360px"
      width="100%"
      height="56px"
      zIndex="999"
      alignContent="center"
    >
      <Flex
        justify={
          isClaimButtonVisible || isUserMenuVisible
            ? "space-between"
            : "flex-start"
        }
        align="center"
      >
        {!!onBack && (
          <ArrowBackIcon
            color="white"
            fontSize="14pt"
            cursor="pointer"
            onClick={onBack}
            mt="2px"
          />
        )}
        <Text
          fontSize={title && title.split(" ").length > 3 ? "14px" : "16px"}
          fontWeight="700"
          color="white"
          ml={onBack ? "8px" : "0"}
          lineHeight="56px"
          flex={1}
          textAlign="left"
        >
          {title}
        </Text>
        {isClaimButtonVisible && village && (
          <Button
            fontSize="12px"
            fontWeight="500"
            variant="inverted"
            height="32px"
            _hover={{ bg: "gray.200" }}
            onClick={() => navigate(`/village/klaimInovasi/${id}`)}
          >
            Klaim Inovasi
          </Button>
        )}
        {!isClaimButtonVisible &&
          isUserMenuVisible &&
          (user ? (
            <UserMenu user={user} />
          ) : (
            <Flex gap="1px">
              <Button
                as={IconButton}
                icon={<img src={faq} alt="faq" width="20px" height="20px" />}
                alignSelf="center"
                color="white"
                cursor="pointer"
                padding={2}
                onClick={() => navigate(paths.BANTUAN_FAQ_PAGE)} // Arahkan ke halaman Register
              >
              </Button>
              <Button
                fontSize="14px"
                fontWeight="700"
                color= "#FFEB84"
                cursor="pointer"
                onClick={() => navigate(paths.LOGIN_PAGE)}
                variant="link"
              >
                Masuk
              </Button>
            </Flex>
          ))}
      </Flex>
    </Box>
  );
}

export default TopBar;
