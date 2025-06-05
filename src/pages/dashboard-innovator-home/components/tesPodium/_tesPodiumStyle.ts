export const podiumStyles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-end",
      gap: "20px",
      height: "200px",
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
      borderRadius: "6px 6px 0 0",
    } as React.CSSProperties,
  
    name: {
      marginTop: "8px",
      fontWeight: 500,
      textAlign: "center" as const,
    } as React.CSSProperties,
  
    colors: {
      gold: "gold",
      silver: "silver",
      bronze: "#cd7f32",
    },
  };
  