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
  const [grid, setGrid] = useState<IGrid>();
  const [dragging, setDragging] = useState<boolean>(false);
  const [dragged, setDragged] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBrizForm>({
    mode: "onChange",
  });
  const onOverlayClick = () => {
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
          <div className="absolute left-1/2 z-[100] grid aspect-video w-full -translate-x-1/2 grid-cols-[repeat(24,_minmax(0,_1fr))] grid-rows-[repeat(14,_minmax(0,_1fr))] ">
            {baseGrid.map((id, i) => (
              <div
                draggable
                onDragStart={() => {
                  setDragging(true);
                  setGrid({
                    ...grid,
                    colStart: (i % 24) + 1,
                    rowStart: Math.floor(i / 24 + 1),
                  });
                }}
                onDragOver={() => {
                  setGrid({
                    ...grid,
                    colEnd: (i % 24) + 1,
                    rowEnd: Math.floor(i / 24 + 1),
                  });
                }}
                onDragEnd={() => {
                  setDragging(false);
                  setDragged(true);
                  console.log(grid);
                }}
                key={i + 1 + ""}
                className={`col-start-[${(i % 24) + 1 + ""}] row-start-[${
                  Math.floor(i / 24 + 1) + ""
                }] active:scale-20 h-full w-full rounded-md bg-gray-500 opacity-20 transition-all hover:opacity-50 active:scale-105  active:bg-gray-500 active:opacity-100`}
              ></div>
            ))}
          </div>
          <div className="absolute left-1/2 z-[90] grid aspect-video w-full -translate-x-1/2 grid-cols-[repeat(24,_minmax(0,_1fr))] grid-rows-[repeat(14,_minmax(0,_1fr))]">
            <div className="col-start-[2] col-end-[8] row-start-[3] row-end-[6] bg-slate-700 text-center text-4xl font-semibold  text-black opacity-50">
              Let's
            </div>
            <div className="col-start-[6] col-end-[16] row-start-[4] row-end-[9] bg-yellow-700 text-center text-4xl font-semibold  text-black opacity-50">
              Get it!
            </div>{" "}
            <div className="col-start-[13] col-end-[23] row-start-[6] row-end-[13] bg-red-700 text-center text-4xl font-semibold  text-black opacity-50">
              Dustin!
            </div>
          </div>
        </div>
        <AnimatePresence>
          {dragged ? (
            <>
              <motion.div
                className="fixed top-0 left-0 z-[110] h-screen w-full bg-gray-500 opacity-0"
                onClick={onOverlayClick}
                exit={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
              ></motion.div>
              <motion.div
                className=" absolute  left-1/2 z-[115] mt-4 max-w-lg -translate-x-1/2 rounded-3xl bg-white p-6 pb-14 opacity-0 shadow-lg"
                exit={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-center text-3xl font-bold">New Briz</h3>
                <h3 className="text-md text-center font-bold text-gray-700">
                  Broaden your horizons
                </h3>
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
                      type="text"
                      placeholder="Write a description"
                      textarea
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
