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
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  useEffect(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);

    setFromDate(startOfYear);
    setToDate(endOfYear);
  }, [isOpen]); // reset dates when modal opens

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
            <Flex gap={4}>
                <Box flex="1">
                <Text fontSize="sm" mb={1}>
                    Dari tanggal
                </Text>
                <DatePicker
                    selected={fromDate}
                    onChange={(date) => setFromDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Pilih tanggal"
                    customInput={<CustomInput />}
                />
                </Box>

                <Box flex="1">
                <Text fontSize="sm" mb={1}>
                    Hingga tanggal
                </Text>
                <DatePicker
                    selected={toDate}
                    onChange={(date) => setToDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Pilih tanggal"
                    customInput={<CustomInput />}
                />
                </Box>
            </Flex>
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