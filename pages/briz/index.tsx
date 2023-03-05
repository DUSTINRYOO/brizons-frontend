import type { NextPage } from "next";
import { gql, useQuery, useReactiveVar } from "@apollo/client";
import { isLoggedInVar } from "@/libs/apolloClient";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { LOCALSTORAGE_TOKEN } from "@/src/constants";
import Layout from "@/components/layout";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/button";
import Input from "@/components/input";
import { useForm } from "react-hook-form";
import { CreateAccountInput } from "@/src/gql/graphql";
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
  description?: string;
  metatags?: string;
  thumbUrl: string;
}
const Briz: NextPage = () => {
  const baseGrid = [...Array(24 * 14)];
  const router = useRouter();
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [grid, setGrid] = useState<IGrid>({
    colStart: -1,
    colEnd: -1,
    rowStart: -1,
    rowEnd: -1,
  });

  const [dragged, setDragged] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBrizForm>({
    mode: "onChange",
  });
  const onOverlayClick = () => {
    setGrid({
      colStart: -1,
      colEnd: -1,
      rowStart: -1,
      rowEnd: -1,
    });
    setDragged(false);
  };
  const onSubmit = (data: any) => {
    setDragged(false);
    console.log("Submit");
  };
  const { data, loading, error } = useQuery<meQuery>(ME_QUERY);
  useEffect(() => {
    const localToken = localStorage.getItem(LOCALSTORAGE_TOKEN);
    if (localToken === ("" || null) && !isLoggedIn) router.replace("/");
  }, [isLoggedIn]);
  if (loading) {
    return <div>Loading</div>;
  }

  return (
    <Layout title={`${data?.me.username}'s Briz`} hasTabBar>
      <div className="h-auto w-full py-20 ">
        <div className=" relative mx-auto mt-0 h-auto max-w-6xl px-4">
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
                onDragEnter={() => {}}
                key={i}
                className={cls(
                  `h-full w-full rounded-md bg-red-500 opacity-10 transition-all hover:opacity-40 active:scale-100  active:bg-red-500 active:opacity-60`,
                  i % 24 <= grid!.colEnd! % 24 &&
                    i % 24 >= grid!.colStart! % 24 &&
                    Math.floor(i / 24) <= grid!.rowEnd! &&
                    Math.floor(i / 24) >= grid!.rowStart!
                    ? "scale-100 opacity-60"
                    : "",
                  grid!.colStart! > grid!.colEnd!
                    ? i % 24 >= grid!.colEnd! % 24 &&
                      i % 24 <= grid!.colStart! % 24 &&
                      Math.floor(i / 24) <= grid!.rowEnd! &&
                      Math.floor(i / 24) >= grid!.rowStart!
                      ? "scale-100 opacity-60"
                      : ""
                    : "",
                  grid!.rowStart! > grid!.rowEnd!
                    ? i % 24 <= grid!.colEnd! % 24 &&
                      i % 24 >= grid!.colStart! % 24 &&
                      Math.floor(i / 24) >= grid!.rowEnd! &&
                      Math.floor(i / 24) <= grid!.rowStart!
                      ? "scale-100 opacity-60"
                      : ""
                    : "",
                  grid!.rowStart! > grid!.rowEnd! &&
                    grid!.colStart! > grid!.colEnd!
                    ? i % 24 >= grid!.colEnd! % 24 &&
                      i % 24 <= grid!.colStart! % 24 &&
                      Math.floor(i / 24) >= grid!.rowEnd! &&
                      Math.floor(i / 24) <= grid!.rowStart!
                      ? "scale-100 opacity-60"
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
                      name="thumbUrl"
                      type="file"
                      required
                      register={register("thumbUrl")}
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
