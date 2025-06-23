declare module "jspdf-autotable" {
  import jsPDF from "jspdf";
  
  export default function autoTable(
    doc: jsPDF,
    options: {
      head: (string | number | null)[][]; // Lebih spesifik daripada any[]
      body: (string | number | null)[][]; // Lebih spesifik daripada any[]
      startY?: number;
      theme?: string;
      styles?: object;
      headStyles?: object;
      bodyStyles?: object;
      footStyles?: object;
      alternateRowStyles?: object;
      tableLineColor?: [number, number, number] | string;
      tableLineWidth?: number;
    }
  ): jsPDF;
}
