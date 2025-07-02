import { Box, Flex } from '@chakra-ui/react';
import styled from '@emotion/styled';

export const ChartContainer = styled(Box)`
  width: 100%;
  max-width: 100%;
  margin: auto;
  padding: 2px;
  margin-bottom: 10px;
  background-color: #D1EDE1;
  border-radius: 15px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
`;

export const ChartWrapper = styled(Flex)`
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 1rem;
  gap: 2rem;
`;

export const PieContainer = styled(Box)`
  min-width: 160px;
  width: 50%;
  height: 150px;
`;

export const LegendContainer = styled(Box)`
  width: 50%;
  font-size: 12px;
  overflow: hidden;
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