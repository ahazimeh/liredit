import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { withUrqlClient } from "next-urql";
import { Layout } from "../components/Layout";
import NavBar from "../components/NavBar";
import { useDeletePostMutation, usePostsQuery } from "../generated/graphql";
import { createUrlqClient } from "../util/createUrqlClient";
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, DeleteIcon } from "@chakra-ui/icons";
import { UpdootSections } from "../components/UpdootSections";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });
  const [, deletePost] = useDeletePostMutation();
  if (!fetching && !data) {
    return <div>you got query failed for some reason</div>;
  }
  return (
    <Layout>
      {!data && fetching ? (
        <div>Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((p) =>
            !p ? null /** because we invalidated some posts 
            but I tried to remove this and didn't notice it as true*/ : (
              <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
                <UpdootSections post={p} />
                <Box flex={1}>
                  <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                    <Link>
                      <Heading fontSize="xl">{p.title}</Heading>
                    </Link>
                  </NextLink>
                  <Text>posted by {p.creator.username}</Text>
                  <Flex align="center">
                    <Text flex={1} mt={4}>
                      {p.textSnippet}
                    </Text>
                    <IconButton
                      ml="auto"
                      colorScheme="red"
                      icon={<DeleteIcon />}
                      aria-label="Delete Post"
                      onClick={() => {
                        deletePost({ id: p.id });
                      }}
                    />
                  </Flex>
                </Box>
              </Flex>
            )
          )}
        </Stack>
      )}
      {data?.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
            isLoading={fetching}
            m="auto"
            my={8}
          >
            load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrlqClient, { ssr: true })(Index);
