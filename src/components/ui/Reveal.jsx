import { motion, useReducedMotion } from "motion/react";

/**
 * Scroll-reveal wrapper: fade + translate-up as it enters the viewport.
 * Honors prefers-reduced-motion.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 26,
  once = true,
  className = "",
}) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
