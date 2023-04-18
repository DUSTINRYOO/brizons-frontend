import Layout from "@/components/layout";
import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import Button from "../components/button";
import Input from "../components/input";
import bg from "public/homebg.jpeg";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { gql, useMutation, useReactiveVar } from "@apollo/client";
import { authTokenVar, isLoggedInVar } from "@/libs/apolloClient";
import { LOCALSTORAGE_TOKEN } from "@/src/constants";
import { useEffect } from "react";

import { motion } from "framer-motion";
import { LoginInput, LoginOutput } from "@/src/gql/graphql";

const LOGIN_MUTATION = gql`
  mutation loginMutation($loginInput: LoginInput!) {
    login(input: $loginInput) {
      ok
      error
      token
    }
  }
`;

type loginForm = {
  username: string;
  password: string;
};

interface loginMutation {
  login: LoginOutput;
}

const Login: NextPage = () => {
  const router = useRouter();
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const authToken = useReactiveVar(authTokenVar);

  const onCompleted = (data: loginMutation) => {
    const {
      login: { error, ok, token },
    } = data;
    if (ok && token) {
      localStorage.setItem(LOCALSTORAGE_TOKEN, token);
      isLoggedInVar(true);
      authTokenVar(token);
      router.push("/");
    }
  };

  const [loginMutation, { data: loginMutationResult, loading, error }] =
    useMutation<loginMutation>(LOGIN_MUTATION, { onCompleted });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<loginForm>();

  const onSubmit = (data: LoginInput) => {
    if (!loading) {
      loginMutation({
        variables: {
          loginInput: {
            username: data.username.toLowerCase(),
            password: data.password,
          },
        },
      });
    }
  };

  useEffect(() => {
    const localToken = localStorage.getItem(LOCALSTORAGE_TOKEN);
    if (localToken) {
      isLoggedInVar(true);
      router.replace("/");
    }
  }, [isLoggedIn]);

  return (
    <Layout title="Log in" hasTabBar>
      <div className="absolute left-0 right-0 -z-10 mx-auto h-screen w-full max-w-7xl opacity-50 ">
        <Image
          priority
          src={bg}
          alt={"Brizons"}
          fill
          style={{
            objectFit: "cover",
          }}
        ></Image>
      </div>
      <div className="h-screen w-full px-4 py-20">
        <div className="mx-auto mt-14 max-w-lg rounded-3xl bg-white p-10 pb-14 shadow-lg">
          <svg
            className="mx-auto"
            width="80"
            height="60"
            viewBox="0 0 120 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M29.5958 80.3975L16.7173 67.519C11.4692 62.271 8.67258 57.4257 8.32731 52.9833C7.95903 48.5639 9.99611 44.133 14.4385 39.6905C17.3618 36.7673 20.4462 34.9489 23.6917 34.2353C26.9142 33.5448 29.8259 34.0857 32.4269 35.8581L32.7722 35.5128C30.6316 31.945 29.9065 28.5499 30.597 25.3274C31.2876 22.1049 33.2556 18.8709 36.5011 15.6254C41.0816 11.0449 45.9039 8.68555 50.9678 8.54744C55.9857 8.40933 60.6238 10.4694 64.882 14.7277L80.0738 29.9195L29.5958 80.3975ZM41.0586 51.257L36.7428 46.9411C34.7633 44.9616 32.8413 44.0984 30.9768 44.3516C29.1124 44.6048 27.1329 45.7787 25.0382 47.8733C22.9436 49.968 21.9078 51.9245 21.9308 53.7429C21.9308 55.5843 22.9206 57.4948 24.9001 59.4743L28.8707 63.4449L41.0586 51.257ZM48.8962 43.4194L63.0176 29.298L58.2874 24.5678C56.3309 22.6113 54.2823 21.7597 52.1417 22.0129C49.978 22.243 47.6417 23.6126 45.1328 26.1215C40.6213 30.633 40.3451 34.8683 44.3041 38.8274L48.8962 43.4194Z"
              fill="#ef4444"
            />
            <line
              x1="75.7574"
              y1="76.2621"
              x2="101.072"
              y2="50.9476"
              stroke="#ef4444"
              strokeWidth="12"
            />
            <line
              x1="50.7574"
              y1="76.234"
              x2="88.5876"
              y2="38.4038"
              stroke="#ef4444"
              strokeWidth="12"
            />
          </svg>
          <h3 className="mt-4 text-center text-3xl font-bold">
            Welcome to Brizons!
          </h3>
          <h3 className="text-md text-center font-bold text-gray-700">
            Broaden your horizons
          </h3>
          <div className="mt-4 px-4 max-sm:px-0 ">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mx-auto mt-6 flex w-80 flex-col space-y-4  max-sm:w-72"
            >
              <Input
                label="Username"
                name="username"
                type="text"
                required
                register={register("username")}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                required
                register={register("password")}
              />

              <Link legacyBehavior href="/forgot">
                <a className="w-fit border-b-2 border-gray-500 text-sm font-bold text-gray-700">
                  <span>Forgot your password?</span>
                </a>
              </Link>
              <Button text={"Log in"} />
            </form>
            <Link legacyBehavior href="/signup">
              <a className="text-md mx-auto mt-4 mb-2  flex w-fit items-center justify-center border-b-2 border-gray-500 font-bold text-gray-700">
                <span>Create Account</span>
              </a>
            </Link>
            <motion.span
              className="absolute left-0 right-0 mx-auto w-[22rem]  text-center font-semibold text-red-500"
              layout
            >
              <span className="block">
                {!loginMutationResult?.login.ok
                  ? loginMutationResult?.login.error
                  : null}
              </span>
            </motion.span>
            {/*  <div className="mt-8">
              <div className="relative">
                <div className="absolute w-full border-t border-gray-300" />
                <div className="relative -top-3 text-center ">
                  <span className="bg-white px-2 text-sm text-gray-500">
                    Or enter with
                  </span>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50">
                  <svg
                    className="h-5 w-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </button>
                <button className="flex items-center justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50">
                  <svg
                    className="h-5 w-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default Login;
