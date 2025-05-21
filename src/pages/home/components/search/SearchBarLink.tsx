import { SearchIcon } from "@chakra-ui/icons";
import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Select,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

interface SearchBarLinkProps {
  placeholderText?: string;
}

const SearchBarLink: React.FC<SearchBarLinkProps> = ({ placeholderText }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const navigate = useNavigate();

  const categories = [
    { value: "", label: "Semua Kategori" },
    { value: "Pertanian Cerdas", label: "Pertanian Cerdas" },
    { value: "Pemasaran Agri-Food dan E-Commerce", label: "Pemasaran Agri-Food dan E-Commerce" },
    { value: "E-Government", label: "E-Government" },
    { value: "Sistem Informasi", label: "Sistem Informasi" },
    { value: "Infrastruktur Lokal", label: "Infrastruktur Lokal" },
    { value: "Lintas Semua", label: "Lintas Semua" },
  ];

  const handleSearch = () => {
    if (searchQuery.trim() || category) {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.set("q", searchQuery);
      if (category) queryParams.set("category", category);
      console.log("Navigating to:", `/search?${queryParams.toString()}`); // Debug log
      navigate(`/search?${queryParams.toString()}`);
    } else {
      console.log("No search query or category provided");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Flex justify="center" maxW="360px" width="100%" direction="column" gap={2}>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" />
        </InputLeftElement>
        <Input
          type="text"
          placeholder={placeholderText}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
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
        <InputRightElement>
          <IconButton
            aria-label="Search"
            icon={<SearchIcon />}
            size="sm"
            onClick={handleSearch}
            variant="ghost"
          />
        </InputRightElement>
      </InputGroup>
      <Select
        placeholder="Kategori Inovasi"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        maxW="329px"
        width="100%"
        fontSize="10pt"
        borderRadius={100}
        color={category ? "black" : "#9CA3AF"}
      >
        {categories.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </Select>
    </Flex>
  );
};

export default SearchBarLink;