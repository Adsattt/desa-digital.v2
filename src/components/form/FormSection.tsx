import React from "react";
import { Box, Text, Input, Textarea } from "@chakra-ui/react";

interface FormSectionProps {
  title: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  disabled?: boolean;
  isTextArea?: boolean;
  wordCount?: number;
  maxWords?: number;
  type?: string;
  isRequired?: boolean; 
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  name,
  placeholder,
  value,
  onChange,
  isTextArea = false,
  wordCount,
  maxWords,
  disabled,
  type,
  isRequired = true,
}) => {
  return (
    <Box>
      <Text fontWeight="400" fontSize="14px" mb="4px">
        {title} {isRequired && <span style={{ color: "red" }}>*</span>}
      </Text>
      {isTextArea ? (
        <Textarea
          name={name}
          fontSize="10pt"
          placeholder={placeholder}
          _placeholder={{ color: "gray.500" }}
          _focus={{
            outline: "none",
            bg: "white",
            border: "1px solid",
            borderColor: "black",
          }}
          height="100px"
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      ) : (
        <Input
          name={name}
          fontSize="10pt"
          placeholder={placeholder}
          _placeholder={{ color: "gray.500" }}
          _focus={{
            outline: "none",
            bg: "white",
            border: "1px solid",
            borderColor: "black",
          }}
          value={value}
          onChange={onChange}
          type={type}
          disabled={disabled}
        />
      )}
      {wordCount !== undefined && maxWords !== undefined && (
        <Text fontWeight="400" fontSize="10px" mb="6px" color="#9CA3AF">
          {wordCount}/{maxWords} kata
        </Text>
      )}
    </Box>
  );
};

export default FormSection;
