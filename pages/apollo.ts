import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://localhost:4000/graphql",
  cache: new InMemoryCache(),
});
