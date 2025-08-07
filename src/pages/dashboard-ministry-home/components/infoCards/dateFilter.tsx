import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DateRangeFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (from: Date, to: Date) => void;
  initialFromDate: Date | null;
  initialToDate: Date | null;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  isOpen,
  onClose,
  onApply,
  initialFromDate,
  initialToDate,
}) => {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFromDate(initialFromDate);
      setToDate(initialToDate);
    }
  }, [isOpen, initialFromDate, initialToDate]);

  const handleApply = () => {
    if (fromDate && toDate) {
      onApply(fromDate, toDate);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent maxW="300px">
        <ModalHeader>Filter</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box flex="1" mb={4}>
            <Text fontSize="sm" mb={2}>
                Dari tanggal
            </Text>
              <DatePicker
                selected={fromDate}
                onChange={(date) => {
                  setFromDate(date);
                  if (toDate && date && toDate < date) {
                    setToDate(date); // Reset toDate kalau sebelum fromDate
                  }
                }}
                dateFormat="dd/MM/yyyy"
                placeholderText="Pilih tanggal"
                className="chakra-input css-1c6b688"
                maxDate={toDate ?? undefined}
              />
          </Box>

          <Box flex="1">
            <Text fontSize="sm" mb={2}>
                Hingga tanggal
            </Text>
              <DatePicker
                selected={toDate}
                onChange={(date) => setToDate(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Pilih tanggal"
                className="chakra-input"
                minDate={fromDate ?? undefined}
              />
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" width="100%" onClick={handleApply}>
            Terapkan Filter
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Custom input for DatePicker using Chakra Input styling
import { forwardRef, Input } from "@chakra-ui/react";

const CustomInput = forwardRef(({ value, onClick }: any, ref: any) => (
  <Input
    ref={ref}
    value={value}
    onClick={onClick}
    readOnly
    cursor="pointer"
    bg="white"
  />
));

export default DateRangeFilter;