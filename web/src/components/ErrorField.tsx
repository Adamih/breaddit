import React from "react";
import { useField } from "formik";
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
} from "@chakra-ui/core";

type ErrorFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  name: string;
};

export const ErrorField: React.FC<ErrorFieldProps> = (props) => {
  const [field, { error }] = useField(props);
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name} hidden={true}>
        ""
      </FormLabel>
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};
