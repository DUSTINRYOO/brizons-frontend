import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  makeVar,
} from "@apollo/client";
import { useMemo } from "react";
import { setContext } from "@apollo/client/link/context";
import { LOCALSTORAGE_TOKEN } from "@/src/constants";

let apolloClient: any;

export const isLoggedInVar = makeVar(false);
export const authTokenVar = makeVar("");

const httpLink = createHttpLink({
  uri:
    process.env.NODE_ENV === "production"
      ? "https://brizons-proto-backend.herokuapp.com/graphql"
      : "http://localhost:4000/graphql",
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(LOCALSTORAGE_TOKEN);
  if (token) {
    isLoggedInVar(Boolean(token));
    authTokenVar(token);
  }
  return {
    headers: {
      ...headers,
      "x-jwt": authTokenVar(),
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
