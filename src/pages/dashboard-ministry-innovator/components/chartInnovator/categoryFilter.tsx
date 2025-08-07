import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Checkbox,
  CheckboxGroup,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

interface CategoryFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (kategori: string[]) => void;
  kategoriList: string[];
  defaultKategori?: string[];
}

const CategoryFilter = ({
  isOpen,
  onClose,
  onApply,
  kategoriList,
  defaultKategori = [],
}: CategoryFilterProps) => {
  const [selectedKategori, setSelectedKategori] = useState<string[]>(defaultKategori);

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
          <CheckboxGroup value={selectedKategori} onChange={(val) => setSelectedKategori(val as string[])}>
            <Stack spacing={2}>
              {kategoriList.map((kategori) => (
                <Checkbox key={kategori} value={kategori}>
                  {kategori}
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
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