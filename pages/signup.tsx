import Layout from "@/components/layout";
import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import Button from "../components/button";
import Input from "../components/input";
import bg from "public/homebg.png";
import { gql, useMutation, useReactiveVar } from "@apollo/client";
import { useForm } from "react-hook-form";

import { useRouter } from "next/router";
import { useEffect } from "react";
import { isLoggedInVar } from "@/libs/apolloClient";
import { LOCALSTORAGE_TOKEN } from "@/src/constants";
import { CreateAccountInput, CreateAccountOutput } from "@/src/gql/graphql";
import { AnimatePresence, motion } from "framer-motion";

const CREATE_ACCOUNT_MUTATION = gql`
  mutation createAccountMutation($createAccountInput: CreateAccountInput!) {
    createAccount(input: $createAccountInput) {
      ok
      error
    }
  }
`;

interface CreateAccountForm {
  email: string;
  password: string;
  username: string;
}

interface createAccountMutation {
  createAccount: CreateAccountOutput;
}

const Signup: NextPage = () => {
  const router = useRouter();
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const onCompleted = (data: createAccountMutation) => {
    const {
      createAccount: { ok, error },
    } = data;
    if (ok) {
      router.push("/login");
    }
  };
  const [
    createAccountMutation,
    {
      data: createAccountMutationResult,
      loading,
      error: createAccountMutationError,
    },
  ] = useMutation<createAccountMutation>(CREATE_ACCOUNT_MUTATION, {
    onCompleted,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAccountForm>({
    mode: "onChange",
  });

  const onSubmit = (data: CreateAccountInput) => {
    if (!loading) {
      createAccountMutation({
        variables: {
          createAccountInput: {
            email: data.email,
            password: data.password,
            username: data.username.toLowerCase(),
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
    <Layout title="Sign up" hasTabBar>
      <div className=" absolute -z-10 h-screen w-screen overflow-hidden bg-black opacity-90">
        <div className="relative mx-auto h-screen w-full min-w-[80rem] max-w-[80rem] bg-slate-600">
          <Image src={bg} alt="Background" fill />
        </div>
      </div>
      <div className="h-screen w-full px-4 py-20">
        <motion.div className="mx-auto mt-14 max-w-lg rounded-3xl bg-white p-10 pb-14 shadow-lg">
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
              className="mx-auto mt-6 flex w-80 flex-col space-y-4  max-sm:w-72 "
              onSubmit={handleSubmit(onSubmit)}
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
                minlength="8"
                register={register("password")}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                required
                register={register("email", {
                  pattern:
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                })}
              />

              <Button text={"Create an Account"} />
            </form>
            <Link legacyBehavior href="/login">
              <a className="text-md mx-auto mt-4 mb-2  flex w-fit items-center justify-center border-b-2 border-gray-500 font-bold text-gray-700">
                <span>Already have an account?</span>
              </a>
            </Link>
            <motion.span
              className="absolute left-0 right-0 mx-auto w-[22rem] rounded-xl text-center font-semibold text-gray-700"
              layout
            >
              <span className="block">
                {errors.email?.type === "pattern"
                  ? "Please enter a valid email."
                  : null}
              </span>
              <span className="block">
                {!createAccountMutationResult?.createAccount.ok
                  ? createAccountMutationResult?.createAccount.error
                  : null}
              </span>
            </motion.span>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};
export default Signup;
