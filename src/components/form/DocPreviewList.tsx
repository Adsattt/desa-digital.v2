import React from "react";
import { VStack, Box, HStack, Text, IconButton } from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";

interface DocPreviewListProps {
  docs: string[];
}

const getFileName = (url: string) => {
  const parts = url.split("/");
  return decodeURIComponent(parts[parts.length - 1] || "Dokumen");
};

const DocPreviewList: React.FC<DocPreviewListProps> = ({ docs }) => {
  return (
    <VStack align="start" spacing={3}>
      {docs.map((docUrl, index) => (
        <HStack
            key={index}
            justify="space-between"
            width="100%"
            border="1px solid #347357"
            borderRadius="md"
            p={3}
            bg="#FFF"
            mt={1}
            >
            <Box maxW="70%" overflow="hidden">
                <Text fontWeight="bold" color="#347357" isTruncated>
                {getFileName(docUrl)}
                </Text>
                <Text color="#347357">Dokumen {index + 1}</Text>
            </Box>
            <a href={docUrl} target="_blank" rel="noopener noreferrer">
                <IconButton
                    icon={<DownloadIcon />}
                    color="#347357"
                    aria-label="Download document"
                    variant="ghost"
                />
            </a>
        </HStack>
      ))}
    </VStack>
  );
};

export default DocPreviewList;
