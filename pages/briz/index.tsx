import Button from "@/components/button";
import type { NextPage } from "next";
import Link from "next/link";
import bg from "public/homebg.png";
import exam1 from "public/exam1.png";
import exam2 from "public/exam2.png";
import exam3 from "public/exam3.png";
import exam4 from "public/exam4.png";
import Image from "next/image";
import Homepage from "@/components/homepage";
import { gql, useQuery, useReactiveVar } from "@apollo/client";
import { isLoggedInVar } from "@/libs/apolloClient";
import { useRouter } from "next/router";

import { useEffect } from "react";
import { LOCALSTORAGE_TOKEN } from "@/src/constants";
import Layout from "@/components/layout";

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

const Briz: NextPage = () => {
  const router = useRouter();
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const { data, loading, error } = useQuery<meQuery>(ME_QUERY);
  useEffect(() => {
    const localToken = localStorage.getItem(LOCALSTORAGE_TOKEN);
    if (localToken === ("" || null) && !isLoggedIn) router.replace("/");
  }, [isLoggedIn]);
  if (loading) {
    return <div>Loading</div>;
  }
  const baseGrid = [...Array(24 * 14)];

  return (
    <Layout title={`${data?.me.username}'s Briz`} hasTabBar>
      <div className="h-auto w-full py-20">
        <div className=" relative mx-auto mt-0 h-auto max-w-6xl px-4">
          <div className=" absolute grid aspect-video w-full grid-cols-[repeat(24,_minmax(0,_1fr))] grid-rows-[repeat(14,_minmax(0,_1fr))]">
            {baseGrid.map((id, i) => (
              <div
                onMouseDown={() => {
                  console.log("Mouse Down", i);
                }}
                onMouseEnter={() => {
                  console.log("Mount Enter", i);
                }}
                onMouseUp={() => {
                  console.log("Mount Up", i);
                }}
                key={i + 1 + ""}
                className={`z-[100] col-start-[${
                  (i % 24) + 1 + ""
                }] row-start-[${
                  Math.floor(i / 24 + 1) + ""
                }] active:scale-20 h-full w-full rounded-md bg-gray-500 opacity-20 transition-all hover:opacity-50 active:scale-50 active:rounded-full active:bg-gray-500 active:opacity-100`}
              ></div>
            ))}
          </div>
          <div className="absolute grid aspect-video w-full grid-cols-[repeat(24,_minmax(0,_1fr))] grid-rows-[repeat(14,_minmax(0,_1fr))]">
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
      </div>
    </Layout>
  );
};

export default Briz;
