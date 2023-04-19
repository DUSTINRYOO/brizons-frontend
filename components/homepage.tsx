import { cls } from "@/libs/utils";
import Image from "next/image";
import React from "react";
import exam1 from "public/exam1.png";
import exam2 from "public/exam2.png";
import exam3 from "public/exam3.png";
import exam4 from "public/exam4.png";

interface HomepageProps {
  bgColor?: string;
  textColor?: string;
  pageTitle: string;
  pageDescription: string;
  children: React.ReactNode;
  reverse?: boolean;
}

export default function Homepage({
  bgColor,
  textColor = "text-gray-100",
  pageTitle,
  pageDescription,
  children,
  reverse,
}: HomepageProps) {
  return (
    <div
      className={cls(
        `left-0 right-0 mx-auto h-auto w-full max-w-7xl ${bgColor} `
      )}
    >
      <div className="mx-auto h-auto max-w-6xl px-10 py-14 ">
        <div className=" grid grid-cols-1 items-center gap-8 sm:grid-cols-2 lg:grid-cols-2 ">
          {!reverse ? (
            <>
              <div className="border-y-2 py-8">
                <h3
                  className={cls(`text-center text-6xl font-bold ${textColor}`)}
                >
                  {pageTitle}
                </h3>
                <h3
                  className={cls(
                    `mt-6 text-center text-2xl font-bold ${textColor}`
                  )}
                >
                  {pageDescription}
                </h3>
              </div>
              <div>{children}</div>
            </>
          ) : (
            <>
              <div>{children}</div>
              <div className="border-y-2 py-8">
                <h3
                  className={cls(`text-center text-6xl font-bold ${textColor}`)}
                >
                  {pageTitle}
                </h3>
                <h3
                  className={cls(
                    `mt-4 text-center text-2xl font-bold ${textColor}`
                  )}
                >
                  {pageDescription}
                </h3>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
