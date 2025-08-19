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

  const calculateData = async (fromDate: Date, toDate: Date) => {
    const db = getFirestore();
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Gunakan UTC-safe Timestamp dari Date.UTC
    const fromUTC = Timestamp.fromMillis(Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0));
    const toUTC = Timestamp.fromMillis(Date.UTC(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59));

    const diffMs = toUTC.toMillis() - fromUTC.toMillis();
    const prevFromUTC = Timestamp.fromMillis(fromUTC.toMillis() - diffMs);
    const prevToUTC = Timestamp.fromMillis(toUTC.toMillis() - diffMs);

    try {
      const inovatorQuery = query(
        collection(db, "innovators"),
        where("id", "==", currentUser.uid)
      );
      const inovatorSnap = await getDocs(inovatorQuery);
      if (inovatorSnap.empty) return;

      const inovatorId = inovatorSnap.docs[0].id;

      const getInovasiCount = async (fromT: Timestamp, toT: Timestamp) => {
        const q = query(
          collection(db, "innovations"),
          where("innovatorId", "==", inovatorId),
          where("createdAt", ">=", fromT),
          where("createdAt", "<=", toT)
        );
        return (await getDocs(q)).size;

      };

      const getDesaCount = async (fromT: Timestamp, toT: Timestamp) => {
        const inovasiSnap = await getDocs(
          query(collection(db, "innovations"), where("innovatorId", "==", inovatorId))
        );

        const inovasiIds = inovasiSnap.docs
          .filter((doc) => {
            const createdAt = doc.data().createdAt;
            if (!createdAt) return false;
            const time = createdAt.toMillis();
            return time >= fromT.toMillis() && time <= toT.toMillis();
          })
          .map((doc) => doc.id);

        if (inovasiIds.length === 0) return 0;

        const klaimSnap = await getDocs(collection(db, "claimInnovations"));
        const matchedDesa = new Set<string>();

        klaimSnap.docs.forEach((doc) => {
          const data = doc.data();
          if (inovasiIds.includes(data.inovasiId) && data.namaDesa) {
            matchedDesa.add(data.namaDesa);
          }
        });

        console.log("klaimSnap", klaimSnap);
        console.log("matchedDesa", matchedDesa);
        console.log("matchedDesasize", matchedDesa.size);

        return matchedDesa.size;
      };


      const [currInovasi, prevInovasi, currDesa, prevDesa] = await Promise.all([
        getInovasiCount(fromUTC, toUTC),
        getInovasiCount(prevFromUTC, prevToUTC),
        getDesaCount(fromUTC, toUTC),
        getDesaCount(prevFromUTC, prevToUTC),
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
    const startOfYear = new Date(Date.UTC(now.getFullYear(), 0, 1));
    const endOfYear = new Date(Date.UTC(now.getFullYear(), 11, 31));
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
          initialFromDate={from}
          initialToDate={to}
        />
      )}
    </Box>
  );
};

export default InfoCards;