import { useEffect, useRef, useState } from "react";
import Reveal from "./ui/Reveal.jsx";
import { loadProducts, formatPrice, formatGrams } from "../data/products.js";

function MediaPlaceholder() {
  return (
    <div className="grid h-full w-full place-items-center text-xs uppercase tracking-[0.2em] text-zinc-600">
      Nessun media
    </div>
  );
}

/** A product video that stays paused on load. The user taps the play
 *  button to start it with sound; native controls take over afterwards. */
function ProductVideo({ src, poster, cls, onError }) {
  const videoRef = useRef(null);
  const [started, setStarted] = useState(false);

  // Without an explicit poster, append a #t media fragment so the browser
  // seeks to (and paints) the first frame as the preview instead of black.
  const previewSrc = poster || src.includes("#") ? src : `${src}#t=0.1`;

  const play = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false; // start with sound, per design
    const p = v.play();
    if (p) p.catch(() => {});
    setStarted(true);
  };

  return (
    <>
      <video
        ref={videoRef}
        src={previewSrc}
        poster={poster}
        loop
        playsInline
        preload="metadata"
        controls={started}
        onError={onError}
        className={cls}
      />
      {!started && (
        <button
          type="button"
          onClick={play}
          aria-label="Riproduci video"
          className="absolute inset-0 grid place-items-center bg-black/30 transition-colors duration-300 hover:bg-black/20"
        >
          <span className="btn-glow grid h-16 w-16 place-items-center rounded-full bg-neon text-black transition-transform duration-300 group-hover:scale-110">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
              <path d="M9 6v12l9-6z" />
            </svg>
          </span>
        </button>
      )}
    </>
  );
}

/** Renders the product media: <video> / <img>, or a "Nessun media"
 *  placeholder when no source is set or the media fails to load. */
function ProductMedia({ media, name }) {
  const [failed, setFailed] = useState(false);
  const cls =
    "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105";

  if (!media?.src || failed) return <MediaPlaceholder />;

  if (media.type === "video") {
    return (
      <ProductVideo
        src={media.src}
        poster={media.poster}
        cls={cls}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <img
      src={media.src}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cls}
    />
  );
}

function ProductCard({ p, delay }) {
  return (
    <Reveal delay={delay} className="h-full">
      <article className="glass card-glow group flex h-full flex-col rounded-3xl p-4 transition-all duration-300">
        {/* media (image or video) */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl ring-1 ring-white/10">
          <ProductMedia media={p.media} name={p.name} />
        </div>

        {/* name (+ package letter suffix) + price */}
        <div className="mt-4 flex items-start justify-between gap-2">
          <h3 className="display truncate text-3xl text-white">
            {p.name} <span className="text-neon text-glow">{p.package}</span>
          </h3>
          <span className="display shrink-0 text-3xl leading-none text-neon text-glow">
            {formatPrice(p.price)}
          </span>
        </div>

        {/* quantity */}
        <p className="mt-2 text-xs font-semibold text-zinc-400">
          {formatGrams(p.quantity)}
        </p>
      </article>
    </Reveal>
  );
}

export default function FeaturedDrops() {
  // Load products from the backend API (falls back to defaults if offline).
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let alive = true;
    loadProducts().then((list) => alive && setProducts(list));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section id="drops" className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* header */}
        <div className="mb-10">
          <Reveal>
            <h2 className="display text-6xl text-white sm:text-7xl">
              <span className="text-outline">STOCK</span>
              <br />
              <span className="text-neon text-glow">LIMITATO</span>
            </h2>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-zinc-500">
              Qualità prima della quantità
            </p>
          </Reveal>
        </div>

        {/* product grid — 1 / 2 / 4 per row */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} p={p} delay={(i % 4) * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}
