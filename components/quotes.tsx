import { motion } from "framer-motion";
import React from "react";

const ContainerVariants = {
  initial: {
    transition: {
      staggerChildren: 6,
    },
  },
  animate: {
    transition: {
      staggerChildren: 6,
    },
  },
};

const QuoteVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: [0, 1, 1, 0, 0, 0],
  },
};

const QuoteTransition = {
  duration: 18,
  repeat: Infinity,
  ease: "easeInOut",
};
export default function Quotes() {
  return (
    <motion.div
      className="relative flex h-full w-full flex-col justify-center text-center"
      variants={ContainerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.span
        className="mb-6  block"
        variants={QuoteVariants}
        transition={QuoteTransition}
      >
        “ It’s not about being the best. It’s about being better than you were
        yesterday. ”
      </motion.span>
      <motion.span
        className="mb-6 block"
        variants={QuoteVariants}
        transition={QuoteTransition}
      >
        “ It does not matter how slowly you go as long as you do not stop. ” -
        Confucius -
      </motion.span>
      <motion.span
        className="block"
        variants={QuoteVariants}
        transition={QuoteTransition}
      >
        "It’s your place in the world. it’s your life. Go on and do all you can
        with it, and make it the life you want to live." – Mae Jemison -
      </motion.span>
    </motion.div>
  );
}
