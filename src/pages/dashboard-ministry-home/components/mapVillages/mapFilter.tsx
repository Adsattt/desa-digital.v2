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
  Text
} from "@chakra-ui/react";
import { useState } from "react";

const ProvinceFilter = ({
  isOpen,
  onClose,
  onApply,
  provinces,
}: {
  isOpen: boolean;
  onClose: () => void;
  onApply: (province: string) => void;
  provinces: string[];
}) => {
  const [selectedProvince, setSelectedProvince] = useState("");

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay />
      <ModalContent maxW="300px">
        <ModalHeader>Filter</ModalHeader>
        <ModalCloseButton mt={2} mr={2} />
        <ModalBody>
          <Text mb={2}>Pilih provinsi:</Text>
          <Select
            placeholder="Semua Provinsi"
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
          >
            {provinces.map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            width="100%"
            onClick={() => {
              onApply(selectedProvince);
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

export default ProvinceFilter;