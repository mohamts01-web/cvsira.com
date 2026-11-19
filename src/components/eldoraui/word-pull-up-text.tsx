import clsx from "clsx"
import { motion, useReducedMotion } from "framer-motion"

interface WordPullUpTextProps {
  text?: string
  className?: string
}

export const WordPullUpText: React.FC<WordPullUpTextProps> = ({
  text = "",
  className = "",
}) => {
  const reduced=useReducedMotion();
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { y: reduced?0:20, opacity: reduced?1:0 },
    show: { y: 0, opacity: 1 },
  }

  return (
    <motion.span
      variants={container}
      initial={reduced?false:"hidden"}
      whileInView="show"
      viewport={{once:true}}
      className={clsx("eldora-word-pull",className)}
    >
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          variants={item}
          style={{ display: "inline-block", marginInlineEnd: ".22em" }}
        >
          {word === "" ? <span>&nbsp;</span> : word}{" "}
        </motion.span>
      ))}
    </motion.span>
  )
}
