import type { NextPage } from "next";
import { gql, useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { isLoggedInVar } from "@/libs/apolloClient";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { LOCALSTORAGE_TOKEN } from "@/src/constants";
import Layout from "@/components/layout";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/button";
import Input from "@/components/input";
import { useForm } from "react-hook-form";
import { CreateBrizOutput } from "@/src/gql/graphql";
import { cls } from "@/libs/utils";

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
const CREATE_BRIZ_MUTATION = gql`
  mutation createBrizMutation($createBrizInput: CreateBrizInput!) {
    createBriz(createBrizInput: $createBrizInput) {
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
};

interface meQuery {
  me: meQueryList;
}
interface IGrid {
  colStart?: number;
  colEnd?: number;
  rowStart?: number;
  rowEnd?: number;
}
interface CreateBrizForm {
  title: string;
  description: string;
  metatags: string;
  coverImg: string;
  parentBrizId?: number;
}
interface createBrizMutation {
  createBriz: CreateBrizOutput;
}

const Briz: NextPage = () => {
  const baseGrid = [...Array(24 * 14)];
  const router = useRouter();
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [grid, setGrid] = useState<IGrid>({});
  const [imageUrl, setImageUrl] = useState("");
  const { data, loading, error } = useQuery<meQuery>(ME_QUERY);
  const [dragged, setDragged] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBrizForm>({
    mode: "onChange",
  });
  const onOverlayClick = () => {
    setGrid({});
    setDragged(false);
  };

  const onCompleted = (data: createBrizMutation) => {
    const {
      createBriz: { ok, error },
    } = data;
    console.log(error);
    return console.log(ok);
  };

  const [
    createBrizMutation,
    {
      data: createBrizMutationResult,
      loading: createBrizMutationLoading,
      error: createBrizMutationError,
    },
  ] = useMutation<createBrizMutation>(CREATE_BRIZ_MUTATION, {
    onCompleted,
  });
  const onSubmit = async (data: CreateBrizForm) => {
    setGrid({});
    setDragged(false);
    const actualFile = data.coverImg[0];
    const formBody = new FormData();
    formBody.append("file", actualFile);
    const { fileUrl: coverImg } = await (
      await fetch("http://localhost:4000/uploads", {
        method: "POST",
        body: formBody,
      })
    ).json();
    setImageUrl(coverImg);
    if (!loading) {
      createBrizMutation({
        variables: {
          createBrizInput: {
            title: data.title,
            description: data.description,
            metatags: data.metatags,
            coverImg: coverImg,
          },
        },
      });
    }
  };

  useEffect(() => {
    const localToken = localStorage.getItem(LOCALSTORAGE_TOKEN);
    if (localToken === ("" || null) && !isLoggedIn) router.replace("/");
  }, [isLoggedIn]);
  if (loading) {
    return <div>Loading</div>;
  }
  const open = true;
  return (
    <Layout title={`${data?.me.username}'s Briz`} hasTabBar>
      <div className="h-auto w-full py-20 ">
        <div className=" relative mx-auto mt-0 h-auto max-w-6xl px-4">
          <div className="fixed bottom-16 left-1/2 flex -translate-x-1/2 flex-row items-center justify-center rounded-2xl bg-gray-300 p-2">
            <button
              onClick={() => {
                console.log("Clicked Open AI");
              }}
              className={cls(
                "mx-2 flex aspect-square  cursor-pointer items-center justify-center rounded-2xl bg-red-300 p-2 shadow-xl transition-all hover:scale-105 hover:bg-red-400"
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="50"
                height="50"
                viewBox="-112 -40 580 580"
              >
                <path
                  d="M281.2 248.9C295.6 228.3 304 203.2 304 176c0-70.7-57.3-128-128-128S48 105.3 48 176c0 27.2 8.4 52.3 22.8 72.9c3.7 5.3 8.1 11.3 12.8 17.7l0 0c12.9 17.7 28.3 38.9 39.8 59.8c10.4 19 15.7 38.8 18.3 57.5H93c-2.2-12-5.9-23.7-11.8-34.5c-9.9-18-22.2-34.9-34.5-51.8l0 0 0 0c-5.2-7.1-10.4-14.2-15.4-21.4C11.6 247.9 0 213.3 0 176C0 78.8 78.8 0 176 0s176 78.8 176 176c0 37.3-11.6 71.9-31.4 100.3c-5 7.2-10.2 14.3-15.4 21.4l0 0 0 0c-12.3 16.8-24.6 33.7-34.5 51.8c-5.9 10.8-9.6 22.5-11.8 34.5H210.4c2.6-18.7 7.9-38.6 18.3-57.5c11.5-20.9 26.9-42.1 39.8-59.8l0 0 0 0 0 0c4.7-6.4 9-12.4 12.7-17.7zM176 128c-26.5 0-48 21.5-48 48c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-44.2 35.8-80 80-80c8.8 0 16 7.2 16 16s-7.2 16-16 16zm0 384c-44.2 0-80-35.8-80-80V416H256v16c0 44.2-35.8 80-80 80z"
                  fill="white"
                />
              </svg>
            </button>
            <button
              onClick={() => {
                console.log("Grid");
              }}
              className={cls(
                "mx-2 flex  aspect-square  cursor-pointer items-center justify-center rounded-2xl bg-red-300 p-2 shadow-xl transition-all hover:scale-105 hover:bg-red-400"
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="50"
                height="50"
                viewBox="0 -60 625 625"
              >
                <path
                  d="M115.2 0C84.7 0 58.5 21.5 52.5 51.4L1.3 307.4C-6.6 347 23.6 384 64 384H281v64H217c-17.7 0-32 14.3-32 32s14.3 32 32 32H409c17.7 0 32-14.3 32-32s-14.3-32-32-32H345V384H562c40.4 0 70.7-36.9 62.8-76.6l-51.2-256C567.5 21.5 541.3 0 510.8 0H115.2zM253.9 64H372.1l10.4 104h-139L253.9 64zM195.3 168H94.4L115.2 64h90.4L195.3 168zM84.8 216H190.5L180.1 320H64L84.8 216zm153.9 0H387.3l10.4 104-169.4 0 10.4-104zm196.8 0H541.2L562 320h-116L435.5 216zm96-48H430.7L420.3 64h90.4l31.4-6.3L510.8 64l20.8 104z"
                  fill="white"
                />
              </svg>
            </button>
          </div>
          <div className="absolute left-1/2 z-[101] grid aspect-video w-full -translate-x-1/2 grid-cols-[repeat(24,_minmax(0,_1fr))] grid-rows-[repeat(14,_minmax(0,_1fr))] ">
            {baseGrid.map((id, i) => (
              <div
                draggable
                onDragStart={() => {
                  setGrid({
                    ...grid,
                    colStart: i % 24,
                    rowStart: Math.floor(i / 24),
                  });
                }}
                onDragOver={() => {
                  setGrid({
                    ...grid,
                    colEnd: i % 24,
                    rowEnd: Math.floor(i / 24),
                  });
                }}
                onDragEnd={() => {
                  setDragged(true);
                }}
                key={i}
                className={cls(
                  `h-full w-full rounded-md bg-red-500 opacity-10 transition-all hover:opacity-40 active:scale-100  active:bg-red-500 active:opacity-60`,
                  i % 24 <= grid!.colEnd! % 24 &&
                    i % 24 >= grid!.colStart! % 24 &&
                    Math.floor(i / 24) <= grid!.rowEnd! &&
                    Math.floor(i / 24) >= grid!.rowStart!
                    ? "opacity-60"
                    : "",
                  grid!.colStart! > grid!.colEnd!
                    ? i % 24 >= grid!.colEnd! % 24 &&
                      i % 24 <= grid!.colStart! % 24 &&
                      Math.floor(i / 24) <= grid!.rowEnd! &&
                      Math.floor(i / 24) >= grid!.rowStart!
                      ? "opacity-60"
                      : ""
                    : "",
                  grid!.rowStart! > grid!.rowEnd!
                    ? i % 24 <= grid!.colEnd! % 24 &&
                      i % 24 >= grid!.colStart! % 24 &&
                      Math.floor(i / 24) >= grid!.rowEnd! &&
                      Math.floor(i / 24) <= grid!.rowStart!
                      ? "opacity-60"
                      : ""
                    : "",
                  grid!.rowStart! > grid!.rowEnd! &&
                    grid!.colStart! > grid!.colEnd!
                    ? i % 24 >= grid!.colEnd! % 24 &&
                      i % 24 <= grid!.colStart! % 24 &&
                      Math.floor(i / 24) >= grid!.rowEnd! &&
                      Math.floor(i / 24) <= grid!.rowStart!
                      ? "opacity-60"
                      : ""
                    : ""
                )}
              ></div>
            ))}
          </div>
          <div className="absolute left-1/2 z-[100] grid aspect-video w-full -translate-x-1/2 grid-cols-[repeat(24,_minmax(0,_1fr))] grid-rows-[repeat(14,_minmax(0,_1fr))]">
            <div className=" col-start-[2] col-end-[8] row-start-[3] row-end-[6] rounded-xl bg-blue-500 text-center text-6xl font-semibold  text-white">
              Let's
            </div>
            <div className=" col-start-[6] col-end-[16] row-start-[4] row-end-[8] rounded-xl bg-yellow-500 text-center text-6xl font-semibold text-white ">
              Get it!
            </div>
            <div className=" col-start-[13] col-end-[24] row-start-[6] row-end-[11] rounded-xl bg-red-500 text-center text-6xl font-semibold  text-white ">
              Dustin!
            </div>
          </div>
        </div>
        <AnimatePresence>
          {dragged ? (
            <>
              <motion.div
                className="fixed top-0 left-0 z-[102] h-screen w-full bg-gray-500 opacity-0"
                onClick={onOverlayClick}
                exit={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
              ></motion.div>
              <motion.div
                className=" absolute  left-1/2 z-[115] mt-[-10px] max-w-lg -translate-x-1/2 rounded-3xl bg-white p-6 pb-8 opacity-0 shadow-lg"
                exit={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-center text-3xl font-bold">New Briz</h3>
                <div className="mt-4 px-4 max-sm:px-0 ">
                  <form
                    className="mx-auto mt-6 flex w-80 flex-col space-y-4  max-sm:w-72 "
                    onSubmit={handleSubmit(onSubmit)}
                  >
                    <Input
                      label="Image"
                      name="coverImg"
                      type="file"
                      required
                      accept="image/*"
                      register={register("coverImg")}
                    />

                    <Input
                      label="Title"
                      name="title"
                      type="text"
                      placeholder="Title"
                      required
                      register={register("title")}
                    />
                    <Input
                      label="Description"
                      name="description"
                      type="textarea"
                      placeholder="Write a description"
                      required
                      register={register("description")}
                    />
                    <Input
                      label="Tags"
                      name="metatags"
                      type="text"
                      placeholder="#add #tags #about #this #briz"
                      required
                      register={register("metatags")}
                    />
                    <Button text={"Create a Briz"} />
                  </form>
                </div>
              </motion.div>
            </>
          ) : null}{" "}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Briz;
