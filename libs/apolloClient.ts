import { LOCALSTORAGE_TOKEN } from "@/src/constants";
import {
  ApolloClient,
  createHttpLink,
  HttpLink,
  InMemoryCache,
  makeVar,
} from "@apollo/client";
import { useEffect, useMemo, useState } from "react";
import { setContext } from "@apollo/client/link/context";

let apolloClient: any;
/* let token: string; */
export const isLoggedInVar = makeVar(false);
export const authTokenVar = makeVar("");
/* if (typeof window !== "undefined") {
  token = localStorage.getItem(LOCALSTORAGE_TOKEN) as string;
} */
const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql",
});

const authLink = setContext((_, { headers }) => {
  console.log(headers);
  return {
    headers: {
      ...headers,
      "x-jwt": authTokenVar() || "",
    },
  };
});

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            isLoggedIn: {
              read() {
                return isLoggedInVar();
              },
            },
            token: {
              read() {
                return authTokenVar();
              },
            },
          },
        },
      },
    }),
  });
}
export function initializeApollo(initialState = Object || null) {
  const _apolloClient = apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client,
  // the initial state gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Restore the cache using the data passed from
    // getStaticProps/getServerSideProps combined with the existing cached data
    _apolloClient.cache.restore({ ...existingCache, ...initialState });
  }

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") return _apolloClient;

  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;
  return _apolloClient;
}
export function useApollo(initialState: any) {
  const store = useMemo(() => initializeApollo(initialState), [initialState]);

  return store;
}
