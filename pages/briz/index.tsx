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
  return (
    <Layout title={`${data?.me.username}'s Briz`} hasTabBar>
      <div className="h-auto w-full py-20">
        <div className="mx-auto mt-0 h-auto max-w-6xl bg-slate-300 p-10 pb-14 ">
          <div className="grid auto-rows-auto grid-cols-[repeat(12,_minmax(0,_1fr))] items-center  sm:grid-cols-[repeat(16,_minmax(0,_1fr))] lg:grid-cols-[repeat(24,_minmax(0,_1fr))]">
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
      </div>
    </Layout>
  );
};

export default Briz;
