// import { Box, Text } from "@chakra-ui/react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import { chartContainerStyle, titleStyle } from "./_barchartInnovationStyle";

// const data = [
//   { month: "Jan", inovasi: 10, desaDigital: 8 },
//   { month: "Feb", inovasi: 20, desaDigital: 18 },
//   { month: "Mar", inovasi: 30, desaDigital: 25 },
//   { month: "Apr", inovasi: 45, desaDigital: 40 },
//   { month: "May", inovasi: 60, desaDigital: 52 },
//   { month: "Jun", inovasi: 75, desaDigital: 70 },
// ];

// const BarChartInnovator = () => {
//   return (
//     <Box>
//       <Text {...titleStyle}>Perkembangan Penerapan Inovasi</Text>
//       <Box {...chartContainerStyle}>
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="month" fontSize={12} />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             <Bar dataKey="inovasi" fill="#3B82F6" name="Penerapan Inovasi" radius={[4, 4, 0, 0]} />
//             <Bar dataKey="desaDigital" fill="#10B981" name="Desa Digital" radius={[4, 4, 0, 0]} />
//           </BarChart>
//         </ResponsiveContainer>
//       </Box>
//     </Box>
//   );
// };

// export default BarChartInnovator;