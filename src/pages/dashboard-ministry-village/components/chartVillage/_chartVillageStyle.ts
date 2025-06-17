export const chartContainerStyle = {
  bg: "#D1EDE1",
  p: 4,
  width: "100%",
  maxWidth: "334px",
  margin: "0 auto",
  borderRadius: "lg",
  boxShadow: "lg",
  // mt: 2,
};

export const chartWrapperStyle = {
  display: "flex",
  height: "175px",
  width: "100%",
  position: "relative" as const,
  mb: 4,
  mt: 4,
  paddingBottom: "30px",
};

export const barGroupStyle = {
  display: "flex",
  flexDirection: "row" as const,
  width: `${100 / 6}%`,
  height: "100%",
  alignItems: "flex-end",
  justifyContent: "center",
  gap: "2px",
  position: "relative" as const,
};

export const barStyle = {
  width: "16px",
  minHeight: "1px",
  transition: "height 0.3s ease",
  marginRight: "2px",
};

export const labelStyle = {
  fontSize: 12,
  textAlign: "center" as const,
  position: "absolute" as const,
  bottom: "-40px",
  whiteSpace: "pre-line" as const,
  transform: "rotate(-45deg)",
};

export const legendContainerStyle = {
  fontSize: 13,
  justifyContent: "center",
  alignItems: "center",
  gap: 2,
  flexWrap: "wrap" as const,
  display: "flex",
};

export const legendItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: 2,
};

export const legendDotStyle = {
  width: "12px",
  height: "12px",
  borderRadius: "full",
};

export const titleStyle = {
  fontSize: 16,
  fontWeight: "bold",
  marginBottom: "10px",
};

export const lineStyle = {
  stroke: "#ECC600",
  strokeWidth: 1.5,
  fill: "none",
};

export const xAxisStyle = {
  position: "absolute" as const,
  bottom: 0,
  left: 0,
  right: 0,
  height: "1px",
  backgroundColor: "black",
  zIndex: 0,
};

export const yAxisStyle = {
  position: "absolute" as const,
  top: 0,
  bottom: 0,
  left: 0,
  width: "1px",
  backgroundColor: "black",
  zIndex: 0,
  transform: "scaleX(1)",
  transformOrigin: "left",
};

export const yAxisLabelStyle = {
  fontSize: 12,
  color: "black",
  textAlign: "right" as const,
  mr: 2,
};

export const yAxisWrapperStyle = {
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "space-between",
  height: "100%",
};

export const chartBarContainerStyle = {
  flex: 1,
  height: "100%",
  position: "relative" as const,
};

export const barAndLineWrapperStyle = {
  justifyContent: "space-around",
  width: "100%",
  alignItems: "flex-end",
  zIndex: 1,
  position: "relative" as const,
};