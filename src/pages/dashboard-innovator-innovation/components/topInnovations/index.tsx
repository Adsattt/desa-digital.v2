import { useEffect, useState } from "react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { podiumStyles } from "./_topInnovationsStyle";

const TopInnovations = () => {
  const [topInnovations, setTopInnovations] = useState<
    { name: string; count: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopInnovations = async () => {
      setLoading(true);
      const db = getFirestore();
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) return;

      try {
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

        const inovasiQuery = query(
          collection(db, "inovasi"),
          where("inovatorId", "==", inovatorId)
        );
        const inovasiSnapshot = await getDocs(inovasiQuery);

        const inovasiData = inovasiSnapshot.docs.map((doc) => doc.data());

        const countMap: Record<string, number> = {};
        inovasiData.forEach((item) => {
          const name = item.namaInovasi;
          if (name) {
            countMap[name] = (countMap[name] || 0) + 1;
          }
        });

        const sortedByCount = Object.entries(countMap)
          .sort((a, b) => {
            if (b[1] === a[1]) {
              return a[0].localeCompare(b[0]);
            }
            return b[1] - a[1];
          })
          .slice(0, 3)
          .map(([name, count]) => ({ name, count }));

        setTopInnovations(sortedByCount);
      } catch (error) {
        console.error("Error fetching innovations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopInnovations();
  }, []);

  const podiumOrder = [
    topInnovations[1],
    topInnovations[0],
    topInnovations[2],
  ];

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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "15px" }}>
      <h2 style={podiumStyles.title}>Inovasi Unggulan</h2>
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

export default TopInnovations;