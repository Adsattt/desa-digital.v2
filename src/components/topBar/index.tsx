import { ArrowBackIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, IconButton, Text } from "@chakra-ui/react";
import faq from "Assets/icons/faq.svg";
import { paths } from "Consts/path";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { useUser } from "src/contexts/UserContext";
import { auth, firestore } from "../../firebase/clientApp";
import UserMenu from "./RightContent/UserMenu";
import { FaCheck } from "react-icons/fa";

type TopBarProps = {
  title: string | undefined;
  onBack?: () => void;
  onFilterClick?: () => void;
  rightElement?: React.ReactNode; // ← Tambahkan prop baru
};

function TopBar(props: TopBarProps) {
  const { title, onBack, onFilterClick, rightElement } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [user] = useAuthState(auth);
  const [village, setVillage] = useState(false);
  const { isVillageVerified } = useUser();
  const [claimStatus, setClaimStatus] = useState("");

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

  useEffect(() => {
    if (user && id) {
      const q = query(
        collection(firestore, "claimInnovations"),
        where("desaId", "==", user.uid),
        where("inovasiId", "==", id)
      );
      getDocs(q).then((querySnapshot) => {
        if (querySnapshot.empty) {
          setClaimStatus("");
        } else {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            setClaimStatus(data.status);
          });
        }
      }
      );
    }
  }, [user, id]);

   const { label, bg, color, leftIcon, isDisabled, hover } = (() => {
     switch (claimStatus) {
       case "Terverifikasi":
         return {
           label: "Sudah Klaim",
           bg: "#71A686",
           color: "white",
           leftIcon: <FaCheck />,
           isDisabled: true,
         };
       case "Menunggu":
         return {
           label: "Proses Klaim",
           bg: "#71A686",
           color: "white",
           leftIcon: undefined,
           isDisabled: true,
         };
       case "Ditolak":
         return {
           label: "Ditolak",
           bg: "red.500",
           color: "white",
           leftIcon: undefined,
           isDisabled: false,
         };
       case "":
       default:
         return {
           label: "Klaim Inovasi",
           bg: "white",
           color: "#347357",
           hover: {
             bg: "gray.200",
           },
           leftIcon: undefined,
           isDisabled: false,
         };
     }
   })();


  const handleClick = () => {
    if (isDisabled) return;
    if (!isVillageVerified) {
      toast.warning(
        "Akun anda belum terdaftar atau terverifikaasi sebagai desa digital",
        {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
    } else {
      navigate("/village/klaimInovasi", { state: { id } });
    }
  };

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

        <Flex align="center" gap={2}>
          {rightElement}

          {isClaimButtonVisible && village && (
            <Button
              fontSize="12px"
              fontWeight="500"
              variant="inverted"
              height="32px"
              _hover={{ bg: hover?.bg }}
              bg={bg}
              color={color}
              leftIcon={leftIcon}
              // isDisabled={isDisabled}
              onClick={handleClick}
            >
              {label}
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
                  color="white"
                  cursor="pointer"
                  padding={2}
                  onClick={() => navigate(paths.BANTUAN_FAQ_PAGE)}
                />
                <Button
                  fontSize="14px"
                  fontWeight="700"
                  color="#FFEB84"
                  cursor="pointer"
                  onClick={() => navigate(paths.LOGIN_PAGE)}
                  variant="link"
                >
                  Masuk
                </Button>
              </Flex>
            ))}
        </Flex>
      </Flex>
    </Box>
  );
}

export default TopBar;
