import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Text,
  FormErrorMessage,
} from "@chakra-ui/react";
import React from "react";
import { Controller } from "react-hook-form";

type InputFieldProps = {
  title: string;
  name: string;
  placeholder: string;
  control: any;
  // onChangeOvr?: (
  //   event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  // ) => void;
  disabled?: boolean;
  isTextArea?: boolean;
  wordCount?: number;
  maxWords?: number;
  type?: string;
  isRequired?: boolean;
  rules?: any;
  defaultValue?: string;
  needLabel?: boolean;
  helperText?: string;
};

const InputField: React.FC<InputFieldProps> = ({
  title,
  name,
  placeholder,
  // onChangeOvr,
  disabled = false,
  isTextArea = false,
  wordCount = 0,
  maxWords = 0,
  type = "text",
  isRequired = false,
  control,
  rules,
  defaultValue = "",
  needLabel = false,
  helperText = "",
}) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      defaultValue={defaultValue}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormControl isRequired={isRequired} isInvalid={!!error}>
          <FormLabel fontWeight="400" fontSize="14px" mb="4px">
            {title}
          </FormLabel>
          {needLabel && (
            <Text fontSize="10px" fontWeight="400" color="gray.500">
              {helperText}
            </Text>
          )}
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
              onChange={(e) => {
                onChange(e);
                // onChangeOvr(e);
              }}
              disabled={disabled}
            />
          ) : (
            <Input
              name={name}
              fontSize="10pt"
              placeholder={placeholder}
              type={type}
              _placeholder={{ color: "gray.500" }}
              _focus={{
                outline: "none",
                bg: "white",
                border: "1px solid",
                borderColor: "black",
              }}
              value={value}
              onChange={(e) => {
                onChange(e);
                // onChangeOvr(e);
              }}
              disabled={disabled}
            />
          )}

          {maxWords > 0 && (
            <Text fontSize="10pt" color="gray.500">
              {wordCount}/{maxWords} kata
            </Text>
          )}
          <FormErrorMessage>{error && error.message}</FormErrorMessage>
        </FormControl>
      )}
    />
  );
};

export default InputField;
