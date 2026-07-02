import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp } from "./icons.jsx";

/** Fixed bottom-right "back to top" button; appears after scrolling. */
export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Torna su"
          className="btn-glow fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-xl bg-neon text-[#1a1206] transition-transform hover:scale-110 active:scale-95"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
