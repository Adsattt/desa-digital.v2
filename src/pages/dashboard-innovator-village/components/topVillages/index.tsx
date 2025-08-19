import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { podiumStyles } from "./_topVillagesStyle";

type TopItem = {
  id: string;
  name: string;
  count: number;
  rank: number;
  label: string;
};

const TopVillages = () => {
  const [topVillages, setTopVillages] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [inovatorProfile, setInovatorProfile] = useState<{ namaInovator?: string } | null>(null);

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
        setInovatorProfile(profilDoc.data());

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

        // Chunk array helper
        const chunkArray = <T,>(arr: T[], size: number): T[][] => {
          const chunks: T[][] = [];
          for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
          }
          return chunks;
        };

        const chunks = chunkArray(inovasiIds, 10);
        type DesaDoc = { desaId?: string; namaDesa?: string };
        let desaDocs: DesaDoc[] = [];

        for (const chunk of chunks) {
          const desaQuery = query(
            collection(db, "claimInnovations"),
            where("inovasiId", "in", chunk)
          );
          const snapshot = await getDocs(desaQuery);
          desaDocs.push(...snapshot.docs.map((doc) => doc.data()));
        }

        // Count namaDesa occurrences
        const countMap: Record<string, { namaDesa: string; count: number }> = {};
        desaDocs.forEach((item: { desaId?: string; namaDesa?: string }) => {
          if (item.desaId && item.namaDesa) {
            if (!countMap[item.desaId]) {
              countMap[item.desaId] = { namaDesa: item.namaDesa, count: 0 };
            }
            countMap[item.desaId].count++;
          }
        });

        const sorted = Object.entries(countMap)
          .sort((a, b) => {
            if (b[1].count === a[1].count) {
              return a[1].namaDesa.localeCompare(b[1].namaDesa);
            }
            return b[1].count - a[1].count;
          })
          .slice(0, 3)
          .map(([desaId, value]) => ({
            id: desaId,
            name: value.namaDesa,
            count: value.count,
          }));

        if (sorted.length === 0) {
          setTopVillages([]);
          setLoading(false);
          return;
        }

        const allSameCount = sorted.every(item => item.count === sorted[0].count);
        let ranked: TopItem[];

        if (allSameCount) {
          ranked = sorted.map(item => ({
            ...item,
            rank: 1,
            label: "1st"
          }));
        } else {
          let currentRank = 1;
          let lastCount: number | null = null;

          ranked = sorted.map((item) => {
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

        setTopVillages(ranked);
      } catch (error) {
        console.error("Error fetching top villages:", error);
        setTopVillages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopVillages();
  }, []);

  // Urutan podium versi 2, tapi style versi 1
  let podiumOrder: TopItem[] = [];
  const allSameRank = topVillages.every(el => el.rank === topVillages[0]?.rank);

  if (topVillages.length === 1) {
    podiumOrder = [topVillages[0]];
  } else if (topVillages.length === 2) {
    if (allSameRank) {
      podiumOrder = [topVillages[0], topVillages[1]];
    } else {
      podiumOrder = [
        topVillages.find(i => i.rank === 1)!,
        topVillages.find(i => i.rank === 2)!
      ];
    }
  } else if (topVillages.length === 3) {
    if (allSameRank) {
      podiumOrder = [...topVillages];
    } else {
      const rank1Count = topVillages.filter(el => el.rank === 1).length;
      if (rank1Count === 1) {
        const rank1 = topVillages.find(el => el.rank === 1)!;
        const rank2Items = topVillages.filter(el => el.rank === 2);
        podiumOrder = [rank2Items[0], rank1, rank2Items[1]];
      } else if (rank1Count === 2) {
        const rank1Items = topVillages.filter(el => el.rank === 1);
        const rank2 = topVillages.find(el => el.rank === 2)!;
        podiumOrder = [rank1Items[0], rank1Items[1], rank2];
      } else {
        podiumOrder = [
          topVillages.find(el => el.rank === 2)!,
          topVillages.find(el => el.rank === 1)!,
          topVillages.find(el => el.rank === 3)!
        ];
      }
    }
  }

  const getBarColor = (rank: number) => {
    switch (rank) {
      case 1: return podiumStyles.colors.first;
      case 2: return podiumStyles.colors.second;
      case 3: return podiumStyles.colors.third;
      default: return "#ccc";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "15px" }}>
      <h2 style={podiumStyles.title}>
        Desa Unggulan {inovatorProfile?.namaInovator || ""}
      </h2>
      <div style={podiumStyles.container}>
        {loading ? (
          <div>Loading...</div>
        ) : (
          podiumOrder.map((item) => {
            if (!item) return null;

            // Tinggi bar versi 2
            let height = 100;
            if (topVillages.length === 1) height = 100;
            else if (topVillages.length === 2) {
              if (allSameRank) height = 100;
              else height = item.rank === 1 ? 100 : 80;
            }
            else if (topVillages.length === 3) {
              if (allSameRank) height = 100;
              else height = item.rank === 1 ? 100 : item.rank === 2 ? 80 : 60;
            }

            return (
              <div key={item.name} style={podiumStyles.item}>
                <div style={podiumStyles.name}>{item.name}</div>
                <div
                  style={{
                    ...podiumStyles.barBase,
                    backgroundColor: getBarColor(item.rank),
                    height: `${height}px`,
                    position: "relative",
                    boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <div style={podiumStyles.rankLabel}>
                    <span style={{ fontSize: "18pt" }}>{item.rank}</span>
                    <span style={{ fontSize: "10pt" }}>
                      {item.label.replace(/[0-9]/g, "")}
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