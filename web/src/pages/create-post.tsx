import React, { useEffect } from "react";
import { Formik, Form } from "formik";
import { InputField } from "../components/InputField";
import { Box, Button } from "@chakra-ui/core";
import { ErrorField } from "../components/ErrorField";
import { useRouter } from "next/router";
import { useCreatePostMutation, useMeQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useIsAuth } from "../utils/useIsAuth";

const CreatePost: React.FC<{}> = ({}) => {
  const [, createPost] = useCreatePostMutation();
  const router = useRouter();
  useIsAuth();

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "", error: "" }}
        onSubmit={async ({ error, ...values }, { setErrors }) => {
          const response = await createPost({ options: values });
          if (response.error) {
            const [err] = response.error.graphQLErrors;
            // Display a general error message.
            setErrors({ error: err.message });
          } else if (response.data?.createPost) {
            // Post created
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="title"
              label="Title"
              placeholder="What subject do you want to talk about?"
            />
            <InputField
              name="text"
              label="Body"
              type="textarea"
              placeholder="..."
            />
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

export default withUrqlClient(createUrqlClient)(CreatePost);
