export const containerStyle = {
    p: 4,
    width: "100%",
    maxWidth: "800px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
};

export const pieChartWrapperStyle = {
    width: "100%",
    maxWidth: "270px",
    height: "270px",
    position: "relative" as const,
    margin: "0 auto",
};

export const svgStyle = {
    width: "100%",
    height: "100%",
};

export const legendItemStyle = {
    display: "flex",
    alignItems: "center",
    mx: 2,
};

export const legendColorStyle = {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    mr: 1,
};

export const legendTextStyle = {
    fontSize: "sm",
    color: "gray.700",
};