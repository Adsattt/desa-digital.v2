import React, { useEffect, useState } from "react";
import { Box, Text, Flex, Image } from "@chakra-ui/react";

import {
  chartContainerStyle, chartWrapperStyle,
  barGroupStyle, barStyle, labelStyle,
  legendContainerStyle, legendItemStyle, legendDotStyle,
  titleStyle, lineStyle, xAxisStyle, yAxisStyle,
  yAxisLabelStyle, yAxisWrapperStyle,
  chartBarContainerStyle, barAndLineWrapperStyle
} from "./_chartInnovationStyle";
import YearRangeFilter from "./dateFilter";

import filterIcon from "../../../../assets/icons/icon-filter.svg";
import downloadIcon from "../../../../assets/icons/icon-download.svg";
import { getFirestore, collection, getDocs } from "firebase/firestore";

type MaturityClass = "A" | "B" | "C" | "D";

type Inovasi = {
  maturityClass: MaturityClass;
  maturityLevel: number;
};

type ChartValue = {
  id: MaturityClass;
  value: number;
  color: string;
};

type ChartData = {
  category: string;
  values: ChartValue[];
};

type AverageData = {
  category: string;
  value: number;
};

const getYAxisLabels = (max: number, step: number): number[] => {
  const roundedMax = Math.ceil(max / step) * step;
  const labels: number[] = [];
  for (let i = roundedMax; i >= 0; i -= step) {
    labels.push(i);
  }
  return labels;
};

const ChartInnovation2 = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [averageData, setAverageData] = useState<AverageData[]>([]);
  const [maxValue, setMaxValue] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [yearRange, setYearRange] = useState({ from: 2020, to: 2025 });

  useEffect(() => {
    const fetchData = async () => {
      const db = getFirestore();
      const snapshot = await getDocs(collection(db, "innovations"));
      const rawData = snapshot.docs.map(doc => doc.data()) as Inovasi[];

      const classes: MaturityClass[] = ["A", "B", "C", "D"];
      const colors: Record<MaturityClass, string> = {
        A: "#568A73",
        B: "#88A0CA",
        C: "#4C73C7",
        D: "#215B59"
      };

      const grouped: Record<MaturityClass, number[]> = {
        A: [],
        B: [],
        C: [],
        D: []
      };

      rawData.forEach(item => {
        const cls = item.maturityClass;
        const level = item.maturityLevel;
        if (classes.includes(cls) && typeof level === "number") {
          grouped[cls].push(level);
        }
      });

      const chartData: ChartData[] = classes.map(cls => ({
        category: `Kelas ${cls}`,
        values: [
          {
            id: cls,
            value: grouped[cls].length,
            color: colors[cls]
          }
        ]
      }));

      const avgData: AverageData[] = classes.map(cls => ({
        category: `Kelas ${cls}`,
        value:
          grouped[cls].length > 0
            ? grouped[cls].reduce((sum, val) => sum + val, 0) / grouped[cls].length
            : 0
      }));

      const maxVal = Math.max(
        ...chartData.flatMap(group => group.values.map(v => v.value)),
        ...avgData.map(v => v.value)
      );

      setData(chartData);
      setAverageData(avgData);
      setMaxValue(maxVal);
    };

    fetchData();
  }, []);

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={2}>
        <Text {...titleStyle}>Perkembangan Inovasi Desa</Text>
        <Flex justify="flex-end" align="center">
          <Image src={filterIcon} alt="Filter" boxSize="16px" cursor="pointer" ml={2} />
          <Image src={downloadIcon} alt="Download" boxSize="16px" cursor="pointer" ml={2} />
        </Flex>
      </Flex>
      <Box {...chartContainerStyle}>
        <Flex {...legendContainerStyle}>
          <Flex {...legendItemStyle}>
            <Box {...legendDotStyle} bg="#568A73" />
            <Text>A</Text>
          </Flex>
          <Flex {...legendItemStyle}>
            <Box {...legendDotStyle} bg="#88A0CA" />
            <Text>B</Text>
          </Flex>
          <Flex {...legendItemStyle}>
            <Box {...legendDotStyle} bg="#4C73C7" />
            <Text>C</Text>
          </Flex>
          <Flex {...legendItemStyle}>
            <Box {...legendDotStyle} bg="#215B59" />
            <Text>D</Text>
          </Flex>
          <Flex {...legendItemStyle}>
            <Box {...legendDotStyle} bg="#ECC600" />
            <Text>Rata-rata</Text>
          </Flex>
        </Flex>
        <Box {...chartWrapperStyle}>
          <Flex {...yAxisWrapperStyle}>
            {getYAxisLabels(maxValue, 10).map((label, index) => (
            <Text key={index} {...yAxisLabelStyle}>
                {label}
            </Text>
            ))}
          </Flex>

          <Flex {...chartBarContainerStyle}>
            <Box {...yAxisStyle} />
            <Flex {...barAndLineWrapperStyle}>
              {data.map((group, groupIndex) => (
                <Box key={groupIndex} {...barGroupStyle}>
                  {group.values.map((item) => (
                    <Box
                      key={item.id}
                      {...barStyle}
                      height={`${(item.value / maxValue) * 100}%`}
                      bg={item.color}
                    />
                  ))}
                  <Text {...labelStyle}>{group.category}</Text>
                </Box>
              ))}
              <Box position="absolute" width="100%" height="100%" top={0} pointerEvents="none">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path
                    d={`M 16.66,${100 - (averageData[0]?.value / maxValue) * 100}
                        C 30,${100 - (averageData[0]?.value / maxValue) * 100},
                          36,${100 - (averageData[1]?.value / maxValue) * 100},
                          50,${100 - (averageData[1]?.value / maxValue) * 100}
                        S 70,${100 - (averageData[2]?.value / maxValue) * 100},
                          83.33,${100 - (averageData[2]?.value / maxValue) * 100}`}
                    {...lineStyle}
                  />
                </svg>
              </Box>
              <Box {...xAxisStyle} />
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default ChartInnovation2;