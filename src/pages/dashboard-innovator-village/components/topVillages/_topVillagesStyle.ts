export const podiumStyles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: "3px",
    height: "150px",
    marginTop: "0px",
  } as React.CSSProperties,

  item: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
  } as React.CSSProperties,

  barBase: {
    width: "60px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    color: "white",
    fontWeight: "bold",
    borderRadius: "15px 15px 0 0",
  } as React.CSSProperties,

  name: {
    marginTop: "8px",
    marginBottom: "10px",
    fontSize: "m",
    fontWeight: "bold",
    // color: "#244E3B",
    textAlign: "center" as const,
  } as React.CSSProperties,

  colors: {
    first: "#244E3B",
    second: "#347357",
    third: "#568A73",
  },

  rankLabel: {
      position: "absolute",
      top: "5px",
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: "15pt",
      fontWeight: "bold",
      color: "white",
      pointerEvents: "none",
      zIndex: 1,
  } as React.CSSProperties,

  title: {
    fontSize: "15pt",
    fontWeight: "bold",
    color: "#244E3B",
    textAlign: "center" as const,
    marginBottom: "10px",
    marginTop: "30px",
  } as React.CSSProperties,
};