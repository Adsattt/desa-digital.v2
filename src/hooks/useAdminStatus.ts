import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "src/firebase/clientApp";
import { doc, getDoc } from "firebase/firestore";

export const useAdminStatus = () => {
  const [user, loadingAuth] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists() && userDoc.data()?.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Failed to check admin status", err);
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    };

    checkAdmin();
  }, [user]);

  return { isAdmin, checking, user, loadingAuth };
};
