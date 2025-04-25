import { SearchIcon } from "@chakra-ui/icons";
import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement
} from "@chakra-ui/react";
import React, { useState } from "react";

type SearchBarProps = {
  placeholder?: string;
  onChange?: (keyword: string) => void;
};

const SearchBarVil: React.FC<SearchBarProps> = ({ placeholder, onChange }) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <Flex justify="center" maxW="474px" width="100%">
      <InputGroup>
        <InputLeftElement
          pointerEvents="none"
          children={<SearchIcon color="gray.300" />}
        />
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
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
          width="100%"
        />
      </InputGroup>
    </Flex>
  );
};

export default SearchBarVil;