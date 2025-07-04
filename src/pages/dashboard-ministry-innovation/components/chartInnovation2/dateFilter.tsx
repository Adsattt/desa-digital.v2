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
  Text
} from "@chakra-ui/react";
import { useState } from "react";

const YearRangeFilter = ({
  isOpen,
  onClose,
  onApply
}: {
  isOpen: boolean;
  onClose: () => void;
  onApply: (from: number, to: number) => void;
}) => {
  const [from, setFrom] = useState(2020);
  const [to, setTo] = useState(2025);
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 200 }, (_, i) => currentYear - 100 + i); // 150 years back & forward

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">  
      <ModalOverlay />
      <ModalContent maxW="300px">
        <ModalHeader>Filter</ModalHeader>
        <ModalCloseButton mt={2} mr={2}/>
        <ModalBody>
          <Text mb={2}>Pilih rentang tahun:</Text>
          <Flex gap={2}>
            <Select value={from} onChange={(e) => setFrom(+e.target.value)}>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
            <Select value={to} onChange={(e) => setTo(+e.target.value)}>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
          </Flex>
        </ModalBody>
        <ModalFooter>
          {/* <Button variant="ghost" mr={3} onClick={onClose}>
            Batal
          </Button> */}
        <Button
        colorScheme="blue"
        width="100%"
        maxWidth="100%"
        mx="auto"
        onClick={() => {
            onApply(from, to);
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

export default YearRangeFilter;