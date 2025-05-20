import { SearchIcon } from "@chakra-ui/icons";
import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement
} from "@chakra-ui/react";
import React from "react";

// type SearchBarLinkProps = {
//   placeholderText?: string;
//   value?: string;
//   onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
// };

interface SearchBarLinkProps {
    placeholderText: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const SearchBarLink: React.FC<SearchBarLinkProps> = ({ placeholderText, value, onChange }) => {
  return (
    <Flex justify="center" maxW="360px" width="100%">
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" />
        </InputLeftElement>
        <Input
          type="text"
          placeholder={placeholderText}
          value={value}
          onChange={onChange}
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
          maxW="329px"
          width="100%"
        />
      </InputGroup>
    </Flex>
  );
};

export default SearchBarLink;