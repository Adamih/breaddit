import { dedupExchange, fetchExchange, Exchange } from "urql";
import { cacheExchange } from "@urql/exchange-graphcache";
import {
  LogoutMutation,
  MeQuery,
  MeDocument,
  LoginMutation,
  RegisterMutation,
} from "../generated/graphql";
import { myUpdateQuery } from "./myUpdateQuery";
import { pipe, tap } from "wonka";
import Router from "next/router";
import { STATUS_CODES } from "../constants";

const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error) {
        const errors = error.graphQLErrors;
        for (const e in errors) {
          if (errors[e].extensions.code === STATUS_CODES.UNAUTHENTICATED) {
            if (Router.pathname !== "/login") {
              Router.replace("/login");
            }
          }
        }
      }
    })
  );
};

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      updates: {
        Mutation: {
          logout: (_result, args, cache, info) => {
            myUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => ({ me: null })
            );
          },
          login: (_result, args, cache, info) => {
            myUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (!result.login.user) {
                  return query;
                }
                return { me: result.login.user };
              }
            );
          },
          register: (_result, args, cache, info) => {
            myUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (!result.register.user) {
                  return query;
                }
                return { me: result.register.user };
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
});
