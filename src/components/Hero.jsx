import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "./icons.jsx";

const LOGO_GLOW = "rgba(255,194,26,0.55)"; // gold halo behind the logo

/** Floating brand logo that gently drifts/rotates on a loop. */
function FloatingMark({ image, className, delay = 0, duration = 6 }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={`absolute ${className}`}
      animate={reduce ? {} : { y: [0, -18, 0], rotate: [-2, 2, -2] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <img
        src={image}
        alt="logo"
        className="aspect-square w-full rounded-full border border-white/10 object-cover"
        style={{ boxShadow: `0 30px 110px -16px ${LOGO_GLOW}` }}
      />
    </motion.div>
  );
}

/** Rising smoke puffs behind the logo (CSS-animated; off for reduced motion). */
function Smoke() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  const puffs = [0, 1, 2, 3, 4, 5, 6];
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[88%] -translate-x-1/2 -translate-y-1/2">
      {puffs.map((i) => (
        <span
          key={i}
          className="smoke-puff"
          style={{
            left: `${8 + i * 13}%`,
            width: `${52 + (i % 3) * 20}px`,
            height: `${52 + (i % 3) * 20}px`,
            animationDelay: `${(i * 0.85).toFixed(2)}s`,
            animationDuration: `${7.5 + (i % 3)}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center overflow-hidden px-4 pb-20 pt-32 sm:px-6"
    >
      {/* hero backdrop – swap this gradient for a dimmed photo/<video> */}
      <div className="absolute left-1/2 top-28 bottom-16 -z-[1] w-[calc(100%-2rem)] max-w-7xl -translate-x-1/2 overflow-hidden rounded-[2.5rem] border border-white/5 sm:w-[calc(100%-3rem)]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, rgba(255,194,26,0.10), transparent 45%), radial-gradient(circle at 78% 40%, rgba(224,36,28,0.14), transparent 55%), #0a0806",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
        {/* ---- left: copy ---- */}
        <div className="order-2 lg:order-1 lg:pl-12 xl:pl-20">
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="display text-[18vw] text-white sm:text-8xl lg:text-[7rem]"
          >
            <span className="text-outline block">PREMIUM</span>
            <span className="block text-neon text-glow">SELEZIONI</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col gap-3 sm:flex-row"
          >
            <a
              href="#drops"
              className="btn-glow group flex w-fit items-center justify-center gap-2 rounded-full bg-neon px-8 py-4 text-sm font-extrabold uppercase tracking-[0.2em] text-[#1a1206] transition-transform hover:scale-[1.03] active:scale-95"
            >
              Visualizza il catalogo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </motion.div>
        </div>

        {/* ---- right: smoke + floating logo + accents ---- */}
        <div className="relative order-1 flex h-[46vh] min-h-[340px] items-center justify-center lg:order-2 lg:h-[62vh]">
          {/* centered cluster so the accents hug the logo */}
          <div className="relative mx-auto h-full w-full max-w-[440px]">
            {/* rising smoke behind the logo */}
            <Smoke />
            {/* the brand logo as the centerpiece */}
            <FloatingMark
              image="/logo.jpg"
              className="left-1/2 top-1/2 w-[78%] max-w-[340px] -translate-x-1/2 -translate-y-1/2"
              delay={0}
              duration={7}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
