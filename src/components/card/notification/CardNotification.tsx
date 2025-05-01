import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Flex,
  Text,
  Box,
} from "@chakra-ui/react";
import React, { useState } from "react";

type CardNotificationProps = {
  title: string;
  status: string;
  date: string;
  description: string;
  onClick?: () => void;
};

const CardNotification: React.FC<CardNotificationProps> = ({
  title,
  description,
  status,
  date,
  onClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getShortDescription = (text: string, wordLimit: number) => {
    const words = text.split(" ");
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  // Menangani klik pada tombol "Lihat Semua" / "Sembunyikan"
  const handleToggleDescription = (e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah event bubbling ke parent (card)
    setIsExpanded(!isExpanded);
  };

  const statusColors = {
    Terverifikasi: {
      bg: "#DCFCE7",
      color: "#16A34A",
      border: "#16A34A",
    },
    Ditolak: {
      bg: "#FEE2E2",
      color: "#DC2626",
      border: "#DC2626",
    },
    default: {
      bg: "#FFFAE6",
      color: "#CA8A04",
      border: "#CA8A04",
    },
  };

  const statusStyle =
    status === "Terverifikasi"
      ? statusColors.Terverifikasi
      : status === "Ditolak"
      ? statusColors.Ditolak
      : statusColors.default;

  return (
    <Card
      borderRadius="8px"
      border="1px solid"
      borderColor="gray.300"
      boxShadow="0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.10);"
      cursor="pointer"
      onClick={onClick}
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
      }}
      role="button"
      aria-label={`Detail ${title}`}
      size="sm"
    >
      <CardHeader paddingY="8px" paddingX="12px">
        <Flex justifyContent="space-between" alignItems="center">
          <Text
            fontSize="14px"
            fontWeight="700"
            lineHeight="140%"
            maxWidth="210px"
          >
            {title}
          </Text>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="79px"
            height="18px"
            borderRadius="12px"
            border="0.5px solid"
            borderColor={statusStyle.border}
            background={statusStyle.bg}
            fontSize="10px"
            fontWeight="400"
            color={statusStyle.color}
          >
            {status}
          </Box>
        </Flex>
      </CardHeader>

      <CardBody paddingY="6px" paddingX="12px">
        <Box>
          <Text
            fontSize="12px"
            fontWeight="400"
            color="gray.500"
            lineHeight="140%"
          >
            {isExpanded ? description : getShortDescription(description, 14)}
          </Text>
          {description.split(" ").length > 14 && (
            <Button
              variant="link"
              color="brand.100"
              fontWeight="400"
              fontSize="12px"
              alignSelf="flex-start"
              height="auto"
              minWidth="auto"
              padding="2px 0"
              marginTop="2px"
              onClick={handleToggleDescription}
              _hover={{ textDecoration: "underline" }}
            >
              {isExpanded ? "Sembunyikan" : "Lihat Semua"}
            </Button>
          )}
        </Box>
      </CardBody>

      <CardFooter paddingY="6px" paddingX="12px">
        <Text fontSize="10px" fontWeight="400" color="gray.400">
          {date}
        </Text>
      </CardFooter>
    </Card>
  );
};

export default CardNotification;
