import "@/styles/globals.css";
import { ApolloProvider } from "@apollo/client";
import type { AppProps } from "next/app";
import { useApollo } from "../libs/apolloClient";

export default function App({ Component, pageProps }: AppProps) {
  const apolloClient = useApollo(pageProps.initialApolloState);
  return (
    <ApolloProvider client={apolloClient}>
      <div className="bg-white-400 mx-auto  w-full">
        <Component {...pageProps} />
      </div>
    </ApolloProvider>
  );
}
