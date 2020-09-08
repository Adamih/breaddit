import { ThemeProvider, CSSReset, ColorModeProvider } from "@chakra-ui/core";
import { Provider, createClient, dedupExchange, fetchExchange } from "urql";
import { cacheExchange, QueryInput, Cache } from "@urql/exchange-graphcache";
import theme from "../theme";
import {
  MeDocument,
  LoginMutation,
  MeQuery,
  RegisterMutation,
  LogoutMutation,
} from "../generated/graphql";

const myUpdateQuery = <Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) => {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
};

const client = createClient({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include",
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
    fetchExchange,
  ],
});

function MyApp({ Component, pageProps }) {
  return (
    <Provider value={client}>
      <ThemeProvider theme={theme}>
        <CSSReset />
        <Component {...pageProps} />
      </ThemeProvider>
    </Provider>
  );
}

export default MyApp;
