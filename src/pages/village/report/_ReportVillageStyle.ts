import styled, { css } from "styled-components";

export const GridContainer = styled.div`
  width: 100%;
  padding: 20px;
  padding-top: 60px; /* Reduced from 80px to bring content closer to TopBar */
  display: flex;
  justify-content: center;
`;

export const Containers = styled.div`
  max-width: 600px; /* Constrain width to prevent overflow */
  width: 100%;
  margin: 0 auto;
  background-color: #fff; /* White background */
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

export const Text = styled.p`
  margin: 0;
  padding: 5px 0;
  font-size: 14px;
  font-weight: 400;
  color: #1f2937;
`;

export const Column1 = styled.div`
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const DateRangeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  flex-wrap: wrap; /* Prevent overflow on small screens */
`;

export const Select = styled.select`
  width: 100%;
  max-width: 300px;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 14px;
  background-color: #fff;
  transition: border-color 0.2s;

  &:hover {
    border-color: #888;
  }

  &:focus {
    outline: none;
    border-color: #2e5e4e;
  }
`;

export const DateInput = styled.input`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 14px;
  width: 100%;
  max-width: 120px; /* Smaller size to fit within container */
  transition: border-color 0.2s;

  &:hover {
    border-color: #888;
  }

  &:focus {
    outline: none;
    border-color: #2e5e4e;
  }
`;

export const CompactPreviewWrapper = styled.div`
  margin-top: 20px;
  padding: 5px; /* Reduced padding for compact view */
  max-height: 150px; /* Smaller height */
  overflow-y: auto;
  border: 1px solid #e5e7eb; /* Added border to give a boxed appearance */
  border-radius: 4px;
`;

export const PreviewWrapper = styled.div`
  padding: 20px;
  background: white;
  border-radius: 8px;
`;

export const ReportHeader = styled.div`
  margin-bottom: 10px;
`;

interface CompactProps {
  isCompact?: boolean;
}

export const ReportTitle = styled.h2<CompactProps>`
  font-size: ${({ isCompact }) => (isCompact ? "1em" : "1.5em")};
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

export const ReportPeriode = styled.p<CompactProps>`
  font-size: ${({ isCompact }) => (isCompact ? "10px" : "14px")};
  font-weight: 400;
  color: #1f2937;
  margin: 3px 0;
`;

export const ReportFilter = styled.p<CompactProps>`
  font-size: ${({ isCompact }) => (isCompact ? "10px" : "14px")};
  font-weight: 400;
  color: #1f2937;
  margin: 3px 0;
`;

export const ReportTimestamp = styled.p<CompactProps>`
  font-size: ${({ isCompact }) => (isCompact ? "9px" : "12px")};
  font-weight: 400;
  color: #6b7280; /* Gray color for timestamp */
  margin: 3px 0;
`;

export const Table = styled.table<CompactProps>`
  width: 100%;
  border-collapse: collapse;

  @media (max-width: 600px) {
    display: block;
    overflow-x: auto;
  }
`;

export const TableHeader = styled.th<CompactProps>`
  padding: ${({ isCompact }) => (isCompact ? "5px" : "10px")};
  background-color: #f1f5f9;
  border: 1px solid #e5e7eb;
  font-weight: 600;
  text-align: left;
  font-size: ${({ isCompact }) => (isCompact ? "10px" : "14px")};
  color: #1f2937;
`;

export const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9fafb;
  }
`;

export const TableCell = styled.td<CompactProps>`
  padding: ${({ isCompact }) => (isCompact ? "5px" : "10px")};
  border: 1px solid #e5e7eb;
  font-size: ${({ isCompact }) => (isCompact ? "10px" : "14px")};
  color: #1f2937;
`;

export const DownloadWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

export const PreviewButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  background-color: #4a5568; /* Gray for preview button */
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2d3748;
  }

  &:active {
    background-color: #1a202c;
  }

  &:disabled {
    background-color: #d1d5db;
    cursor: not-allowed;
  }
`;

export const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  background-color: #2e5e4e; /* Dark green to match theme */
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #24503f;
  }

  &:active {
    background-color: #1b4032;
  }

  &:disabled {
    background-color: #d1d5db;
    cursor: not-allowed;
  }
`;