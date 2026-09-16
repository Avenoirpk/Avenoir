"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "solid" | "outline";
};

export default function ShimmerButton({ children, variant = "solid", className = "", ...rest }: Props) {
  const base =
    "relative overflow-hidden rounded-full px-8 py-3 font-medium text-sm transition-colors";
  const solid =
    "bg-navy text-cream bg-[linear-gradient(110deg,#12183f,45%,#2a3579,55%,#12183f)] bg-[length:200%_100%] hover:animate-shimmer";
  const outline = "border border-navy text-navy hover:bg-navy hover:text-cream";

  return (
    <motion.button
      className={`${base} ${variant === "solid" ? solid : outline} ${className}`}
      whileHover={{ scale: 1.035 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      {...(rest as HTMLMotionProps<"button">)}
    >
      {children}
    </motion.button>
  );
}
