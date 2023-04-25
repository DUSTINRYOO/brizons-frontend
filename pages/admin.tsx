import Layout from "@/components/layout";
import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import Button from "../components/button";
import Input from "../components/input";

import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { gql, useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { authTokenVar, isLoggedInVar } from "@/libs/apolloClient";
import { LOCALSTORAGE_TOKEN } from "@/src/constants";
import { useEffect } from "react";

import { motion } from "framer-motion";
import {
  DeleteAccountOutput,
  LoginInput,
  LoginOutput,
} from "@/src/gql/graphql";

const ME_QUERY = gql`
  query meQuery {
    me {
      id
      email
      username
      verified
      profileImg
      biography
      name
    }
  }
`;

const DELETE_ACCOUNT_MUTATION = gql`
  mutation deleteAccountMutation($deleteAccountInput: DeleteAccountInput!) {
    deleteAccount(deleteAccountInput: $deleteAccountInput) {
      ok
      error
    }
  }
`;

type meQueryList = {
  id: string;
  email: string;
  username: string;
  verified: boolean;
  name: string;
  biography: string;
  profileImg: string;
};

interface meQuery {
  me: meQueryList;
}

type deleteAccountForm = {
  username: string;
};

interface deleteAccountMutation {
  deleteAccount: DeleteAccountOutput;
}

const Admin: NextPage = () => {
  const router = useRouter();
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const authToken = useReactiveVar(authTokenVar);

  const {
    data: meData,
    loading: meLoading,
    error: meError,
    refetch: meRefetch,
  } = useQuery<meQuery>(ME_QUERY);

  const [
    deleteAccountMutation,
    {
      data: deleteAccountMutationResult,
      loading: deleteAccountMutationLoading,
      error: deleteAccountMutationError,
    },
  ] = useMutation<deleteAccountMutation>(DELETE_ACCOUNT_MUTATION, {
    onCompleted(data: deleteAccountMutation) {
      const {
        deleteAccount: { ok, error },
      } = data;
      return console.log("Deleted");
    },
  });

  const {
    register,
    handleSubmit,
    resetField,
    reset,
    formState: { errors },
  } = useForm<deleteAccountForm>({
    mode: "onChange",
  });

  const onSubmit = (data: deleteAccountForm) => {
    if (!meLoading) {
      deleteAccountMutation({
        variables: {
          loginInput: {
            username: data.username.toLowerCase(),
          },
        },
      });
    }
  };

  useEffect(() => {
    const localToken = localStorage.getItem(LOCALSTORAGE_TOKEN);
    if (localToken === ("" || null) && !isLoggedIn) router.replace("/");
  }, [isLoggedIn]);
  if (meLoading) {
    return (
      <span className="fixed top-[15vw] w-full   py-2 text-center text-2xl font-extrabold text-gray-300">
        Loading
      </span>
    );
  }

  return (
    <Layout title="Log in" hasTabBar>
      <div className="absolute left-0 right-0 -z-10 mx-auto h-screen w-full max-w-7xl opacity-50 ">
        <Image
          priority
          src={
            "https://dustinbrizonsbucketlfg.s3.amazonaws.com/1681967827187homebg.jpeg"
          }
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
          <h3 className="mt-4 text-center text-3xl font-bold">Administrator</h3>
          <h3 className="text-md text-center font-bold text-gray-700">
            Delete Account
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
              <Button text={"Delete"} />
            </form>

            <motion.span
              className="absolute left-0 right-0 mx-auto w-[22rem]  text-center font-semibold text-red-500"
              layout
            >
              <span className="block">
                {!deleteAccountMutationResult?.deleteAccount.ok
                  ? deleteAccountMutationResult?.deleteAccount.error
                  : null}
              </span>
            </motion.span>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default Admin;
