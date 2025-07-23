import { useEffect, useState } from "react";
import { collection, getDocs, query, where, Timestamp, getFirestore } from "firebase/firestore";
import { Box, Flex, Text, Image } from "@chakra-ui/react";
import DateRangeFilter from "./dateFilter";
import filterIcon from "../../../../assets/icons/icon-filter.svg";
import {
  cardStyle, titleText, descriptionText,
  numberTextStyle, labelTextStyle, trendTextStyle
} from "./_infoCardsStyle";

const InfoCards = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);

  const [totals, setTotals] = useState({
    innovations: 0,
    innovators: 0,
    villages: 0,
    provinces: 0,
  });

  const [trends, setTrends] = useState({
    innovations: 0,
    innovators: 0,
    villages: 0,
    provinces: 0,
  });

  const getCount = async (colName: string, fromT?: Timestamp, toT?: Timestamp) => {
    const db = getFirestore();
    let q;
    if (fromT && toT) {
      q = query(
        collection(db, colName),
        where("createdAt", ">=", fromT),
        where("createdAt", "<=", toT)
      );
    } else {
      q = collection(db, colName);
    }
    const snap = await getDocs(q);
    return snap.size;
  };

  const getProvinceCount = async (fromT?: Timestamp, toT?: Timestamp) => {
    const db = getFirestore();
    let q;
    if (fromT && toT) {
      q = query(
        collection(db, "villages"),
        where("createdAt", ">=", fromT),
        where("createdAt", "<=", toT)
      );
    } else {
      q = collection(db, "villages");
    }
    const snap = await getDocs(q);
    const provinces = new Set<string>();

    const capitalizeWords = (str: string) =>
      str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());

    snap.forEach(doc => {
      const data = doc.data();
        if (data.lokasi.provinsi?.label)
          provinces.add(data.lokasi.provinsi.label);
    });
    return provinces.size;
  };

  const calculateTrends = async (fromDate: Date, toDate: Date) => {
    const fromTimestamp = Timestamp.fromDate(fromDate);
    const toTimestamp = Timestamp.fromDate(toDate);

    // Calculate previous period (same length, immediately before current)
    const periodLength = toDate.getTime() - fromDate.getTime();
    const prevFrom = new Date(fromDate.getTime() - periodLength);
    const prevTo = new Date(toDate.getTime() - periodLength);
    const prevFromTimestamp = Timestamp.fromDate(prevFrom);
    const prevToTimestamp = Timestamp.fromDate(prevTo);

    // Fetch counts for current and previous periods concurrently
    const [
      currInnovators, prevInnovators,
      currInnovations, prevInnovations,
      currVillages, prevVillages,
      currProvinces, prevProvinces
    ] = await Promise.all([
      getCount("innovators", fromTimestamp, toTimestamp),
      getCount("innovators", prevFromTimestamp, prevToTimestamp),

      getCount("innovations", fromTimestamp, toTimestamp),
      getCount("innovations", prevFromTimestamp, prevToTimestamp),

      getCount("villages", fromTimestamp, toTimestamp),
      getCount("villages", prevFromTimestamp, prevToTimestamp),

      getProvinceCount(fromTimestamp, toTimestamp),
      getProvinceCount(prevFromTimestamp, prevToTimestamp),
    ]);

    setTotals({
      innovators: currInnovators,
      innovations: currInnovations,
      villages: currVillages,
      provinces: currProvinces,
    });

    setTrends({
      innovators: currInnovators - prevInnovators,
      innovations: currInnovations - prevInnovations,
      villages: currVillages - prevVillages,
      provinces: currProvinces - prevProvinces,
    });
  };

  useEffect(() => {
    // Default to current year Jan 1 - Dec 31
    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), 0, 1);
    const defaultTo = new Date(now.getFullYear(), 11, 31);
    setFrom(defaultFrom);
    setTo(defaultTo);
    calculateTrends(defaultFrom, defaultTo);
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

      <Flex direction={{ base: "column", md: "row" }} gap={4} mb={4}>
        <Box flex="1" {...cardStyle}>
          <Text {...numberTextStyle}>{totals.villages}</Text>
          <Text {...labelTextStyle}>Desa Digital</Text>
          {renderTrend(trends.villages)}
        </Box>
        <Box flex="1" {...cardStyle}>
          <Text {...numberTextStyle}>{totals.provinces}</Text>
          <Text {...labelTextStyle}>Provinsi</Text>
          {renderTrend(trends.provinces)}
        </Box>
      </Flex>

      <Flex direction={{ base: "column", md: "row" }} gap={4} mb={4}>
        <Box flex="1" {...cardStyle}>
          <Text {...numberTextStyle}>{totals.innovations}</Text>
          <Text {...labelTextStyle}>Inovasi</Text>
          {renderTrend(trends.innovations)}
        </Box>
        <Box flex="1" {...cardStyle}>
          <Text {...numberTextStyle}>{totals.innovators}</Text>
          <Text {...labelTextStyle}>Inovator</Text>
          {renderTrend(trends.innovators)}
        </Box>
      </Flex>

      {showFilter && (
        <DateRangeFilter
          isOpen={showFilter}
          onClose={() => setShowFilter(false)}
          onApply={(fromDate, toDate) => {
            setFrom(fromDate);
            setTo(toDate);
            calculateTrends(fromDate, toDate);
            setShowFilter(false);
          }}
        />
      )}
    </Box>
  );
};

export default InfoCards;