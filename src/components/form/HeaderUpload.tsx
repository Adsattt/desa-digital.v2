import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { Button, Flex, Icon, Image, Text } from "@chakra-ui/react";
import React from "react";

type HeaderUploadProps = {
  selectedHeader: string;
  disabled?: boolean;
  setSelectedHeader: (value: string) => void;
  selectFileRef: React.RefObject<HTMLInputElement>;
  onSelectHeader: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const HeaderUpload: React.FC<HeaderUploadProps> = ({
  selectedHeader,
  setSelectedHeader,
  selectFileRef,
  onSelectHeader,
  disabled,
}) => {
  return (
    <Flex direction="column" width="100%" wrap="wrap">
      {selectedHeader ? (
        <>
          <Flex
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            height="100%"
            width="100%"
            
          >
            <Image
              src={selectedHeader}
              width='360px'
              height="100px"
              maxWidth="272px"
              maxHeight="86px"
              borderRadius="8px"
              objectFit="cover"

            />
            <Button
              bg="red.500"
              _hover={{ bg: "red.600" }}
              width="32px"
              height="32px"
              variant="solid"
              size="md"
              disabled={disabled}
              onClick={() => setSelectedHeader("")}
            >
              <DeleteIcon />
            </Button>
          </Flex>
        </>
      ) : (
        <Flex
          justify="center"
          align="center"
          padding="12px 8px"
          border="1px dashed "
          direction="column"
          cursor="pointer"
          borderRadius="8px"
          width="128px"
          height="128px"
          borderColor="gray.500"
          onClick={() => selectFileRef.current?.click()}

        >
          <Icon as={AddIcon} color="gray.300" fontSize="16px" />
          <Text fontSize="10pt" color="gray.500" mt={2}>
            Tambahkan foto
          </Text>
          <input
            id="file-upload"
            type="file"
            hidden
            accept="image/png,image/jpeg,image/jpg"
            ref={selectFileRef}
            onChange={onSelectHeader}

          />
        </Flex>
      )}
    </Flex>
  );
};
export default HeaderUpload;
