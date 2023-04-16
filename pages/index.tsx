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
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GetRecentBrizOutput, GetUserProfilesOutput } from "@/src/gql/graphql";
import { useRouter } from "next/router";
import Input from "@/components/input";
import { useForm } from "react-hook-form";

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
  const [slider, setSlider] = useState("");
  const [mouseOnBriz, setMouseOnBriz] = useState<number | undefined>(undefined);
  const [mouseOnUser, setMouseOnUser] = useState<number | undefined>(undefined);
  const { data, loading, error, refetch } = useQuery<meQuery>(ME_QUERY);
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const authToken = useReactiveVar(authTokenVar);

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
          <motion.div
            className="left-0 right-0 mx-auto  flex w-1/2 flex-row items-center justify-start rounded-full border-2 border-red-300"
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
              viewBox="-220 -160 800 800"
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
                3vw,2.4rem)`,
                paddingRight: `clamp(1px,
                  2vw,1.6rem)`,
              }}
            />
          </motion.div>
          <motion.div
            className="relative h-auto w-full"
            style={{
              marginBottom: `clamp(1px,
                    2vw,1.6rem)`,
            }}
          >
            <AnimatePresence
              initial={false}
              onExitComplete={toggleLeaving}
              custom={direction}
            >
              <motion.div
                className="relative left-0 right-0 mx-auto grid w-3/4 grid-cols-6"
                custom={direction}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={index}
              >
                <motion.div
                  className="absolute flex h-full w-auto flex-col items-center justify-center"
                  style={{
                    left: `clamp(-4.8rem,
                    -6vw,1px)`,
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
                    className="rounded-xl bg-red-300 focus:outline-none"
                  >
                    <path
                      d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l128-128c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 256c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-128-128z"
                      fill="white"
                    />
                  </motion.svg>
                </motion.div>
                <motion.div
                  className="absolute flex h-full w-auto flex-col items-center justify-center"
                  style={{
                    right: `clamp(-4.8rem,
                    -6vw,1px)`,
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
                    className="rounded-xl bg-red-300 focus:outline-none"
                  >
                    <path
                      d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"
                      fill="white"
                    />
                  </motion.svg>
                </motion.div>
                {getUserProfilesData?.getUserProfiles.getUserProfiles
                  .slice(offset * index, offset * index + offset)
                  .map((user) =>
                    user.profileImg ? (
                      <motion.div
                        key={user.id}
                        className="relative aspect-square overflow-hidden rounded-full border-4 border-gray-50 bg-white shadow-lg"
                        style={{
                          height: `clamp(1px,10vw,8rem)`,
                          margin: `clamp(1px,0.8vw,0.64rem)`,
                        }}
                        onHoverStart={() => setMouseOnUser(user.id)}
                        onHoverEnd={() => setMouseOnUser(undefined)}
                      >
                        <Image
                          priority
                          src={`${user.profileImg}`}
                          alt={`${user.biography}`}
                          placeholder="blur"
                          blurDataURL={user.profileImg}
                          width="1000"
                          height="1000"
                          style={{
                            borderRadius: "clamp(1px,2vw,1.6rem)",
                          }}
                        ></Image>
                        <motion.span
                          className={cls(
                            "absolute                  w-full truncate break-words px-2 font-bold transition-all",
                            mouseOnUser === user.id
                              ? "z-10 text-center text-white"
                              : ""
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
                              className="absolute px-3 font-bold text-white"
                              style={{
                                top: `clamp(1px,
                  1.2vw,0.96rem)`,
                                fontSize: `clamp(1px,
                 1.2vw,0.96rem)`,
                              }}
                            >
                              {user.biography}
                            </motion.span>
                          </>
                        ) : null}
                      </motion.div>
                    ) : null
                  )}
                {/*    {data?.results
                  .slice(1)
                  .slice(offset * index, offset * index + offset)
                  .map((movie) => (
                    <motion.div
                      layoutId={movie.id + ""}
                      key={movie.id}
                      whileHover="hover"
                      initial="normal"
                      variants={boxVariants}
                      onClick={() => onBoxClicked(movie.id, "")}
                      transition={{ type: "tween" }}
                      bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                    >
                      <motion.div variants={infoVariants}>
                        <h4>{movie.title}</h4>
                      </motion.div>
                    </motion.div>
                  ))} */}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div className="absolute left-1/2 mx-auto w-full -translate-x-1/2 columns-4 space-y-4 ">
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
