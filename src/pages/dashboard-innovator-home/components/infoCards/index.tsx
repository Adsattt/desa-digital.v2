import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  getFirestore,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Box, Flex, Text, Image } from "@chakra-ui/react";
import DateRangeFilter from "./dateFilter";
import filterIcon from "../../../../assets/icons/icon-filter.svg";

import {
  cardStyle,
  titleText,
  descriptionText,
  numberTextStyle,
  labelTextStyle,
  trendTextStyle,
} from "./_infoCardsStyle";

const InfoCards = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);

  const [inovasiCount, setInovasiCount] = useState(0);
  const [desaCount, setDesaCount] = useState(0);
  const [trendInovasi, setTrendInovasi] = useState(0);
  const [trendDesa, setTrendDesa] = useState(0);

  const db = getFirestore();

  const calculateData = async (fromDate: Date, toDate: Date) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const fromTimestamp = Timestamp.fromDate(fromDate);
    const toTimestamp = Timestamp.fromDate(toDate);
    const diff = toDate.getTime() - fromDate.getTime();
    const prevFrom = new Date(fromDate.getTime() - diff);
    const prevTo = new Date(toDate.getTime() - diff);
    const prevFromTimestamp = Timestamp.fromDate(prevFrom);
    const prevToTimestamp = Timestamp.fromDate(prevTo);

    try {
      const inovatorQuery = query(
        collection(db, "profilInovator"),
        where("userId", "==", user.uid)
      );
      const inovatorSnap = await getDocs(inovatorQuery);
      if (inovatorSnap.empty) return;

      const inovatorId = inovatorSnap.docs[0].id;

      const getInovasiCount = async (fromT: Timestamp, toT: Timestamp) => {
        const q = query(
          collection(db, "inovasi"),
          where("inovatorId", "==", inovatorId),
          where("createdAt", ">=", fromT),
          where("createdAt", "<=", toT)
        );
        return (await getDocs(q)).size;
      };

      const getDesaCount = async (fromT: Timestamp, toT: Timestamp) => {
        const inovasiSnap = await getDocs(
          query(collection(db, "inovasi"), where("inovatorId", "==", inovatorId))
        );

        const inovasiIds = inovasiSnap.docs
          .filter((doc) => {
            const createdAt = doc.data().createdAt;
            return createdAt?.toDate() >= fromT.toDate() && createdAt?.toDate() <= toT.toDate();
          })
          .map((doc) => doc.id);

        if (inovasiIds.length === 0) return 0;

        const menerapkanSnap = await getDocs(collection(db, "menerapkanInovasi"));
        const matchedDesa = new Set<string>();

        menerapkanSnap.docs.forEach((doc) => {
          const data = doc.data();
          if (inovasiIds.includes(data.inovasiId) && data.namaDesa) {
            matchedDesa.add(data.namaDesa);
          }
        });

        return matchedDesa.size;
      };

      const [currInovasi, prevInovasi, currDesa, prevDesa] = await Promise.all([
        getInovasiCount(fromTimestamp, toTimestamp),
        getInovasiCount(prevFromTimestamp, prevToTimestamp),
        getDesaCount(fromTimestamp, toTimestamp),
        getDesaCount(prevFromTimestamp, prevToTimestamp),
      ]);

      setInovasiCount(currInovasi);
      setDesaCount(currDesa);
      setTrendInovasi(currInovasi - prevInovasi);
      setTrendDesa(currDesa - prevDesa);

    } catch (err) {
      console.error("Failed to calculate data:", err);
    }
  };

  useEffect(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    setFrom(startOfYear);
    setTo(endOfYear);
    calculateData(startOfYear, endOfYear);
  }, []);

  const renderTrend = (value: number) => {
    const arrow = value >= 0 ? "↑" : "↓";
    const color = value >= 0 ? "green.500" : "red.500";
    return (
      <Text {...trendTextStyle} color={color}>
        {arrow} {Math.abs(value)} sejak periode sebelumnya
      </Text>
    );
  };

  return (
    <Box p={4} mt={3}>
      <Flex justify="space-between" align="flex-start" mb={3}>
        <Box>
          <Text {...titleText}>Informasi Umum</Text>
          <Text {...descriptionText}>
            Periode: {from?.toLocaleDateString()} - {to?.toLocaleDateString()}
          </Text>
        </Box>
        <Image
          onClick={() => setShowFilter(true)}
          src={filterIcon}
          alt="Filter"
          boxSize="16px"
          cursor="pointer"
          mt={2}
        />
      </Flex>

      <Flex direction={{ base: "column", md: "row" }} gap={4}>
        <Box flex="1" {...cardStyle}>
          <Text {...numberTextStyle}>{inovasiCount}</Text>
          <Text {...labelTextStyle}>Inovasi</Text>
          {renderTrend(trendInovasi)}
        </Box>
        <Box flex="1" {...cardStyle}>
          <Text {...numberTextStyle}>{desaCount}</Text>
          <Text {...labelTextStyle}>Desa Digital</Text>
          {renderTrend(trendDesa)}
        </Box>
      </Flex>

      {showFilter && (
        <DateRangeFilter
          onClose={() => setShowFilter(false)}
          onApply={(fromDate, toDate) => {
            setFrom(fromDate);
            setTo(toDate);
            calculateData(fromDate, toDate);
            setShowFilter(false);
          }}
        />
      )}
    </Box>
  );
};

export default InfoCards;