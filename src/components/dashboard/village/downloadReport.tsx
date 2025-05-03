// src/components/DownloadReport.tsx
import React from "react";
import { IconButton } from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import * as XLSX from "xlsx";

export type InovatorReportData = {
  no: number;
  namaInovator: string;
  jumlahInovasi: number;
  jumlahDesaDampingan: number;
};

type DownloadReportProps = {
  data: InovatorReportData[];
  fileName?: string;
};

const DownloadReport: React.FC<DownloadReportProps> = ({
  data,
  fileName = "Semua_Inovator.xlsx",
}) => {
  const handleDownload = () => {
    const excelData = data.map((item) => ({
      No: item.no,
      "Nama Inovator": item.namaInovator,
      "Jumlah Inovasi": item.jumlahInovasi,
      "Jumlah Desa Dampingan": item.jumlahDesaDampingan,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SemuaInovator");

    XLSX.writeFile(workbook, fileName);
  };

  return (
    <IconButton
      aria-label="Download Report"
      icon={<DownloadIcon boxSize={5} color="white" />}
      variant="ghost"
      height="40px"
      padding={1}
      onClick={handleDownload}
      _hover={{ bg: "whiteAlpha.300" }}
      _active={{ bg: "whiteAlpha.400" }}
    />
  );
};

export default DownloadReport;
