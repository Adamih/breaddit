import React, { useState } from "react";
import { useRouter } from "next/router";
import { Wrapper } from "../components/Wrapper";
import { Formik, Form } from "formik";
import { InputField } from "../components/InputField";
import { Box, Button } from "@chakra-ui/core";
import { ErrorField } from "../components/ErrorField";
import { useForgotPasswordMutation } from "../generated/graphql";
import { STATUS_CODES } from "../constants";

const ForgotPassword: React.FC<{}> = ({}) => {
  const [, forgotPassword] = useForgotPasswordMutation();
  const [messageSent, setMessageSent] = useState(false);

  return (
    <Wrapper variant="small">
      {messageSent ? (
        <Box>
          If an account with that mail address exist, a password recovery mail
          has been sent.
        </Box>
      ) : (
        <Formik
          initialValues={{ email: "", error: "" }}
          onSubmit={async ({ error, ...values }, { setErrors }) => {
            const response = await forgotPassword({ email: values.email });
            if (response.error) {
              const [err] = response.error.graphQLErrors;
              if (err.extensions.code === STATUS_CODES.BAD_USER_INPUT) {
                // Display the error message in the corresponding invalid input field.
                setErrors(err.extensions.exception.validationErrors);
              } else {
                // Display a general error message.
                setErrors({ error: err.message });
              }
            } else if (response.data.forgotPassword) {
              setMessageSent(true);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <InputField
                name="email"
                label="Email"
                placeholder="example@domain.com"
              />
              <Box mt="4" mb="4">
                <ErrorField name="error" />
              </Box>
              {messageSent && (
                <Box>
                  If an account with that mail address exist, a password
                  recovery mail has been sent.
                </Box>
              )}

              <Button
                type="submit"
                isLoading={isSubmitting}
                variantColor="teal"
              >
                recover password
              </Button>
            </Form>
          )}
        </Formik>
      )}
    </Wrapper>
  );
};

export default ForgotPassword;
