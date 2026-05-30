import { motion } from "motion/react";
import { Telegram } from "./icons.jsx";

/** Sticky, pill-shaped floating top navigation bar. */
export default function Nav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6"
    >
      <nav className="glass mx-auto flex max-w-7xl items-center justify-between rounded-full py-2.5 pl-6 pr-2.5">
        {/* logo */}
        <a href="#top" className="group flex items-center">
          <img
            src="/logo.jpg"
            alt="Logo"
            className="h-10 w-10 rounded-full border border-[#ffc21a]/40 object-cover shadow-[0_0_22px_-6px_rgba(255,194,26,0.7)] transition-transform group-hover:scale-105"
          />
        </a>

        {/* primary CTA */}
        <a
          href="https://t.me"
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-2 rounded-full bg-[#229ED9] px-5 py-2.5 text-xs font-extrabold uppercase tracking-[0.2em] text-white shadow-[0_8px_28px_-8px_rgba(34,158,217,0.75)] ring-1 ring-inset ring-white/20 transition-all hover:scale-[1.03] hover:bg-[#1b90c9] hover:shadow-[0_10px_34px_-8px_rgba(34,158,217,0.95)]"
        >
          <Telegram className="h-4 w-4" />
          Telegram
        </a>
      </nav>
    </motion.header>
  );
}
