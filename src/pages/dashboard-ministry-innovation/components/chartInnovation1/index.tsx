import { useEffect, useState } from "react";
import { Box, Text, Flex, Image, Tooltip } from "@chakra-ui/react";

import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getApp } from "firebase/app";

import filterIcon from "../../../../assets/icons/icon-filter.svg";
import downloadIcon from "../../../../assets/icons/icon-download.svg";

import {
    chartContainerStyle, chartWrapperStyle,
    barGroupStyle, barStyle, labelStyle,
    legendContainerStyle, legendItemStyle, legendDotStyle,
    titleStyle, lineStyle, xAxisStyle, yAxisStyle,
    yAxisLabelStyle, yAxisWrapperStyle,
    chartBarContainerStyle, barAndLineWrapperStyle
} from "./_chartInnovationStyle";

type ScaleKey = "developmentScale" | "currentUseScale" | "deploymentScale";

interface ChartBar {
  id: number;
  value: number;
  color: string;
}

interface ChartGroup {
  category: string;
  values: ChartBar[];
}

interface AverageData {
  category: string;
  value: number;
}

const getYAxisLabels = (max: number, step: number): number[] => {
  const roundedMax = Math.ceil(max / step) * step;
  const labels: number[] = [];
  for (let i = roundedMax; i >= 0; i -= step) {
    labels.push(i);
  }
  return labels;
};

const ChartInnovation1 = () => {
  const [chartData, setChartData] = useState<{
    category: string;
    values: { id: number; value: number; color: string }[];
  }[]>([]);
  const [averageData, setAverageData] = useState<{ category: string; value: number }[]>([]);
  const [maxValue, setMaxValue] = useState<number>(100);

  const scaleKeys = ["developmentScale", "currentUseScale", "deploymentScale"];
  const colorPalette = ["#568A73", "#88A0CA", "#4C73C7", "#215B59"];

  useEffect(() => {
    const fetchData = async () => {
      const db = getFirestore(getApp());
      const snapshot = await getDocs(collection(db, "inovasi"));

      const scales: Record<string, number[]> = {
        developmentScale: [0, 0, 0, 0],
        currentUseScale: [0, 0, 0, 0],
        deploymentScale: [0, 0, 0, 0]
      };

      const sums: Record<string, number> = {
        developmentScale: 0,
        currentUseScale: 0,
        deploymentScale: 0
      };

      const counts: Record<string, number> = {
        developmentScale: 0,
        currentUseScale: 0,
        deploymentScale: 0
      };

      snapshot.forEach((doc) => {
        const data = doc.data();

        scaleKeys.forEach((key) => {
          const val: number = data[key];
          if (val >= 1 && val <= 4) {
            scales[key][val - 1]++;
            sums[key] += val;
            counts[key]++;
          }
        });
      });

      const chart = scaleKeys.map((key, index) => ({
        category:
          key === "developmentScale"
            ? "Skala\nPengembangan"
            : key === "currentUseScale"
            ? "Skala\nPenggunaan"
            : "Skala\nPenerapan",
        values: scales[key].map((count, i) => ({
          id: i + 1,
          value: count,
          color: colorPalette[i]
        }))
      }));

      const average = scaleKeys.map((key) => ({
        category:
          key === "developmentScale"
            ? "Skala\nPengembangan"
            : key === "currentUseScale"
            ? "Skala\nPenggunaan"
            : "Skala\nPenerapan",
        value: counts[key] ? sums[key] / counts[key] : 0
      }));

      const maxVal = Math.max(
        ...scaleKeys.flatMap((key) => scales[key])
      );

      setChartData(chart);
      setAverageData(average);
      setMaxValue(Math.max(10, Math.ceil(maxVal / 10) * 10)); // rounded to nearest 10
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
        <Flex {...legendContainerStyle} mb={5}>
          {colorPalette.map((color, i) => (
            <Flex key={i} {...legendItemStyle}>
              <Box {...legendDotStyle} bg={color} />
              <Text>{i + 1}</Text>
            </Flex>
          ))}
          <Flex {...legendItemStyle}>
            <Box {...legendDotStyle} bg="#ECC600" />
            <Text>Rata-rata</Text>
          </Flex>
        </Flex>

        <Box {...chartWrapperStyle}>
            <Flex {...yAxisWrapperStyle}>
            {getYAxisLabels(maxValue, 10).map((label) => (
                <Text key={label} {...yAxisLabelStyle}>
                {label === 0 ? "" : label}
                </Text>
            ))}
            </Flex>

          <Flex {...chartBarContainerStyle}>
            <Box {...yAxisStyle} />
            <Flex {...barAndLineWrapperStyle}>
              {chartData.map((group, groupIndex) => (
                <Box key={groupIndex} {...barGroupStyle}>
                    {group.values.map((item) => (
                    <Tooltip
                        key={item.id}
                        label={`Nilai ${item.id}: ${item.value} desa`}
                        hasArrow
                        placement="top"
                        bg="gray.700"
                        color="white"
                        fontSize="sm"
                    >
                        <Box
                        {...barStyle}
                        height={`${(item.value / maxValue) * 100}%`}
                        bg={item.color}
                        cursor="pointer"
                        />
                    </Tooltip>
                    ))}
                  <Text {...labelStyle}>{group.category}</Text>
                </Box>
              ))}

              <Box position="absolute" width="100%" height="100%" top={0} pointerEvents="none">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path
                        d={`M 16.66,${100 - (averageData[0]?.value / 4) * 100}
                            C 30,${100 - (averageData[0]?.value / 4) * 100},
                            36,${100 - (averageData[1]?.value / 4) * 100},
                            50,${100 - (averageData[1]?.value / 4) * 100}
                            S 70,${100 - (averageData[2]?.value / 4) * 100},
                            83.33,${100 - (averageData[2]?.value / 4) * 100}`}
                        {...lineStyle}
                    />

                    {averageData.map((point, idx) => {
                        const x = [16.66, 50, 83.33][idx];
                        const y = 100 - (point.value / 4) * 100;
                        return (
                        <Tooltip
                            key={idx}
                            label={`${point.category}: ${point.value.toFixed(2)}`}
                            hasArrow
                            placement="top"
                            bg="gray.700"
                            color="white"
                            fontSize="sm"
                        >
                            <circle
                            cx={`${x}%`}
                            cy={`${y}%`}
                            r="2"
                            fill="#ECC600"
                            stroke="#333"
                            strokeWidth="0"
                            cursor="pointer"
                            />
                        </Tooltip>
                        );
                    })}
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

export default ChartInnovation1;