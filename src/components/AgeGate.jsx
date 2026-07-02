import { motion } from "motion/react";
import TricolorBar from "./ui/TricolorBar.jsx";

/**
 * Full-screen age-gate / entry modal shown on first load.
 * "ENTER" dismisses (persisted in localStorage); "EXIT" sends away.
 */
export default function AgeGate({ onEnter }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* blurred backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="glass relative w-full max-w-md rounded-3xl p-8 text-center sm:p-10"
      >
        <img
          src="/logo.jpg"
          alt="Smoke Gas Bomb"
          className="mx-auto mb-6 h-28 w-28 rounded-full border border-[#ffc21a]/40 object-cover shadow-[0_0_50px_-8px_rgba(255,194,26,0.6)]"
        />
        <TricolorBar className="mx-auto mb-8" />

        <p className="eyebrow mb-4">Membri 18+</p>
        <h2 className="display text-5xl text-white sm:text-6xl">
          ACCESSO
          <br />
          <span className="text-neon text-glow">RISERVATO</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-zinc-400">
          Questa è una collezione su invito. Verifica di essere maggiorenne per
          accedere allo shop.
        </p>

        <div className="mt-9 flex flex-col gap-3">
          <button
            onClick={onEnter}
            className="btn-glow group flex items-center justify-center gap-2 rounded-full bg-neon px-8 py-4 text-sm font-extrabold uppercase tracking-[0.2em] text-[#1a1206] transition-transform hover:scale-[1.02] active:scale-95"
          >
            Entra nello Shop
          </button>
          <a
            href="https://www.google.com"
            className="rounded-full border border-blood/40 bg-blood/10 px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-blood transition-colors hover:border-blood hover:bg-blood hover:text-white"
          >
            Esci
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
