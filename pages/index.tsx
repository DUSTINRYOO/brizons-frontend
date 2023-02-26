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

const Home: NextPage = () => {
  return (
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
  );
};

export default Home;
