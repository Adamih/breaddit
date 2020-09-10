import React from "react";
import { NextPage } from "next";
import { Wrapper } from "../../components/Wrapper";
import { Formik, Form } from "formik";
import { InputField } from "../../components/InputField";
import { Box, Button } from "@chakra-ui/core";
import { ErrorField } from "../../components/ErrorField";
import { useChangePasswordMutation } from "../../generated/graphql";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { STATUS_CODES } from "../../constants";

const ChangePassword: NextPage<{}> = ({}) => {
  const router = useRouter();
  const [, ChangePassword] = useChangePasswordMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ password: "", error: "" }}
        onSubmit={async ({ error, ...values }, { setErrors }) => {
          const response = await ChangePassword({
            token:
              typeof router.query.token === "string" ? router.query.token : "",
            password: values.password,
          });

          if (response.error) {
            const [err] = response.error.graphQLErrors;
            if (err.extensions.code === STATUS_CODES.BAD_USER_INPUT) {
              // Display the error message in the corresponding invalid input field.
              setErrors(err.extensions.exception.validationErrors);
            } else {
              // Display a general error message.
              setErrors({ error: err.message });
            }
          } else if (response.data?.changePassword.user) {
            // worked
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="password" label="New password" type="password" />
            <Box mt="4" mb="4">
              <ErrorField name="error" />
            </Box>

            <Button type="submit" isLoading={isSubmitting} variantColor="teal">
              Change password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
