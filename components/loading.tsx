import { motion } from "framer-motion";
import React from "react";

const ContainerVariants = {
  initial: {
    transition: {
      staggerChildren: 0.4,
    },
  },
  animate: {
    transition: {
      staggerChildren: 0.4,
    },
  },
};

const DotVariants = {
  initial: {
    y: "-35%",
  },
  animate: {
    y: ["-35%", "35%", "-35%"],
  },
};

const DotTransition = {
  duration: 1.2,
  repeat: Infinity,
  ease: "easeInOut",
};
export default function ThreeDotsWave() {
  return (
    <motion.div
      className="flex h-full w-full items-center justify-evenly"
      variants={ContainerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.span
        className=" block aspect-square w-1/5 max-w-[24px] rounded-full bg-red-400"
        variants={DotVariants}
        transition={DotTransition}
      />
      <motion.span
        className=" block aspect-square w-1/5 max-w-[24px] rounded-full bg-red-400"
        variants={DotVariants}
        transition={DotTransition}
      />
      <motion.span
        className=" block aspect-square w-1/5 max-w-[24px] rounded-full bg-red-400"
        variants={DotVariants}
        transition={DotTransition}
      />
    </motion.div>
  );
}
