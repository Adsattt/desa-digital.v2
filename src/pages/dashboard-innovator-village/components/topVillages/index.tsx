import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { podiumStyles } from "./_topVillagesStyle";

const TopVillages = () => {
  const [topVillages, setTopVillages] = useState<
    { name: string; count: number; rank?: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopVillages = async () => {
      setLoading(true);
      const db = getFirestore();
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setTopVillages([]);
        setLoading(false);
        return;
      }

      try {
        const profilQuery = query(
          collection(db, "innovators"),
          where("id", "==", currentUser.uid)
        );
        const profilSnapshot = await getDocs(profilQuery);
        if (profilSnapshot.empty) {
          setTopVillages([]);
          setLoading(false);
          return;
        }
        const profilDoc = profilSnapshot.docs[0];
        const inovatorId = profilDoc.id;

        const inovasiQuery = query(
          collection(db, "innovations"),
          where("innovatorId", "==", inovatorId)
        );
        const inovasiSnapshot = await getDocs(inovasiQuery);

        if (inovasiSnapshot.empty) {
          setTopVillages([]);
          setLoading(false);
          return;
        }

        const inovasiIds = inovasiSnapshot.docs.map((doc) => doc.id);
        const chunkSize = 10;
        let allKlaimDocs: QueryDocumentSnapshot<DocumentData>[] = [];

        for (let i = 0; i < inovasiIds.length; i += chunkSize) {
          const chunk = inovasiIds.slice(i, i + chunkSize);
          const klaimQuery = query(
            collection(db, "claimInnovations"),
            where("inovasiId", "in", chunk)
          );
          const klaimSnapshot = await getDocs(klaimQuery);
          allKlaimDocs = allKlaimDocs.concat(klaimSnapshot.docs);
        }

        if (allKlaimDocs.length === 0) {
          setTopVillages([]);
          setLoading(false);
          return;
        }

        const countMap: Record<string, number> = {};
        allKlaimDocs.forEach((doc) => {
          const data = doc.data();
          const namaDesa = data.namaDesa;
          if (namaDesa) {
            countMap[namaDesa] = (countMap[namaDesa] || 0) + 1;
          }
        });

        const entries = Object.entries(countMap);
        const sortedByCount = entries
          .sort((a, b) => {
            if (b[1] === a[1]) {
              return a[0].localeCompare(b[0]);
            }
            return b[1] - a[1];
          })
          .slice(0, 3)
          .map(([name, count]) => ({ name, count }));

        // Determine ranks
        const allSame = sortedByCount.every((item) => item.count === sortedByCount[0].count);

        let ranked: { name: string; count: number; rank: number }[] = [];

        if (allSame) {
          ranked = sortedByCount.map((item) => ({ ...item, rank: 1 }));
        } else {
          let rank = 1;
          let lastCount = -1;
          ranked = sortedByCount.map((item, index) => {
            if (item.count !== lastCount) {
              rank = index + 1;
            }
            lastCount = item.count;
            return { ...item, rank };
          });
        }

        setTopVillages(ranked);
      } catch (error) {
        console.error("Error fetching innovations:", error);
        setTopVillages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopVillages();
  }, []);

  const allRanksAreOne =
    topVillages.length > 1 &&
    topVillages.every((item) => item.rank === 1);

  let podiumOrder = [...topVillages];

  if (allRanksAreOne) {
    podiumOrder.sort((a, b) => a.name.localeCompare(b.name));
  } else if (topVillages.length === 2) {
    podiumOrder = [
      topVillages.find((i) => i.rank === 1) || topVillages[0],
      topVillages.find((i) => i.rank === 2) || topVillages[1],
    ];
  } else if (topVillages.length === 3) {
    podiumOrder = [
      topVillages.find((i) => i.rank === 2) || topVillages[1],
      topVillages.find((i) => i.rank === 1) || topVillages[0],
      topVillages.find((i) => i.rank === 2 && i !== podiumOrder[0]) || topVillages[2],
    ];
  }

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

  const getRankLabel = (rank: number) => {
    switch (rank) {
      case 1:
        return "1st";
      case 2:
        return "2nd";
      case 3:
        return "3rd";
      default:
        return "";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: "15px",
      }}
    >
      <h2 style={podiumStyles.title}>Desa Unggulan</h2>
      <div style={podiumStyles.container}>
        {loading ? (
          <div>Loading...</div>
        ) : (
          podiumOrder.map((item, index) => {
            if (!item) return null;
            const height = item.rank === 1 ? 100 : item.rank === 2 ? 80 : 60;
            return (
              <div key={item.name} style={podiumStyles.item}>
                <div style={podiumStyles.name}>{item.name}</div>
                <div
                  style={{
                    ...podiumStyles.barBase,
                    backgroundColor: getBarColor(item.rank ?? 0),
                    height: `${height}px`,
                    position: "relative",
                    boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <div style={podiumStyles.rankLabel}>
                    <span style={{ fontSize: "18pt" }}>{item.rank}</span>
                    <span style={{ fontSize: "10pt" }}>
                      {getRankLabel(item.rank ?? 0).replace(/[0-9]/g, "")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div
        style={{
          width: "90%",
          borderBottom: "2px solid #244E3B",
          marginTop: "-2px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
        }}
      />
    </div>
  );
};

export default TopVillages;