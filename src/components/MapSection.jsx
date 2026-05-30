import Reveal from "./ui/Reveal.jsx";


/** Dedicated section showcasing the Italy map (image only). */
export default function MapSection() {
  return (
    <section id="mappa" className="relative px-4 py-24 sm:px-6">
      <Reveal className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 px-6 py-16 text-center sm:py-20">
          {/* hero-card aesthetic: gradient base + dark overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(115deg, rgba(255,194,26,0.10), transparent 45%), radial-gradient(circle at 78% 40%, rgba(224,36,28,0.14), transparent 55%), #0a0806",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />

          <div className="relative flex justify-center">
            <img
              src="/italy.png"
              alt="Mappa Italia"
              loading="lazy"
              className="w-[85%] max-w-[560px] drop-shadow-[0_20px_60px_rgba(255,194,26,0.25)]"
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
