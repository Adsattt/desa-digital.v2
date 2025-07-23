import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Select,
  Flex,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";

interface YearFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (year: number) => void;
}

const YearFilter = ({ isOpen, onClose, onApply }: YearFilterProps) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 200 }, (_, i) => currentYear - 100 + i);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay />
      <ModalContent maxW="300px">
        <ModalHeader>Filter Tahun</ModalHeader>
        <ModalCloseButton mt={2} mr={2} />
        <ModalBody>
          <Text mb={2}>Pilih tahun:</Text>
          <Select value={selectedYear} onChange={(e) => setSelectedYear(+e.target.value)}>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            width="100%"
            onClick={() => {
              onApply(selectedYear);
              onClose();
            }}
          >
            Terapkan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default YearFilter;