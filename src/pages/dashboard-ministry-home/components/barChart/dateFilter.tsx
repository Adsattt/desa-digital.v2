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
import { useState, useEffect } from "react";

const YearRangeFilter = ({
  isOpen,
  onClose,
  onApply,
  initialFrom,
  initialTo
}: {
  isOpen: boolean;
  onClose: () => void;
  onApply: (from: number, to: number) => void;
  initialFrom: number;
  initialTo: number;
}) => {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);

  useEffect(() => {
    if (isOpen) {
      setFrom(initialFrom);
      setTo(initialTo);
    }
  }, [isOpen, initialFrom, initialTo]);
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - 49 + i);

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
              {years
                .filter((year) => year <= to) // hanya tampilkan tahun <= to
                .map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
            </Select>

            <Select value={to} onChange={(e) => setTo(+e.target.value)}>
              {years
                .filter((year) => year >= from) // hanya tampilkan tahun >= from
                .map((year) => (
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