import styled from 'styled-components'

export const podiumContainerStyle = {
  bg: "#D1EDE1",
  w: "100%",
  maxW: "800px",
  mx: "auto",
  borderRadius: "lg",
  boxShadow: "lg",
  height: "180px",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
};

export const podiumWrapperStyle = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  gap: "20px",
};

export const cardStyle = (rank: number) => ({
  background: "white",
  boxShadow: "md",
  borderTopLeftRadius: "20px",
  borderTopRightRadius: "20px",
  borderBottomRadius: "0px",
  width: "70px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  // position: "relative",
  pt: "12px",
  textAlign: "center" as const,
});

export const rankText = {
  fontWeight: "bold",
  fontSize: "12",
  color: "white",
};

export const RankLabel = styled.div`
  position: absolute;
  top: 2px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14pt;
  font-weight: bold;
  color: white;
  pointer-events: none;
  z-index: 1;
`;

export const titleText = {
  fontSize: "m",
  fontWeight: "bold",
};

export const linkText = {
  fontSize: "sm",
  color: "gray.500",
  textDecoration: "underline",
};