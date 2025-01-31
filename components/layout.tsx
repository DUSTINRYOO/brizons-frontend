import React from "react";
import Link from "next/link";
import { cls } from "../libs/utils";
import { useRouter } from "next/router";
import { gql, useQuery, useReactiveVar } from "@apollo/client";
import { isLoggedInVar, authTokenVar } from "@/libs/apolloClient";
import { LOCALSTORAGE_TOKEN } from "@/src/constants";
import Head from "next/head";

const ME_QUERY = gql`
  query meQuery {
    me {
      id
      email
      username
      verified
    }
  }
`;
type meQueryList = {
  id: string;
  email: string;
  username: string;
  verified: boolean;
};

interface meQuery {
  me: meQueryList;
}
interface LayoutProps {
  title?: string;
  canGoBack?: boolean;
  hasTabBar?: boolean;
  children: React.ReactNode;
}

export default function Layout({
  title,
  canGoBack,
  hasTabBar,
  children,
}: LayoutProps) {
  const {
    data: meData,
    loading: meLoading,
    error: meError,
    refetch: meRefetch,
  } = useQuery<meQuery>(ME_QUERY);
  const router = useRouter();
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const onClickLogOut = () => {
    if (isLoggedIn) {
      localStorage.removeItem(LOCALSTORAGE_TOKEN);
      isLoggedInVar(false);
      authTokenVar("");
      meRefetch();
      router.push("/");
    }
  };
  const titleWithBrizons = `${title} | Brizons`;
  return (
    <div>
      <Head>
        <title>{titleWithBrizons}</title>
      </Head>
      <div>{children}</div>
      {hasTabBar ? (
        <nav className="fixed top-0 z-[1000] flex h-14 w-full justify-between border-b bg-white px-20 py-3 text-xs text-gray-800 shadow-md max-md:pl-0 max-md:pr-4">
          <Link legacyBehavior href="/">
            <a className={cls("flex flex-col items-center justify-center ")}>
              <svg
                width="162"
                height="36"
                viewBox="0 0 360 84"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M113.873 24.0293H131.305C138.528 24.0293 143.678 25.1003 146.754 27.2422C149.83 29.3841 151.368 32.4603 151.368 36.4707C151.368 38.6582 150.969 40.5153 150.172 42.042C149.397 43.5687 148.406 44.7764 147.198 45.665C146.013 46.5537 144.794 47.1576 143.541 47.4766V47.8184C144.908 48.1602 146.264 48.7298 147.608 49.5273C148.976 50.3021 150.104 51.4756 150.992 53.0479C151.904 54.5973 152.359 56.7051 152.359 59.3711C152.359 62.4017 151.585 65.0107 150.035 67.1982C148.508 69.3857 146.321 71.0719 143.473 72.2568C140.624 73.4189 137.241 74 133.321 74H113.873V24.0293ZM127.374 43.2041H131.441C133.674 43.2041 135.247 42.7484 136.158 41.8369C137.07 40.9027 137.525 39.7747 137.525 38.4531C137.525 37.0859 137.001 36.0492 135.953 35.3428C134.928 34.6136 133.333 34.249 131.168 34.249H127.374V43.2041ZM127.374 53.082V63.5752H132.125C134.472 63.5752 136.113 63.0739 137.047 62.0713C137.981 61.0459 138.448 59.7699 138.448 58.2432C138.448 57.3545 138.243 56.5228 137.833 55.748C137.446 54.9505 136.773 54.3125 135.816 53.834C134.859 53.3327 133.538 53.082 131.852 53.082H127.374ZM183.134 34.5908C183.863 34.5908 184.626 34.6478 185.424 34.7617C186.221 34.8529 186.814 34.9326 187.201 35.001L186.005 47.6133C185.572 47.4993 185.014 47.4082 184.33 47.3398C183.646 47.2487 182.689 47.2031 181.459 47.2031C180.616 47.2031 179.716 47.2829 178.759 47.4424C177.802 47.6019 176.89 47.9437 176.024 48.4678C175.181 48.9691 174.486 49.7438 173.939 50.792C173.393 51.8174 173.119 53.2074 173.119 54.9619V74H159.755V35.2744H169.701L171.786 41.4609H172.436C173.142 40.1849 174.042 39.0342 175.136 38.0088C176.252 36.9606 177.494 36.1289 178.861 35.5137C180.251 34.8984 181.675 34.5908 183.134 34.5908ZM205.568 35.2744V74H192.204V35.2744H205.568ZM198.938 19.6885C200.852 19.6885 202.515 20.0872 203.928 20.8848C205.363 21.6823 206.081 23.266 206.081 25.6357C206.081 27.9372 205.363 29.498 203.928 30.3184C202.515 31.1159 200.852 31.5146 198.938 31.5146C196.978 31.5146 195.303 31.1159 193.913 30.3184C192.546 29.498 191.862 27.9372 191.862 25.6357C191.862 23.266 192.546 21.6823 193.913 20.8848C195.303 20.0872 196.978 19.6885 198.938 19.6885ZM243.521 74H211.46V66.3779L227.49 45.4941H212.383V35.2744H242.769V43.5459L227.422 63.7803H243.521V74ZM286.36 54.5518C286.36 57.7874 285.916 60.6585 285.027 63.165C284.139 65.6715 282.851 67.7793 281.165 69.4883C279.479 71.1973 277.439 72.4961 275.047 73.3848C272.654 74.2507 269.954 74.6836 266.946 74.6836C264.144 74.6836 261.569 74.2507 259.222 73.3848C256.897 72.4961 254.869 71.1973 253.138 69.4883C251.406 67.7793 250.062 65.6715 249.104 63.165C248.17 60.6585 247.703 57.7874 247.703 54.5518C247.703 50.2679 248.478 46.6449 250.027 43.6826C251.6 40.7204 253.833 38.4645 256.727 36.915C259.643 35.3656 263.118 34.5908 267.151 34.5908C270.866 34.5908 274.17 35.3656 277.063 36.915C279.957 38.4645 282.225 40.7204 283.865 43.6826C285.529 46.6449 286.36 50.2679 286.36 54.5518ZM261.272 54.5518C261.272 56.762 261.466 58.6305 261.854 60.1572C262.241 61.6611 262.856 62.8118 263.699 63.6094C264.565 64.3841 265.693 64.7715 267.083 64.7715C268.473 64.7715 269.578 64.3841 270.398 63.6094C271.219 62.8118 271.811 61.6611 272.176 60.1572C272.563 58.6305 272.757 56.762 272.757 54.5518C272.757 52.3415 272.563 50.4958 272.176 49.0146C271.811 47.5335 271.207 46.417 270.364 45.665C269.544 44.9131 268.427 44.5371 267.015 44.5371C264.987 44.5371 263.517 45.3802 262.605 47.0664C261.717 48.7526 261.272 51.2477 261.272 54.5518ZM317.75 34.5908C321.738 34.5908 324.996 35.7188 327.525 37.9746C330.055 40.2305 331.319 43.8421 331.319 48.8096V74H317.955V52.877C317.955 50.3021 317.579 48.3652 316.827 47.0664C316.098 45.7448 314.913 45.084 313.272 45.084C310.743 45.084 309.046 46.1208 308.18 48.1943C307.314 50.2451 306.881 53.196 306.881 57.0469V74H293.517V35.2744H303.6L305.411 40.4014H305.924C306.744 39.1709 307.724 38.1227 308.863 37.2568C310.003 36.391 311.313 35.7301 312.794 35.2744C314.275 34.8187 315.927 34.5908 317.75 34.5908ZM368.69 62.1055C368.69 64.5664 368.144 66.7425 367.05 68.6338C365.956 70.5251 364.201 72.0062 361.786 73.0771C359.394 74.1481 356.238 74.6836 352.318 74.6836C349.561 74.6836 347.089 74.5355 344.901 74.2393C342.737 73.943 340.538 73.3734 338.305 72.5303V61.832C340.743 62.9486 343.227 63.7575 345.756 64.2588C348.285 64.7373 350.279 64.9766 351.737 64.9766C353.241 64.9766 354.335 64.8171 355.019 64.498C355.725 64.1562 356.078 63.6549 356.078 62.9941C356.078 62.4245 355.839 61.946 355.36 61.5586C354.905 61.1484 354.073 60.6813 352.865 60.1572C351.68 59.6331 350.006 58.9268 347.841 58.0381C345.699 57.1494 343.91 56.181 342.475 55.1328C341.062 54.0846 340.002 52.8314 339.296 51.373C338.59 49.9147 338.236 48.126 338.236 46.0068C338.236 42.2243 339.695 39.376 342.611 37.4619C345.528 35.5479 349.39 34.5908 354.198 34.5908C356.75 34.5908 359.154 34.8757 361.41 35.4453C363.666 35.9922 366.002 36.8011 368.417 37.8721L364.76 46.4854C362.846 45.6195 360.909 44.9245 358.949 44.4004C356.99 43.8763 355.429 43.6143 354.267 43.6143C353.218 43.6143 352.41 43.751 351.84 44.0244C351.27 44.2979 350.985 44.6966 350.985 45.2207C350.985 45.6992 351.179 46.1208 351.566 46.4854C351.977 46.8499 352.74 47.2715 353.856 47.75C354.973 48.2285 356.602 48.9007 358.744 49.7666C361 50.6781 362.857 51.6579 364.315 52.7061C365.797 53.7314 366.89 54.9847 367.597 56.4658C368.326 57.9469 368.69 59.8268 368.69 62.1055Z"
                  fill="#ef4444"
                />
                <path
                  d="M29.5958 82.3975L16.7173 69.519C11.4692 64.271 8.67258 59.4257 8.32731 54.9833C7.95903 50.5639 9.99611 46.133 14.4385 41.6905C17.3618 38.7673 20.4462 36.9489 23.6917 36.2353C26.9142 35.5448 29.8259 36.0857 32.4269 37.8581L32.7722 37.5128C30.6316 33.945 29.9065 30.5499 30.597 27.3274C31.2876 24.1049 33.2556 20.8709 36.5011 17.6254C41.0816 13.0449 45.9039 10.6855 50.9678 10.5474C55.9857 10.4093 60.6238 12.4694 64.882 16.7277L80.0738 31.9195L29.5958 82.3975ZM41.0586 53.257L36.7428 48.9411C34.7633 46.9616 32.8413 46.0984 30.9768 46.3516C29.1124 46.6048 27.1329 47.7787 25.0382 49.8733C22.9436 51.968 21.9078 53.9245 21.9308 55.7429C21.9308 57.5843 22.9206 59.4948 24.9001 61.4743L28.8707 65.4449L41.0586 53.257ZM48.8962 45.4194L63.0176 31.298L58.2874 26.5678C56.3309 24.6113 54.2823 23.7597 52.1417 24.0129C49.978 24.243 47.6417 25.6126 45.1328 28.1215C40.6213 32.633 40.3451 36.8683 44.3041 40.8274L48.8962 45.4194Z"
                  fill="#ef4444"
                />
                <line
                  x1="75.7574"
                  y1="78.2621"
                  x2="101.072"
                  y2="52.9476"
                  stroke="#ef4444"
                  strokeWidth="12"
                />
                <line
                  x1="50.7574"
                  y1="78.234"
                  x2="88.5876"
                  y2="40.4038"
                  stroke="#ef4444"
                  strokeWidth="12"
                />
              </svg>
            </a>
          </Link>
          <div className={cls("flex items-center justify-center ")}>
            <Link legacyBehavior href="/">
              <a
                className={cls(
                  "ml-4 flex items-center justify-center text-xl font-extrabold max-md:invisible max-md:m-0 max-md:text-sm",
                  router.pathname === "/"
                    ? "text-red-500"
                    : "transition-colors hover:text-red-500"
                )}
              >
                <span>HOME</span>
              </a>
            </Link>
            {/*  <Link legacyBehavior href="/briz/brizons">
              <a
                className={cls(
                  "ml-4 flex items-center justify-center text-xl font-extrabold max-md:invisible max-md:m-0 max-md:text-sm",
                  router.pathname === "/briz/brizons"
                    ? "text-red-500"
                    : "transition-colors hover:text-red-500"
                )}
              >
                <span>ABOUT</span>
              </a>
            </Link> */}
            {isLoggedIn && meData?.me.username === "brizons" ? (
              <Link legacyBehavior href="/admin">
                <a
                  className={cls(
                    "ml-4 flex items-center justify-center text-xl font-extrabold max-md:invisible max-md:m-0 max-md:text-sm",
                    router.pathname === "/admin"
                      ? "text-red-500"
                      : "transition-colors hover:text-red-500"
                  )}
                >
                  <span>ADMIN</span>
                </a>
              </Link>
            ) : null}
            {!isLoggedIn ? (
              <Link legacyBehavior href="/login">
                <a
                  className={cls(
                    "ml-4 flex items-center justify-center rounded-xl bg-red-500 px-3 text-center text-xl font-extrabold  text-gray-100 ",
                    router.pathname === "/login"
                      ? "text-gray-100"
                      : "transition-all hover:scale-105 "
                  )}
                >
                  <span>LOG IN</span>
                </a>
              </Link>
            ) : (
              <button
                className={cls(
                  "ml-4 flex items-center justify-center text-center text-xl font-extrabold transition-colors hover:text-red-500"
                )}
                onClick={onClickLogOut}
              >
                LOG OUT
              </button>
            )}
            {!isLoggedIn ? (
              <Link legacyBehavior href="/signup">
                <a
                  className={cls(
                    "ml-4 flex items-center justify-center text-center text-xl font-extrabold",
                    router.pathname === "/signup"
                      ? "text-red-500"
                      : "transition-colors hover:text-red-500"
                  )}
                >
                  <span>SIGN UP</span>
                </a>
              </Link>
            ) : (
              <Link legacyBehavior href={`/briz/${meData?.me.username}`}>
                <a
                  className={cls(
                    "ml-4 flex items-center justify-center rounded-xl bg-red-500 px-3 text-center text-xl font-extrabold  text-gray-100 ",
                    router.pathname === "/briz"
                      ? "text-gray-100"
                      : "transition-all hover:scale-105 "
                  )}
                >
                  <span>MY BRIZ</span>
                </a>
              </Link>
            )}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
