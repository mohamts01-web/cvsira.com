import clsx from "clsx"
import { motion, useReducedMotion } from "framer-motion"

interface BlurInTextProps {
  text?: string
  className?: string
}

export const BlurInText: React.FC<BlurInTextProps> = ({
  text = "",
  className = "",
}) => {
  const reduced=useReducedMotion();
  const variants1 = {
    hidden: { filter: reduced?"none":"blur(10px)", opacity: 0 },
    visible: { filter: "blur(0px)", opacity: 1 },
  }

  return (
    <motion.span
      initial={reduced?false:"hidden"}
      whileInView="visible" viewport={{once:true}}
      transition={{ duration: 1 }}
      variants={variants1}
      className={clsx("eldora-blur-in",className)}
    >
      {text}
    </motion.span>
  )
}
