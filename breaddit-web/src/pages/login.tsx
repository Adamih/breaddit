import React from "react";
import { Formik, Form } from "formik";
import { Button, Box, Link, Flex } from "@chakra-ui/core";
import { InputField } from "../components/InputField";
import { useLoginMutation } from "../generated/graphql";
import { ErrorField } from "../components/ErrorField";
import { useRouter } from "next/router";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { Layout } from "../components/Layout";

interface loginProps {}

const Login: React.FC<loginProps> = ({}) => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  return (
    <Layout variant="small">
      <Formik
        initialValues={{ username: "", password: "", error: "" }}
        onSubmit={async ({ error, ...values }, { setErrors }) => {
          const response = await login({ options: values });
          if (response.error) {
            const [err] = response.error.graphQLErrors;
            // Display a general error message.
            setErrors({ error: err.message });
          } else if (response.data?.login.user) {
            // User logged in
            if (typeof router.query.next === "string") {
              router.push(router.query.next);
            } else {
              router.push("/");
            }
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              label="Username"
              placeholder="username"
            />
            <InputField
              name="password"
              label="Password"
              type="password"
              placeholder="password"
            />
            <Box>
              <NextLink href="/forgot-password">
                <Link>forgot password?</Link>
              </NextLink>
            </Box>
            <Box mt="4" mb="4">
              <ErrorField name="error" />
            </Box>

            <Button type="submit" isLoading={isSubmitting} variantColor="teal">
              log in
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
