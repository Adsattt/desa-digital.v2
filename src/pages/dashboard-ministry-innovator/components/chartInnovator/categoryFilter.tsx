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
import { useState, useEffect } from "react";

interface CategoryFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (kategori: string) => void;
  kategoriList: string[];
  defaultKategori?: string;
}

const CategoryFilter = ({
  isOpen,
  onClose,
  onApply,
  kategoriList,
  defaultKategori = "Semua",
}: CategoryFilterProps) => {
  const [selectedKategori, setSelectedKategori] = useState(defaultKategori);

  useEffect(() => {
    setSelectedKategori(defaultKategori);
  }, [defaultKategori, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay />
      <ModalContent maxW="300px">
        <ModalHeader>Filter Kategori</ModalHeader>
        <ModalCloseButton mt={2} mr={2} />
        <ModalBody>
          <Text mb={2}>Pilih kategori:</Text>
          <Select value={selectedKategori} onChange={(e) => setSelectedKategori(e.target.value)}>
            {kategoriList.map((kategori) => (
              <option key={kategori} value={kategori}>
                {kategori}
              </option>
            ))}
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            width="100%"
            onClick={() => {
              onApply(selectedKategori);
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

export default CategoryFilter;