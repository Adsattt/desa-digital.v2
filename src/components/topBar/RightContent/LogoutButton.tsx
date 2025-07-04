import { IconButton, Tooltip } from "@chakra-ui/react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, firestore } from "../../../firebase/clientApp";
import { FiLogOut } from "react-icons/fi";
import { toast } from "react-toastify";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
      toast.success("Berhasil Logout", {
        position: "top-center",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Tooltip label="Logout" aria-label="Logout Tooltip">
        <IconButton
            icon={<FiLogOut style={{ strokeWidth: 3 }} />}
            aria-label="Logout"
            variant="ghost"
            color="white"
            onClick={handleLogout}
            _hover={{ bg: "#265B43" }}
        />
    </Tooltip>
  );
};

export default LogoutButton;    