import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="bg-white-400 mx-auto  w-full">
      <Component {...pageProps} />
    </div>
  );
}
