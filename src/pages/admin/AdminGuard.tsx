import Loading from "Components/loading";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "src/firebase/clientApp";
import AccessDenied from "./AccessDenied";

type AdminGuardProps = {
  children?: React.ReactNode;
};

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const checkAdminStatus = async () => {
      setLoading(true);
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists() && userDoc.data()?.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    checkAdminStatus();
  }, [user]);

  if (loading) {
    return <Loading />;
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};
export default AdminGuard;
