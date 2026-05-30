import Reveal from "./ui/Reveal.jsx";
import TricolorBar from "./ui/TricolorBar.jsx";
import { Telegram } from "./icons.jsx";

export default function FinalCTA({ telegram = "https://t.me" }) {
  return (
    <section id="cta" className="px-4 py-24 sm:px-6">
      <Reveal className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 px-6 py-20 text-center sm:py-28">
          {/* hero-card aesthetic: gradient base + dark overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(115deg, rgba(255,194,26,0.10), transparent 45%), radial-gradient(circle at 78% 40%, rgba(224,36,28,0.14), transparent 55%), #0a0806",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />

          <div className="relative">
            <img
              src="/logo.jpg"
              alt="Smoke Gas Bomb"
              className="mx-auto mb-7 h-24 w-24 rounded-full border border-[#ffc21a]/40 object-cover shadow-[0_0_50px_-8px_rgba(255,194,26,0.6)]"
            />
            <TricolorBar className="mx-auto mb-8" />
            <h2 className="display text-4xl text-white text-glow sm:text-6xl lg:text-7xl">
              SERIETÀ E RISPETTO SONO I NOSTRI PRINCIPI
            </h2>
            <p className="mt-4 text-sm uppercase tracking-[0.28em] text-zinc-400">
Per contattarci premere il bottone sottostante
            </p>

            <a
              href={telegram}
              target="_blank"
              rel="noreferrer"
              className="group mx-auto mt-10 flex w-fit items-center gap-2.5 rounded-full bg-[#229ED9] px-10 py-4.5 text-sm font-extrabold uppercase tracking-[0.2em] text-white shadow-[0_12px_40px_-12px_rgba(34,158,217,0.85)] ring-1 ring-inset ring-white/20 transition-all hover:scale-[1.03] hover:bg-[#1b90c9] active:scale-95"
            >
              <Telegram className="h-4 w-4" />
              Unisciti Ora
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
