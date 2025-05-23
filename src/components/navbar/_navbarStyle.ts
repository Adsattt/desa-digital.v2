import styled from "styled-components";

export const OuterContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const Container = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: 360px;
  padding: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background-color: white;
  left: 50%;
  transform: translateX(-50%);
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
`;

export const GridItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
`;
export const Text = styled.p`
  font-size: 10px;
  color: #000000;
  text-align: center;
  margin-top: 4px;
`;