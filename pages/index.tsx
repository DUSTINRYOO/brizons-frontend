import Button from "@/components/button";
import type { NextPage } from "next";
import Link from "next/link";
import Layout from "../components/layout";
import bg from "public/homebg.png";
import exam1 from "public/exam1.png";
import exam2 from "public/exam2.png";
import exam3 from "public/exam3.png";
import exam4 from "public/exam4.png";
import Image from "next/image";
import Homepage from "@/components/homepage";
import { gql, useQuery, useReactiveVar } from "@apollo/client";
import { authTokenVar, isLoggedInVar } from "@/libs/apolloClient";
import { capitalizeFirstLetter, cls } from "@/libs/utils";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GetRecentBrizOutput } from "@/src/gql/graphql";

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

const RECENT_BRIZ_QUERY = gql`
  query recentBrizQuery($getRecentBrizInput: GetRecentBrizInput!) {
    getRecentBriz(getRecentBrizInput: $getRecentBrizInput) {
      ok
      error
      getRecentBriz {
        id
        coverImg
        title
        description
        owner {
          id
          username
          profileImg
          biography
        }
      }
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

interface getRecentBrizQuery {
  getRecentBriz: GetRecentBrizOutput;
}

const Home: NextPage = () => {
  const { data, loading, error, refetch } = useQuery<meQuery>(ME_QUERY);
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const authToken = useReactiveVar(authTokenVar);
  const {
    data: getRecentBrizData,
    loading: getRecentBrizLoading,
    error: getRecentBrizError,
    refetch: getRecentBrizRefetch,
  } = useQuery<getRecentBrizQuery>(RECENT_BRIZ_QUERY, {
    variables: { getRecentBrizInput: { scrollPage: 1 } },
  });

  useEffect(() => {
    refetch();
  }, [data, loading, error]);

  if (loading) {
    return (
      <span className="fixed top-[15vw] w-full   py-2 text-center text-2xl font-extrabold text-gray-300">
        Loading
      </span>
    );
  }
  return !isLoggedIn ? (
    <Layout title="Home" hasTabBar>
      <div className=" absolute -z-10 h-auto w-screen overflow-hidden">
        <div className="relative h-[100rem] w-full min-w-[80rem] bg-slate-600">
          <Image src={bg} alt="Background" fill />
        </div>
      </div>
      <div className="h-auto w-full py-20">
        <div className="mx-auto mt-0 h-auto max-w-6xl p-10 pb-14 ">
          <h3 className="mt-4 text-center text-6xl font-bold text-gray-100">
            Broaden your horizons!
          </h3>
          <h3 className="mt-4 text-center text-2xl font-bold text-gray-100">
            A portfolio-based archive service for all you want.
          </h3>
          <div className=" mt-8 grid grid-cols-2 items-center gap-8 sm:grid-cols-3 lg:grid-cols-4 ">
            <div className="relative h-[26rem] w-full  overflow-hidden rounded-2xl">
              <Image src={exam1} alt="Background" fill />
            </div>
            <div className="relative h-[26rem] w-full  overflow-hidden rounded-2xl">
              <Image src={exam2} alt="Background" fill />
            </div>
            <div className="relative h-[26rem] w-full  overflow-hidden rounded-2xl">
              <Image src={exam3} alt="Background" fill />
            </div>
            <div className="relative h-[26rem] w-full  overflow-hidden rounded-2xl">
              <Image src={exam4} alt="Background" fill />
            </div>
          </div>
          <Link legacyBehavior href="/signup">
            <a className="mx-auto mt-8 flex w-fit items-center justify-center font-bold text-gray-100">
              <Button large text={"Start now"} />
            </a>
          </Link>
        </div>
        <Homepage
          bgColor="bg-red-500"
          pageTitle="Draw whatever you are into now!"
          pageDescription="Visualize your progress of what you are doing!   Collect everything you love! and Be who you want to be!"
        >
          <div className="relative h-[46rem] w-full  overflow-hidden rounded-2xl">
            <Image src={exam3} alt="Background" fill />
          </div>
        </Homepage>
        <Homepage
          bgColor="bg-black"
          pageTitle="Share your things!"
          pageDescription="Experience, knowledge and knowhow... Also get more things from other people for what you want to try"
          reverse
        >
          <div className="relative h-[46rem] w-full  overflow-hidden rounded-2xl">
            <Image src={exam2} alt="Background" fill />
          </div>
        </Homepage>
        <Homepage
          bgColor="bg-white"
          pageTitle="Big data hub!"
          pageDescription="With various records and results people share for specific subjects, you can easily try or challange something you really want  "
          textColor="text-black"
        >
          <div className="relative h-[46rem] w-full  overflow-hidden rounded-2xl">
            <Image src={exam1} alt="Background" fill />
          </div>
        </Homepage>
      </div>
    </Layout>
  ) : (
    <Layout title="Home" hasTabBar>
      <motion.div className="h-auto w-full py-20 ">
        <motion.div className="relative mx-auto mt-0 h-auto w-[92vw] max-w-7xl ">
          <motion.div className="left-0 right-0 mx-auto mb-4 flex h-14 w-1/2 flex-row items-center justify-start rounded-full border-2 border-red-300 px-2">
            <svg
              className="block"
              xmlns="http://www.w3.org/2000/svg"
              width="clamp(1px,
                3vw,2.4rem)"
              height="clamp(1px,
                3vw,2.4rem)"
              viewBox="-180 -130 800 800"
            >
              <path
                d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
                fill="rgb(252 165 165)"
              />
            </svg>
            <motion.span
              className="font-semibold text-gray-800"
              style={{
                fontSize: `clamp(1px,
                    1.4vw,1.12rem)`,
              }}
            >
              Search
            </motion.span>
          </motion.div>
          <motion.div className="absolute left-1/2 mx-auto w-full -translate-x-1/2 columns-4 space-y-10 ">
            {getRecentBrizData?.getRecentBriz.getRecentBriz.map((briz) => (
              <motion.div
                key={briz.id}
                whileHover="hoverBox"
                variants={{
                  initial: { opacity: 0 },
                  normal: { opacity: 1 },
                  exit: { opacity: 0 },
                  hoverBox: { scale: 1.03 },
                }}
                transition={{
                  duration: 0.4,
                }}
                className="block"
              >
                <Image
                  priority
                  src={`${briz.coverImg}`}
                  alt={`${briz.title}-${briz.description}`}
                  placeholder="blur"
                  blurDataURL={briz.coverImg}
                  width="1000"
                  height="1000"
                  style={{
                    borderRadius: "clamp(1px,2vw,1.6rem)",
                  }}
                ></Image>
                <motion.span
                  className="absolute w-1/4 truncate break-words px-4 pt-1 font-bold"
                  style={{
                    fontSize: `clamp(1px,
                    1vw,0.8rem)`,
                  }}
                >
                  {briz.title}
                </motion.span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Home;
