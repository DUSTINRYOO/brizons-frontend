import Button from "@/components/button";
import type { NextPage } from "next";
import Link from "next/link";
import Layout from "../components/layout";

import Image from "next/image";
import Homepage from "@/components/homepage";
import { gql, useQuery, useReactiveVar } from "@apollo/client";
import { authTokenVar, isLoggedInVar } from "@/libs/apolloClient";
import { cls, capitalizeFirstLetter } from "@/libs/utils";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GetRecentBrizOutput, GetUserProfilesOutput } from "@/src/gql/graphql";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Quotes from "@/components/quotes";

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

const USER_PROFILES_QUERY = gql`
  query userProfilesQuery($getUserProfilesInput: GetUserProfilesInput!) {
    getUserProfiles(getUserProfilesInput: $getUserProfilesInput) {
      ok
      error
      getUserProfiles {
        id
        username
        biography
        profileImg
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

interface getUserProfilesQuery {
  getUserProfiles: GetUserProfilesOutput;
}

interface SearchForm {
  search?: string;
}

const rowVariants = {
  hidden: (direction: boolean) => ({
    x: direction ? window.outerWidth + 500 : -window.outerWidth - 500,
  }),
  visible: {
    x: 0,
  },
  exit: (direction: boolean) => ({
    x: direction ? -window.outerWidth - 500 : window.outerWidth + 500,
  }),
};

const offset = 6;

const Home: NextPage = () => {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [quoteNumber, setQuoteNumber] = useState(1);
  const [mouseOnBriz, setMouseOnBriz] = useState<number | undefined>(undefined);
  const [mouseOnUser, setMouseOnUser] = useState<number | undefined>(undefined);
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const authToken = useReactiveVar(authTokenVar);

  const {
    data: meData,
    loading: meLoading,
    error: meError,
    refetch: meRefetch,
  } = useQuery<meQuery>(ME_QUERY);

  const {
    data: getUserProfilesData,
    loading: getUserProfilesLoading,
    error: getUserProfilesError,
    refetch: getUserProfilesRefetch,
  } = useQuery<getUserProfilesQuery>(USER_PROFILES_QUERY, {
    variables: { getUserProfilesInput: { scrollPage: 1 } },
  });

  const {
    data: getRecentBrizData,
    loading: getRecentBrizLoading,
    error: getRecentBrizError,
    refetch: getRecentBrizRefetch,
  } = useQuery<getRecentBrizQuery>(RECENT_BRIZ_QUERY, {
    variables: { getRecentBrizInput: { scrollPage: 1 } },
  });

  useEffect(() => {
    meRefetch();
    getUserProfilesRefetch();
    getRecentBrizRefetch();
  }, [meData, getUserProfilesData, getRecentBrizData]);

  const {
    register: registerSearch,
    handleSubmit: handleSubmitSearch,
    resetField: resetFieldSearch,
    formState: { errors: errorsSearch },
    setValue: setValueSearch,
    reset: resetSearch,
  } = useForm<SearchForm>({
    mode: "onChange",
  });
  const toggleLeaving = () => setLeaving((prev) => !prev);
  const increaseIndex = async () => {
    if (getRecentBrizData) {
      if (leaving) return;
      await setDirection(true);
      toggleLeaving();
      const totalUsers =
        getRecentBrizData.getRecentBriz.getRecentBriz.length - 1;
      const maxIndex = Math.floor(totalUsers / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const decreaseIndex = async () => {
    if (getRecentBrizData) {
      if (leaving) return;
      await setDirection(false);
      toggleLeaving();
      const totalUsers =
        getRecentBrizData.getRecentBriz.getRecentBriz.length - 1;
      const maxIndex = Math.floor(totalUsers / offset) - 1;
      setIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    }
  };

  if (meLoading) {
    return (
      <span className="fixed top-[15vw] w-full   py-2 text-center text-2xl font-extrabold text-gray-300">
        Loading
      </span>
    );
  }
  return !isLoggedIn ? (
    <Layout title="Home" hasTabBar>
      <div className="absolute left-0 right-0 -z-10 mx-auto h-screen w-full max-w-7xl">
        <Image
          priority
          src={
            "https://dustinbrizonsbucketlfg.s3.amazonaws.com/1681797953674IMG_1459.jpeg"
          }
          alt={"A sharable portfolio-based archive service"}
          fill
          style={{
            objectFit: "cover",
          }}
        ></Image>
      </div>
      <div className="h-auto w-full py-20 ">
        <div className="mx-auto mt-0 h-auto max-w-6xl p-10 pb-14 ">
          <h3 className="mt-6 text-center text-6xl font-bold text-gray-50">
            Broaden your horizons!
          </h3>
          <h3 className="mt-4 text-center text-3xl font-black text-gray-50 ">
            A sharable portfolio-based archive service
          </h3>
          <div className=" mt-8 flex flex-col items-center justify-center   ">
            <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-3xl ">
              <Image
                className="opacity-80"
                priority
                src={"https://dustinbrizonsbucketlfg.s3.amazonaws.com/1.jpeg"}
                alt={"Broaden your horizons"}
                fill
                style={{
                  objectFit: "cover",
                }}
              ></Image>
              <div
                className=" absolute flex h-full w-full flex-col items-center justify-center px-4 font-black italic text-gray-50"
                style={{
                  fontSize: `clamp(0.85rem,
                  2.5vw,2rem)`,
                }}
              >
                <Quotes />
              </div>
            </div>
          </div>

          <Link legacyBehavior href="/signup">
            <a className="mx-auto mt-8 flex w-fit items-center justify-center font-bold text-gray-100">
              <Button large text={"Start now"} />
            </a>
          </Link>
        </div>
        <Homepage
          bgColor="bg-red-300"
          pageTitle="Capture ideas resonate with you!"
          pageDescription="Like a Note / Planner / To-Do list / Bucket list, Put anything that comes to your mind throughout the day into the bucket"
        >
          <div className="relative h-[46rem] w-full  overflow-hidden rounded-2xl">
            <Image
              className="opacity-90"
              priority
              src={
                "https://dustinbrizonsbucketlfg.s3.amazonaws.com/bucket.jpeg"
              }
              alt={"Capture ideas resonate with you"}
              fill
              style={{
                objectFit: "cover",
              }}
            ></Image>
          </div>
        </Homepage>
        <Homepage
          bgColor="bg-yellow-300"
          pageTitle="Visualize projects you are into!"
          pageDescription="Like a Blog / Portfolio / Collection / Album, Make your own pages that show your achivement or progress on the Briz"
          reverse
        >
          <div className="relative h-[46rem] w-full  overflow-hidden rounded-2xl">
            <Image
              className="opacity-90"
              priority
              src={"https://dustinbrizonsbucketlfg.s3.amazonaws.com/photo.jpeg"}
              alt={"Visualize projects you are into"}
              fill
              style={{
                objectFit: "cover",
              }}
            ></Image>
          </div>
        </Homepage>
        <Homepage
          bgColor="bg-black"
          pageTitle="Share experiences in your life!"
          pageDescription="Like a Story / Course / Mentoring / Motivation, Collaborate with others to learn from each other and get closer together"
        >
          <div className="relative h-[46rem] w-full  overflow-hidden rounded-2xl">
            <Image
              className="opacity-90"
              priority
              src={"https://dustinbrizonsbucketlfg.s3.amazonaws.com/light.jpeg"}
              alt={"Share experiences in your life"}
              fill
              style={{
                objectFit: "cover",
              }}
            ></Image>
          </div>
        </Homepage>
      </div>
    </Layout>
  ) : (
    <Layout title="Home" hasTabBar>
      <motion.div className="h-auto w-full py-20 ">
        <motion.div className="relative mx-auto mt-0 h-auto w-[92vw] max-w-7xl ">
          {/*    <motion.div
            className="left-0 right-0 mx-auto  flex w-1/2 flex-row items-center justify-start rounded-full border-2 border-gray-300"
            style={{
              height: `clamp(1px,
                  4vw,3.2rem)`,
              marginBottom: `clamp(1px,
                    2vw,1.6rem)`,
            }}
          >
            <svg
              className="absolute block"
              xmlns="http://www.w3.org/2000/svg"
              width="clamp(1px,
                3vw,2.4rem)"
              height="clamp(1px,
                3vw,2.4rem)"
              viewBox="-230 -140 800 800"
            >
              <path
                d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
                fill="rgb(252 165 165)"
              />
            </svg>
            <input
              id="search"
              required
              type="text"
              placeholder="Search"
              className=" h-full w-full rounded-full font-semibold text-black placeholder:font-semibold 
                placeholder:text-gray-300
               focus:outline-none"
              style={{
                fontSize: `clamp(1px,
                  1.6vw,1.28rem)`,
                paddingLeft: `clamp(1px,
                3.2vw,2.56rem)`,
                paddingRight: `clamp(1px,
                  2vw,1.6rem)`,
              }}
            />
          </motion.div> */}
          <motion.div
            className="left-0 right-0 mx-auto  flex w-full flex-row items-center justify-center font-extrabold"
            style={{
              fontSize: `clamp(1px,
                5vw,4rem)`,
              height: `clamp(1px,
                  4vw,3.2rem)`,
              marginBottom: `clamp(1px,
                    2vw,1.6rem)`,
              marginTop: `clamp(1px,
                      2vw,1.6rem)`,
            }}
          >
            Hello, {capitalizeFirstLetter(`${meData?.me.username}`)}!
          </motion.div>
          <motion.div
            className="relative  w-full "
            style={{
              height: `clamp(1px,11.6vw,9.28rem)`,
              marginBottom: `clamp(1px,
                    2vw,1.6rem)`,
            }}
          >
            <motion.div
              className="absolute z-10 flex h-full w-auto flex-col items-center justify-center"
              style={{
                left: `clamp(1px,
                    3vw,2.4rem)`,
              }}
            >
              <motion.svg
                id={"1"}
                xmlns="http://www.w3.org/2000/svg"
                width="clamp(1px,
                4vw,3.2rem)"
                height="clamp(1px,
                4vw,3.2rem)"
                onClick={decreaseIndex}
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{ scale: 1.1 }}
                viewBox="-180 -50 600 600"
                className="rounded-full border-4 border-gray-50   bg-white focus:outline-none"
              >
                <path
                  d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l128-128c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 256c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-128-128z"
                  fill="gray"
                />
              </motion.svg>
            </motion.div>
            <motion.div
              className="absolute z-10 flex h-full w-auto flex-col items-center justify-center"
              style={{
                right: `clamp(1px,
                  3vw,2.4rem)`,
              }}
            >
              <motion.svg
                id={"2"}
                xmlns="http://www.w3.org/2000/svg"
                width="clamp(1px,
                4vw,3.2rem)"
                height="clamp(1px,
                4vw,3.2rem)"
                onClick={increaseIndex}
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{ scale: 1.1 }}
                viewBox="-160 -50 600 600"
                className="rounded-full border-4 border-gray-50   bg-white focus:outline-none"
              >
                <path
                  d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"
                  fill="gray"
                />
              </motion.svg>
            </motion.div>
            <AnimatePresence
              initial={false}
              onExitComplete={toggleLeaving}
              custom={direction}
            >
              <motion.div
                className="absolute left-0 right-0 mx-auto grid  w-4/5 grid-cols-6 "
                custom={direction}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={index}
              >
                {getUserProfilesData?.getUserProfiles.getUserProfiles
                  .slice(offset * index, offset * index + offset)
                  .map((user) => (
                    <motion.div key={user.id} className="relative">
                      <motion.div
                        key={user.id}
                        layoutId={user.id + "user"}
                        className="relative aspect-square overflow-hidden rounded-full border-4 border-gray-50 bg-white shadow-lg"
                        style={{
                          height: `clamp(1px,10vw,8rem)`,
                          margin: `clamp(1px,0.8vw,0.64rem)`,
                        }}
                        transition={{ type: "tween" }}
                        onHoverStart={() => setMouseOnUser(user.id)}
                        onHoverEnd={() => setMouseOnUser(undefined)}
                      >
                        {user.profileImg ? (
                          <Image
                            priority
                            src={`${user.profileImg}`}
                            alt={`${user.biography}`}
                            placeholder="blur"
                            blurDataURL={user.profileImg}
                            fill
                            style={{
                              objectFit: "contain",
                              borderRadius: "clamp(1px,2vw,1.6rem)",
                            }}
                          ></Image>
                        ) : null}
                        {mouseOnUser === user.id ? (
                          <>
                            <motion.div
                              className="absolute top-0 h-full w-full bg-black opacity-40"
                              onClick={() => {
                                router.push(`/briz/${user.username}`);
                              }}
                              style={{
                                borderRadius: "clamp(1px,2vw,1.6rem)",
                              }}
                            ></motion.div>
                            <motion.span
                              className={cls(
                                "absolute z-10 w-full truncate break-words px-2 text-center font-bold text-white transition-all"
                              )}
                              style={{
                                bottom: `clamp(1px,
                  0.8vw,0.64rem)`,
                                fontSize: `clamp(1px,
                 1.2vw,0.96rem)`,
                              }}
                            >
                              {user.username}
                            </motion.span>
                          </>
                        ) : null}
                      </motion.div>
                      {mouseOnUser === user.id ? (
                        <>
                          {user.biography ? (
                            <motion.div
                              className=" absolute left-1/2 z-10 -translate-x-1/2 overflow-hidden  text-ellipsis  rounded-3xl border-4 border-gray-100 bg-white px-4 py-1 font-bold shadow-xl"
                              style={{
                                width: `clamp(1px,
                              32vw,25.6rem)`,
                                fontSize: `clamp(1px,
                                1.2vw,0.96rem)`,
                              }}
                            >
                              {user.biography}
                            </motion.div>
                          ) : null}
                        </>
                      ) : null}
                    </motion.div>
                  ))}
              </motion.div>
            </AnimatePresence>
          </motion.div>
          <motion.div className="absolute left-1/2 mx-auto w-full -translate-x-1/2 columns-4 space-y-4  pb-[4rem]">
            {getRecentBrizData?.getRecentBriz.getRecentBriz.map((briz) => (
              <motion.div
                key={briz.id}
                className={cls("relative block")}
                onHoverStart={() => setMouseOnBriz(briz.id)}
                onHoverEnd={() => setMouseOnBriz(undefined)}
                style={{
                  paddingBottom: "clamp(1px,3vw,2.4rem)",
                }}
              >
                <Image
                  priority
                  src={`${briz.coverImg}`}
                  alt={`${briz.title}-${briz.description}`}
                  placeholder="blur"
                  blurDataURL={briz.coverImg}
                  width="1000"
                  height="1000"
                  className="shadow-lg"
                  style={{
                    borderRadius: "clamp(1px,2vw,1.6rem)",
                  }}
                ></Image>
                <motion.span
                  className={cls(
                    "absolute                  w-full truncate break-words px-2 font-bold transition-all",
                    mouseOnBriz === briz.id ? "z-10 text-center text-white" : ""
                  )}
                  style={{
                    bottom: `clamp(1px,
                      0.8vw,0.64rem)`,
                    fontSize: `clamp(1px,
                     1.2vw,0.96rem)`,
                  }}
                >
                  {briz.title}
                </motion.span>
                {mouseOnBriz === briz.id ? (
                  <>
                    <motion.div
                      className="absolute top-0 h-full w-full bg-black opacity-40"
                      onClick={() => {
                        router.push(`/briz/${briz.owner.username}/${briz.id}`);
                      }}
                      style={{
                        borderRadius: "clamp(1px,2vw,1.6rem)",
                      }}
                    ></motion.div>
                    <motion.span
                      className="absolute px-3 font-bold text-white"
                      style={{
                        top: `clamp(1px,
                      1.2vw,0.96rem)`,
                        fontSize: `clamp(1px,
                     1.2vw,0.96rem)`,
                      }}
                    >
                      {briz.description}
                    </motion.span>
                  </>
                ) : null}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Home;
