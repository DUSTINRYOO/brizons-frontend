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
                key={i + 1 + ""}
                className={`z-[-100] col-start-[${
                  (i % 24) + 1 + ""
                }] row-start-[${
                  Math.floor(i / 24 + 1) + ""
                }] h-full w-full rounded-sm bg-gray-400 opacity-50`}
              ></div>
            ))}
          </div>
          <div className="absolute grid aspect-video w-full grid-cols-[repeat(24,_minmax(0,_1fr))] grid-rows-[repeat(14,_minmax(0,_1fr))]">
            <div className="col-start-[2] col-end-[8] row-start-[3] row-end-[6] bg-slate-700 opacity-50"></div>
            <div className="col-start-[6] col-end-[16] row-start-[4] row-end-[8] bg-yellow-700 opacity-50"></div>{" "}
            <div className="col-start-[12] col-end-[22] row-start-[6] row-end-[12] bg-red-700 opacity-50"></div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Briz;
