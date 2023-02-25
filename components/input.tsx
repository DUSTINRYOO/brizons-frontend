import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface InputProps {
  label: string;
  name: string;
  type: string;
  register: UseFormRegisterReturn;
  required: boolean;
}

export default function Input({
  label,
  name,
  register,
  type,
  required,
}: InputProps) {
  return (
    <div>
      <label
        className="text-md mb-1 block font-semibold text-gray-700"
        htmlFor={name}
      >
        {label}
      </label>
      <div className="relative flex items-center  rounded-md shadow-sm">
        <input
          id={name}
          required={required}
          type={type}
          {...register}
          className="w-full appearance-none rounded-xl border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500"
        />
      </div>
    </div>
  );
}
