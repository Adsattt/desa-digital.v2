import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "src/firebase/clientApp";

type UserContextType = {
  uid: string | null;
  role: string | null;
  isInnovatorVerified: boolean;
  isVillageVerified: boolean;
  isInnovationVerified: boolean;
  loading: boolean;
  error: Error | null;
};

const UserContext = createContext<UserContextType>({
  uid: null,
  role: null,
  isInnovatorVerified: false,
  isVillageVerified: false,
  isInnovationVerified: false,
  loading: true,
  error: null,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authUser, loadingAuth, authError] = useAuthState(auth);
  const [role, setRole] = useState<string | null>(null);
  const [isInnovatorVerified, setInnovatorVerified] = useState(false);
  const [isVillageVerified, setVillageVerified] = useState(false);
  const [isInnovationVerified, setInnovationVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!authUser) {
          setRole(null);
          setInnovatorVerified(false);
          setVillageVerified(false);
        } else {
          // 1) Fetch role dari koleksi "users"
          const userSnap = await getDoc(doc(firestore, "users", authUser.uid));
          const userData = userSnap.exists() ? userSnap.data() : {};
          setRole((userData as any).role || null);

          // 2) Cek status inovator (jika ada)
          const innovSnap = await getDoc(
            doc(firestore, "innovators", authUser.uid)
          );
          setInnovatorVerified(
            innovSnap.exists() &&
              (innovSnap.data() as any).status === "Terverifikasi"
          );

          // 3) Cek status desa (jika ada)
          const villageSnap = await getDoc(
            doc(firestore, "villages", authUser.uid)
          );
          setVillageVerified(
            villageSnap.exists() &&
              (villageSnap.data() as any).status === "Terverifikasi"
          );

          const innovationSnap = await getDoc(
            doc(firestore, "innovations", authUser.uid)
          );
          setInnovationVerified(
            innovationSnap.exists() &&
              (innovationSnap.data() as any).status === "Terverifikasi"
          );

          let q;
          q = query(
            collection(firestore, "innovations"),
            where("inovatorId", "==", authUser.uid)
          );
          await getDocs(q).then((snapshot) => {
            if (snapshot.empty) {
              setInnovationVerified(false);
            } else {
              snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.status === "Terverifikasi") {
                  setInnovationVerified(true);
                }
              });
            }
          });
        }
      } catch (err: any) {
        console.error("Error loading user context:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    // tunggu dulu auth selesai
    if (!loadingAuth) {
      loadUserData();
    }
  }, [authUser, loadingAuth]);

  return (
    <UserContext.Provider
      value={{
        uid: authUser?.uid || null,
        role,
        isInnovatorVerified,
        isVillageVerified,
        isInnovationVerified,
        loading,
        error: error || (authError as Error) || null,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
