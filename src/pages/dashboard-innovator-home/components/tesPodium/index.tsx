import React from "react";
import { podiumStyles } from "./_tesPodiumStyle";

const PodiumChart = () => {
  const data = [
    { name: "Alice", value: 90 },   // 1st
    { name: "Bob", value: 75 },     // 2nd
    { name: "Charlie", value: 60 }, // 3rd
  ];

  // Sort and extract top 3
  const sorted = [...data].sort((a, b) => b.value - a.value).slice(0, 3);

  // Rearrange to 2nd, 1st, 3rd for podium layout
  const podiumOrder = [sorted[1], sorted[0], sorted[2]];

  const getBarColor = (index: number) => {
    switch (index) {
      case 1:
        return podiumStyles.colors.gold;
      case 0:
        return podiumStyles.colors.silver;
      case 2:
        return podiumStyles.colors.bronze;
      default:
        return "#ccc";
    }
  };

  return (
    <div style={podiumStyles.container}>
      {podiumOrder.map((item, index) => (
        <div key={item.name} style={podiumStyles.item}>
          <div
            style={{
              ...podiumStyles.barBase,
              backgroundColor: getBarColor(index),
              height: `${100 - (index === 1 ? 0 : 20)}px`, // 1st = tallest
            }}
          >
            <span>{sorted.indexOf(item) + 1}</span>
          </div>
          <div style={podiumStyles.name}>{item.name}</div>
        </div>
      ))}
    </div>
  );
};

export default PodiumChart;
