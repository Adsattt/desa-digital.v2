import {
  Button,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import notification from "Assets/icons/bell.svg";
import profileIcon from "Assets/icons/profile.svg";
import { paths } from "Consts/path";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getFirestore,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { auth, firestore } from "../../../firebase/clientApp";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "react-toastify";

type UserMenuProps = {
  user?: User | null;
};

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const navigate = useNavigate();
  const [userLogin] = useAuthState(auth);
  const [userData, setUserData] = useState<DocumentData | undefined>();
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Jika pengguna berhasil login
        const db = getFirestore();

        // Ambil data pengguna dari koleksi "users" berdasarkan UID
        const usersRef = collection(db, "users");
        const userQuery = query(usersRef, where("id", "==", user.uid));
        onSnapshot(userQuery, (snapshot) => {
          if (!snapshot.empty) {
            const userData = snapshot.docs[0].data();
            setUserRole(userData.role); // Set state userRole
            // console.log("User ", userData);
            // Cek koleksi berdasarkan role pengguna
            if (userData.role === "village") {
              const villagesRef = collection(db, "villages");
              const villageQuery = query(
                villagesRef,
                where("id", "==", user.uid)
              );
              onSnapshot(villageQuery, (villageSnapshot) => {
                setProfileExists(!villageSnapshot.empty);
              });
              console.log("Profile Exists: ", profileExists);
            } else if (userData.role === "innovator") {
              const innovatorsRef = collection(db, "innovators");
              const innovatorQuery = query(
                innovatorsRef,
                where("id", "==", user.uid)
              );
              onSnapshot(innovatorQuery, (innovatorSnapshot) => {
                setProfileExists(!innovatorSnapshot.empty);
              });
            } else {
              setProfileExists(false); // Jika role tidak sesuai, profil dianggap tidak ada
            }
          } else {
            setUserRole(null); // Set role ke null jika data pengguna tidak ditemukan
            setProfileExists(false); // Set profileExists ke false
          }
        });
      } else {
        // Reset state jika pengguna logout
        setUserRole(null);
        setProfileExists(false);
      }
    });

    return () => unsubscribe(); // Bersihkan listener
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (userLogin?.uid) {
        const userRef = doc(firestore, "users", userLogin.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
          setProfileExists(true);
        }
      }
    };
    fetchUser(); 
  }, [userLogin]);

  useEffect(() => {
    const fetchVillage = async () => {
      if (user) {
        const villageRef = doc(firestore, "villages", user.uid);
        const villageSnap = await getDoc(villageRef);
        if (villageSnap.exists()) {
          const villageData = villageSnap.data();
          setStatus(villageData?.status);
          console.log("Status: ", villageData?.status);
        }
      }
    };
    fetchVillage();
  }, [user]);

  useEffect(() => {
    const fetchInnovator = async () => {
      if (user) {
        const innovatorRef = doc(firestore, "innovators", user.uid);
        const innovatorSnap = await getDoc(innovatorRef);
        if (innovatorSnap.exists()) {
          const innovatorData = innovatorSnap.data();
          setStatus(innovatorData?.status);
          console.log("Status: ", innovatorData?.status);
        }
      }
    };
    fetchInnovator();
  }, [user]);

  const handleProfileClick = () => {
    if (!user) return;

    if (userRole === "village") {
      if (status === "Terverifikasi") {
        const path = paths.VILLAGE_PROFILE_PAGE.replace(":id", user.uid);
        navigate(path);
      } else {
        navigate(paths.VILLAGE_FORM);
      }
    } else if (userRole === "innovator") {
      if (status === "Terverifikasi") {
        const path = paths.INNOVATOR_PROFILE_PAGE.replace(":id", user.uid);
        navigate(path);
      } else {
        navigate(paths.INNOVATOR_FORM);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      toast.success("Berhasil Logout", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <Flex justify="center" align="center" height="56px">
      <Menu>
        <Button
          padding={1}
          as={IconButton}
          aria-label="Options"
          icon={<img src={notification} alt="Bell" width="24" height="24" />}
          height="40px"
          alignSelf="center"
        />
        <MenuButton
          as={IconButton}
          aria-label="Options"
          icon={<img src={profileIcon} alt="Profile" width="24" height="24" />}
          height="40px"
          alignSelf="center"
        />

        <MenuList>
          {user ? (
            <>
              <MenuItem onClick={handleProfileClick}>
                {profileExists ? "Profile" : "Isi Profile"}
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
              <MenuItem onClick={() => navigate(paths.BANTUAN_FAQ_PAGE)}>Bantuan dan FAQ</MenuItem>
            </>
          ) : (
            <>
              <MenuItem onClick={() => navigate(paths.LOGIN_PAGE)}>
                Login
              </MenuItem>
            </>
          )}
        </MenuList>
      </Menu>
    </Flex>
  );
};

export default UserMenu;
