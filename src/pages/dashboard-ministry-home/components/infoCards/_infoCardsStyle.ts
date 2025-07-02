import styled from 'styled-components'

export const cardStyle = {
    bg: "#D1EDE1",
    p: 4,
    boxShadow: "md",
    borderRadius: "lg",
    // borderLeft: "6px solid",
    // borderColor: "#2C7A7B",
  };

  export const Horizontal = styled.div`
    display: flex;
    gap: 16px;
  `
  
  export const titleText = {
    fontSize: "m",
    fontWeight: "bold",
  };

  export const descriptionText = {
    fontSize: 12,
    fontStyle: "italic",
  };

  export const numberTextStyle = {
    fontSize: 30,
    fontWeight: "bold",
    color: "green.800"
  };
  
  export const labelTextStyle = {
    fontSize: 15,
    fontWeight: "bold",
    color: "green.800"
  };
  
  export const trendTextStyle = {
    fontSize: 8,
    color: "red.500",
  };
  
  export const datePickerBoxStyle = {
  border: "1px solid #CBD5E0",
  borderRadius: "6px",
  padding: "8px",
  width: "100%",
  };