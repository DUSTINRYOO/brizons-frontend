import { LOCALSTORAGE_TOKEN } from "@/src/constants";
import "@/styles/globals.css";
import { ApolloProvider } from "@apollo/client";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { authTokenVar, isLoggedInVar, useApollo } from "../libs/apolloClient";

export default function App({ Component, pageProps }: AppProps) {
  const apolloClient = useApollo(pageProps.initialApolloState);
  return (
    <ApolloProvider client={apolloClient}>
      <HelmetProvider>
        <div className="bg-white-400 mx-auto  w-full">
          <Component {...pageProps} />
        </div>
      </HelmetProvider>
    </ApolloProvider>
  );
}
