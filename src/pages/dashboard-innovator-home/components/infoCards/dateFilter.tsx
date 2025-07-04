import React, { useEffect, useState } from "react";
import { Box, Button, Flex, IconButton, Text } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DateRangeFilterProps {
  onClose: () => void;
  onApply: (from: Date, to: Date) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ onClose, onApply }) => {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  useEffect(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);

    setFromDate(startOfYear);
    setToDate(endOfYear);
  }, []);

  const handleApply = () => {
    if (fromDate && toDate) {
      onApply(fromDate, toDate);
    }
  };

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      w="100vw"
      h="100vh"
      bg="blackAlpha.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="9999"
    >
      <Box
        bg="white"
        p={6}
        borderRadius="md"
        w="90%"
        maxW="300px"
        position="relative"
      >
        <IconButton
          icon={<CloseIcon />}
          size="sm"
          position="absolute"
          top="20px"
          right="20px"
          onClick={onClose}
          aria-label="Close filter"
        />

        <Text fontWeight="bold" mb={4}>Filter</Text>

        <Box flex="1" mb={4}>
          <Text fontSize="sm" mb={2}>Dari tanggal</Text>
          <DatePicker
            selected={fromDate}
            onChange={(date) => setFromDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Pilih tanggal"
            className="chakra-input css-1c6b688"
          />
        </Box>

        <Box flex="1" mb={4}>
          <Text fontSize="sm" mb={2}>Hingga tanggal</Text>
          <DatePicker
            selected={toDate}
            onChange={(date) => setToDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Pilih tanggal"
            className="chakra-input"
          />
        </Box>

        <Button colorScheme="blue" width="100%" onClick={handleApply} mt={2}>
          Terapkan Filter
        </Button>
      </Box>
    </Box>
  );
};

export default DateRangeFilter;