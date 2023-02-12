import { cls } from "../libs/utils";

interface ButtonProps {
  large?: boolean;
  text: string;
  [key: string]: any;
}

export default function Button({
  large = false,
  onClick,
  text,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={cls(
        "w-full rounded-xl border border-transparent  bg-red-500 px-4 font-medium text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
        large ? "py-3 text-lg" : "py-2 text-base "
      )}
    >
      {text}
    </button>
  );
}
