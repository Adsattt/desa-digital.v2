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
  const [topInnovations, setTopInnovations] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopInnovations = async () => {
      setLoading(true);
      const db = getFirestore();
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setTopInnovations([]);
        setLoading(false);
        return;
      }

      try {
        // 1. Get profilInovator doc(s) for current user
        const profilQuery = query(
          collection(db, "profilInovator"),
          where("userId", "==", currentUser.uid)
        );
        const profilSnapshot = await getDocs(profilQuery);
        if (profilSnapshot.empty) {
          setTopInnovations([]);
          setLoading(false);
          return;
        }
        const profilDoc = profilSnapshot.docs[0];
        const inovatorId = profilDoc.id;

        // 2. Get inovasi documents for that inovatorId
        const inovasiQuery = query(
          collection(db, "inovasi"),
          where("inovatorId", "==", inovatorId)
        );
        const inovasiSnapshot = await getDocs(inovasiQuery);

        if (inovasiSnapshot.empty) {
          setTopInnovations([]);
          setLoading(false);
          return;
        }

        // Collect all inovasi document IDs
        const inovasiIds = inovasiSnapshot.docs.map((doc) => doc.id);

        // 3. Query menerapkanInovasi where inovasiId IN inovasiIds in chunks (max 10 per query)
        const chunkSize = 10;
        let allMenerapkanDocs: QueryDocumentSnapshot<DocumentData>[] = [];

        for (let i = 0; i < inovasiIds.length; i += chunkSize) {
          const chunk = inovasiIds.slice(i, i + chunkSize);
          const menerapkanQuery = query(
            collection(db, "menerapkanInovasi"),
            where("inovasiId", "in", chunk)
          );
          const menerapkanSnapshot = await getDocs(menerapkanQuery);
          allMenerapkanDocs = allMenerapkanDocs.concat(menerapkanSnapshot.docs);
        }

        if (allMenerapkanDocs.length === 0) {
          setTopInnovations([]);
          setLoading(false);
          return;
        }

        // Count namaDesa occurrences
        const countMap: Record<string, number> = {};
        allMenerapkanDocs.forEach((doc) => {
          const data = doc.data();
          const namaDesa = data.namaDesa;
          if (namaDesa) {
            countMap[namaDesa] = (countMap[namaDesa] || 0) + 1;
          }
        });

        // Sort by count descending and pick top 3
        const sortedByCount = Object.entries(countMap)
          .sort((a, b) => {
            if (b[1] === a[1]) {
              return a[0].localeCompare(b[0]); // Alphabetical sort (ascending)
            }
            return b[1] - a[1]; // Sort by count (descending)
          })
          .slice(0, 3)
          .map(([name, count]) => ({ name, count }));

        setTopInnovations(sortedByCount);
      } catch (error) {
        console.error("Error fetching innovations:", error);
        setTopInnovations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopInnovations();
  }, []);

  // Podium order: 2nd place (index 1), 1st place (index 0), 3rd place (index 2)
  const podiumOrder = [topInnovations[1], topInnovations[0], topInnovations[2]];

  const getBarColor = (index: number) => {
    switch (index) {
      case 1:
        return podiumStyles.colors.first;
      case 0:
        return podiumStyles.colors.second;
      case 2:
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
            const actualRank = topInnovations.indexOf(item) + 1;
            const height = 100 - (index === 1 ? 0 : 20);
            return (
              <div key={item.name} style={podiumStyles.item}>
                <div style={podiumStyles.name}>{item.name}</div>
                <div
                  style={{
                    ...podiumStyles.barBase,
                    backgroundColor: getBarColor(index),
                    height: `${height}px`,
                    position: "relative",
                    boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <div style={podiumStyles.rankLabel}>
                    <span style={{ fontSize: "18pt" }}>{actualRank}</span>
                    <span style={{ fontSize: "10pt" }}>
                      {getRankLabel(actualRank).replace(/[0-9]/g, "")}
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