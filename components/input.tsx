import { cls } from "@/libs/utils";
import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import Button from "./button";

interface InputProps {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  required: boolean;
  tab?: boolean;
  [key: string]: any;
}

export default function Input({
  label,
  name,
  register,
  type,
  placeholder,
  tab,
  required,
  ...rest
}: InputProps) {
  return (
    <div>
      <label
        className={cls(
          "text-md mb-1 block font-semibold text-gray-700",
          tab ? "hidden" : "",
          type === "color" ? "mr-3" : ""
        )}
        htmlFor={name}
      >
        {label}
      </label>
      <div
        className={cls(
          "relative flex items-center  rounded-md shadow-sm",
          tab && type === "file"
            ? "aspect-video w-full items-center justify-center rounded-xl bg-red-50 transition-transform  hover:bg-red-100 active:scale-105 active:bg-red-200"
            : ""
        )}
      >
        {type === "textarea" ? (
          <textarea
            rows={4}
            id={name}
            required={required}
            placeholder={placeholder}
            {...register}
            className={cls(
              "h-20 min-h-[2.6rem] w-full appearance-none rounded-xl border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500"
            )}
          ></textarea>
        ) : (
          <input
            {...rest}
            id={name}
            required={required}
            type={type}
            placeholder={placeholder}
            {...register}
            className={cls(
              "w-full appearance-none rounded-xl border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500",
              tab && type === "file"
                ? "absolute top-0 aspect-video opacity-0"
                : "",
              tab
                ? " aspect-video border-none bg-red-50 text-center text-xl font-semibold transition-all placeholder:font-semibold placeholder:text-gray-700 hover:bg-red-100 "
                : "",
              type === "color" ? "h-12 w-full bg-white px-2" : "",
              type === "range" ? "range h-6  accent-black" : ""
            )}
          />
        )}
        {tab && type === "file" ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="50"
            height="50"
            viewBox="00 00 500 500"
          >
            <path d="M246.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 109.3V320c0 17.7 14.3 32 32 32s32-14.3 32-32V109.3l73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64c0 53 43 96 96 96H352c53 0 96-43 96-96V352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V352z" />
          </svg>
        ) : null}
      </div>
    </div>
  );
}
