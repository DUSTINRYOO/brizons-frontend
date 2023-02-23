import "@/styles/globals.css";
import { ApolloProvider } from "@apollo/client";
import type { AppProps } from "next/app";
import client from "./apollo";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <div className="bg-white-400 mx-auto  w-full">
        <Component {...pageProps} />
      </div>
    </ApolloProvider>
  );
}
