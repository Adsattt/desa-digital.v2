import { SearchIcon } from "@chakra-ui/icons";
import { Flex, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import React from "react";

interface SearchBarLinkProps {
  placeholderText: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  width?: string | number;
  maxW?: string | number;
}

const SearchBarLink: React.FC<SearchBarLinkProps> = ({
  placeholderText,
  value,
  onChange,
  onKeyDown,
  width = "100%",
  maxW = "100%",
}) => {
  return (
    <Flex justify="center" width={width} maxW={maxW}>
      <InputGroup width="90%" mt={-3} mb={-3}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" />
        </InputLeftElement>
        <Input
          bg="white"
          type="text"
          placeholder={placeholderText}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          fontSize="10pt"
          _placeholder={{ color: "#9CA3AF" }}
          _hover={{
            bg: "white",
            border: "1px solid",
            borderColor: "brand.100",
          }}
          _focus={{
            bg: "white",
            border: "1px solid",
            borderColor: "#9CA3AF",
          }}
          borderRadius={100}
        />
      </InputGroup>
    </Flex>
  );
};

export default SearchBarLink;
