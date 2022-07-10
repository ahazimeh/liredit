import { dedupExchange, fetchExchange, stringifyVariables } from "urql";
import { gql } from "@urql/core";
import {
  Cache,
  cacheExchange,
  Entity,
  Resolver,
} from "@urql/exchange-graphcache";
import {
  LogoutMutation,
  MeQuery,
  MeDocument,
  LoginMutation,
  RegisterMutation,
  VoteMutationVariables,
  DeletePostMutationVariables,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";

import { pipe, tap } from "wonka";
import { Exchange } from "urql";
import Router from "next/router";
import { isServer } from "./isServer";

const errorExchange: Exchange =
  ({ forward }) =>
  (ops$) => {
    return pipe(
      forward(ops$),
      tap(({ error }) => {
        // If the OperationResult has an error send a request to sentry
        if (error) {
          if (error?.message.includes("not authenticated")) {
            Router.replace("/login");
          }
          // the error is a CombinedError with networkError and graphqlErrors properties
          // sentryFireAndForgetHere() // Whatever error reporting you have
        }
      })
    );
  };

const cursorPagination = (cursorArgument = "cursor"): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    // console.log(entityKey, fieldName);
    const allFields = cache.inspectFields(entityKey);
    // console.log("allFields", allFields);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    // console.log("fieldArgs: ", fieldArgs);
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    // console.log("key we created: ", fieldKey);
    const isItInTheCache = cache.resolve(
      cache.resolve(fieldKey, entityKey) as Entity,
      "posts"
    );
    // console.log("isItInTheCache: ", isItInTheCache);
    info.partial = !isItInTheCache;
    let hasMore = true;
    const results: string[] = [];

    // fieldInfos.forEach((fi) => {
    //   const data = cache.resolve(entityKey, fi.fieldKey) as string[];
    //   console.log(data);
    //   results.push(...data);
    // });

    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key as Entity, "posts") as string[];
      const _hasMore = cache.resolve(key as Entity, "hasMore");
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      // console.log("data: ", hasMore, data);
      results.push(...data);
    });

    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: results,
    };

    // const visited = new Set();
    // let result: NullArray<string> = [];
    // let prevOffset: number | null = null;

    // for (let i = 0; i < size; i++) {
    //   const { fieldKey, arguments: args } = fieldInfos[i];
    //   if (args === null || !compareArgs(fieldArgs, args)) {
    //     continue;
    //   }

    //   const links = cache.resolve(entityKey, fieldKey) as string[];
    //   const currentOffset = args[cursorArgument];

    //   if (
    //     links === null ||
    //     links.length === 0 ||
    //     typeof currentOffset !== 'number'
    //   ) {
    //     continue;
    //   }

    //   const tempResult: NullArray<string> = [];

    //   for (let j = 0; j < links.length; j++) {
    //     const link = links[j];
    //     if (visited.has(link)) continue;
    //     tempResult.push(link);
    //     visited.add(link);
    //   }

    //   if (
    //     (!prevOffset || currentOffset > prevOffset) ===
    //     (mergeMode === 'after')
    //   ) {
    //     result = [...result, ...tempResult];
    //   } else {
    //     result = [...tempResult, ...result];
    //   }

    //   prevOffset = currentOffset;
    // }

    // const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
    // if (hasCurrentPage) {
    //   return result;
    // } else if (!(info as any).store.schema) {
    //   return undefined;
    // } else {
    //   info.partial = true;
    //   return result;
    // }
  };
};

function invalidAllPosts(cache: Cache) {
  const allFields = cache.inspectFields("Query");
  const fieldInfos = allFields.filter((info) => info.fieldName === "posts");
  fieldInfos.forEach((fi) => {
    cache.invalidate("Query", "posts", fi.arguments);
  });
}

export const createUrlqClient = (ssrExchange: any, ctx: any) => {
  let cookie = "";
  if (ctx && isServer()) cookie = ctx.req.headers.cookie;
  return {
    url: "http://localhost:4000/graphql",
    fetchOptions: {
      credentials: "include" as RequestCredentials | undefined,
      headers: cookie
        ? {
            cookie,
          }
        : undefined,
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination(),
          },
        },
        updates: {
          Mutation: {
            deletePost: (_result, args, cache, info) => {
              //invalidate by default make the post null
              //there is a way to get around that you can add a schema and tell urql about it
              //but for this just keep in mind that there will be some posts that will have null values
              //10:32:15
              //I personally didn't notice this as true so maybe urql changed something but I should test it later
              cache.invalidate({
                __typename: "Post",
                id: (args as DeletePostMutationVariables).id,
              });
            },
            vote: (_result, args, cache, info) => {
              console.log("z");
              const { postId, value } = args as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    id
                    points
                    voteStatus
                  }
                `,
                { id: postId }
              );
              // NOTE: ben had to add writeFragment for upvoting and downvoting cache to work
              if (data) {
                if (data.voteStatus === value) return;
                const newPoints =
                  data.points + (data.voteStatus ? 1 : 2) * value;
                console.log("data", data);
                cache.writeFragment(
                  gql`
                    fragment __ on Post {
                      points
                      voteStatus
                    }
                  `,
                  { id: postId, points: newPoints, voteStatus: value }
                );
              }
            },
            createPost: (_result, args, cache, info) => {
              // // console.log("start");
              // // console.log(cache.inspectFields("Query"));
              // cache.invalidate("Query", "posts", {
              //   limit: 10,
              // });
              // // console.log("end");
              // // console.log(cache.inspectFields("Query"));

              invalidAllPosts(cache);
            },
            logout: (_result, args, cache, info) => {
              // cache.invalidate();
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => ({ me: null })
              );
            },
            login: (_result: LoginMutation, args, cache, info) => {
              // cache.updateQuery({query: MeDocument}, (data: MeQuery) => {
              //   data.
              // })
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.login.errors) {
                    return query;
                  } else {
                    return {
                      me: result.login.user,
                    };
                  }
                }
              );
              invalidAllPosts(cache);
            },
            register: (_result: RegisterMutation, args, cache, info) => {
              // cache.updateQuery({query: MeDocument}, (data: MeQuery) => {
              //   data.
              // })
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query;
                  } else {
                    return {
                      me: result.register.user,
                    };
                  }
                }
              );
            },
          },
        },
      }),
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  };
};
