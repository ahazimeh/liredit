import { Box, Heading } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { EditDeletePostButtons } from "../../components/EditDeletePostButtons";
import { Layout } from "../../components/Layout";
import { usePostQuery } from "../../generated/graphql";
import { createUrlqClient } from "../../util/createUrqlClient";
import { useGetPostFromUrl } from "../../util/useGetPostFromUrl";

const Post = ({}) => {
  const { data, loading, error } = useGetPostFromUrl();
  if (loading) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  }
  if (error) return error.message;

  if (!data?.post)
    return (
      <Layout>
        <Box>could not find post</Box>
      </Layout>
    );

  return (
    <Layout>
      <Heading mb={4}>{data.post.title}</Heading>
      <Box mb={4}>{data.post.text}</Box>
      <EditDeletePostButtons
        id={data.post.id}
        creatorId={data.post.creator.id}
      />
    </Layout>
  );
};
export default Post;
