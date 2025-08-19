import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { podiumStyles } from "./_topInnovationsStyle";

const TopInnovations = () => {
  const [topInnovations, setTopInnovations] = useState<
    { name: string; count: number; rank: number; label: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [inovatorProfile, setInovatorProfile] = useState<{ namaInovator?: string } | null>(null);

  useEffect(() => {
    const fetchTopInnovations = async () => {
      setLoading(true);
      const db = getFirestore();
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) return;

      try {
        const profilQuery = query(
          collection(db, "innovators"),
          where("id", "==", currentUser.uid)
        );
        const profilSnapshot = await getDocs(profilQuery);

        if (profilSnapshot.empty) {
          setTopInnovations([]);
          setLoading(false);
          return;
        }

        const profilDoc = profilSnapshot.docs[0];
        const inovatorId = profilDoc.id;
        setInovatorProfile(profilDoc.data());

        // Ambil semua inovasi dari inovator
        const inovasiQuery = query(
          collection(db, "innovations"),
          where("innovatorId", "==", inovatorId)
        );
        const inovasiSnapshot = await getDocs(inovasiQuery);

        const inovasiData = inovasiSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as { namaInovasi: string }),
        }));

        if (inovasiData.length === 0) {
          setTopInnovations([]);
          return;
        }

        // Ambil semua data berdasarkan inovasiId
        const inovasiIds = inovasiData.map((item) => item.id);

        const claimQuery = query(
          collection(db, "claimInnovations"),
          where("inovasiId", "in", inovasiIds)
        );
        const claimSnapshot = await getDocs(claimQuery);

        // Hitung frekuensi inovasiId
        const freqMap: Record<string, number> = {};
        claimSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.inovasiId) {
            freqMap[data.inovasiId] = (freqMap[data.inovasiId] || 0) + 1;
          }
        });

        // Gabungkan ID dengan nama inovasi
        const countInovasi = inovasiData
          .filter((item) => item.namaInovasi)
          .map((item) => ({
            name: item.namaInovasi,
            count: freqMap[item.id] || 0,
          }))
          .filter((item) => item.count > 0);

        if (countInovasi.length === 0) {
          setTopInnovations([]);
          return;
        }

        const sorted = [...countInovasi].sort((a, b) => {
          if (b.count === a.count) return a.name.localeCompare(b.name);
          return b.count - a.count;
        });

        const topThree = sorted.slice(0, 3);
        const allSameCount = topThree.every(item => item.count === topThree[0].count);
        let ranked: { name: string; count: number; rank: number; label: string }[];

        if (allSameCount) {
          ranked = topThree.map((item) => ({
            ...item,
            rank: 1,
            label: "1st",
          }));
        } else {
          let currentRank = 1;
          let lastCount: number | null = null;

          ranked = topThree.map((item) => {
            if (lastCount !== null && item.count !== lastCount) {
              currentRank++;
            }
            lastCount = item.count;

            return {
              ...item,
              rank: currentRank,
              label: `${currentRank}${["st", "nd", "rd"][currentRank - 1] || "th"}`
            };
          });
        }

        setTopInnovations(ranked);
      } catch (error) {
        console.error("Error fetching innovations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopInnovations();
  }, []);

  // === Penentuan tinggi & urutan podium ===
  const getPodiumOrder = (arr: typeof topInnovations) => {
    const allSameRank = arr.every(el => el.rank === arr[0].rank);
    if (arr.length === 1) return [{ ...arr[0], height: 100, order: 2 }];
    if (arr.length === 2) {
      return arr.map((item, idx) => {
        let height = "80";
        let order = 0;
        if (allSameRank) {
          order = idx === 0 ? 1 : 3;
          height = "80";
        } else {
          order = item.rank === 1 ? 1 : 3;
          height = item.rank === 1 ? "100" : "80";
        }
        return { ...item, height: Number(height), order };
      });
    }
    if (arr.length === 3) {
      if (allSameRank) {
        return arr.map((item, idx) => ({
          ...item,
          height: 80,
          order: idx + 1
        }));
      } else {
        const rank1Count = arr.filter(el => el.rank === 1).length;
        return arr.map((item) => {
          let order = 0;
          if (rank1Count === 1) {
            if (item.rank === 1) {
              order = 2;
            } else {
              const rank2Items = arr.filter(el => el.rank === 2);
              const thisIndexInRank2 = rank2Items.indexOf(item);
              order = thisIndexInRank2 === 0 ? 1 : 3;
            }
          } else if (rank1Count === 2) {
            if (item.rank === 1) {
              order = arr.indexOf(item) === 0 ? 1 : 2;
            } else {
              order = 3;
            }
          } else {
            order = item.rank === 1 ? 2 : item.rank === 2 ? 1 : 3;
          }
          const height =
            item.rank === 1 ? 100 :
            item.rank === 2 ? 80 : 60;
          return { ...item, height, order };
        });
      }
    }
    return arr.map(item => ({ ...item, height: 100, order: 0 }));
  };

  const podiumOrder = getPodiumOrder(topInnovations);

  const getBarColor = (rank: number) => {
    switch (rank) {
      case 1:
        return podiumStyles.colors.first;
      case 2:
        return podiumStyles.colors.second;
      case 3:
        return podiumStyles.colors.third;
      default:
        return "#ccc";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "15px" }}>
      <h2 style={podiumStyles.title}>
        Inovasi Unggulan {inovatorProfile?.namaInovator || ""}
      </h2>
      <div style={podiumStyles.container}>
        {loading ? (
          <div>Loading...</div>
        ) : (
          podiumOrder.map((item) => (
            <div key={item.name} style={{ ...podiumStyles.item, order: item.order }}>
              <div style={podiumStyles.name}>{item.name}</div>
              <div
                style={{
                  ...podiumStyles.barBase,
                  backgroundColor: getBarColor(item.rank),
                  height: `${item.height}px`,
                  position: "relative",
                  boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)"
                }}
              >
                <div style={podiumStyles.rankLabel}>
                  <span style={{ fontSize: "18pt" }}>{item.rank}</span>
                  <span style={{ fontSize: "10pt" }}>{item.label.replace(/[0-9]/g, "")}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div
        style={{
          width: "90%",
          borderBottom: "2px solid #244E3B",
          marginTop: "-2px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)"
        }}
      />
    </div>
  );
};

export default TopInnovations;