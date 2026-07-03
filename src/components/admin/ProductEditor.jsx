import { useRef, useState } from "react";
import { formatGrams, formatPrice, uploadMedia } from "../../data/products.js";
import { Trash, Check, X } from "../icons.jsx";

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-neon/60";
const labelCls =
  "mb-1.5 block text-[0.65rem] font-bold uppercase tracking-[0.16em] text-zinc-500";

/** Editable card for a single product. Calls onChange with the updated
 *  product on every edit, and onDelete to remove it. */
export default function ProductEditor({ product, onChange, onDelete }) {
  const fileRef = useRef(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  const set = (patch) => onChange({ ...product, ...patch });
  const setMedia = (patch) =>
    onChange({ ...product, media: { ...product.media, ...patch } });

  // Clicking the media box opens the file picker; the file is uploaded to
  // Vercel Blob with live progress, and the URL is stored on the product.
  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setUploadError("");
    setProgress(0);
    setUploading(true);
    try {
      const media = await uploadMedia(file, setProgress);
      onChange({ ...product, media });
    } catch (err) {
      setUploadError(err?.message || "Upload non riuscito");
    } finally {
      setUploading(false);
    }
  };

  const clearMedia = (e) => {
    e?.stopPropagation?.();
    setMedia({ src: "", poster: undefined });
  };

  return (
    <article className="glass flex flex-col gap-4 rounded-2xl p-4">
      {/* clickable media — click to upload image or video */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        title="Clicca per caricare immagine o video"
        className="group/media relative aspect-square w-full overflow-hidden rounded-xl bg-black/40 text-left ring-1 ring-white/10 transition-colors hover:ring-neon/50"
      >
        {product.media?.src ? (
          product.media.type === "video" ? (
            <video
              src={product.media.src}
              muted
              loop
              autoPlay
              playsInline
              onError={clearMedia}
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={product.media.src}
              alt={product.name}
              onError={clearMedia}
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <div className="grid h-full w-full place-items-center text-xs uppercase tracking-[0.2em] text-zinc-600">
            Nessun media
          </div>
        )}

        {/* uploading overlay with live progress bar */}
        {uploading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/80 px-6">
            <span className="text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-neon">
              {progress < 100 ? "Caricamento" : "Elaborazione"} · {Math.round(progress)}%
            </span>
            <div className="h-2 w-full max-w-[180px] overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-neon transition-[width] duration-200 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* hover hint */}
        {!uploading && (
          <div className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition-all group-hover/media:bg-black/45 group-hover/media:opacity-100">
            <span className="rounded-full bg-neon px-4 py-2 text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-[#1a1206]">
              {product.media?.src ? "Cambia media" : "Carica media"}
            </span>
          </div>
        )}

        {/* remove media (only when present) */}
        {product.media?.src && !uploading && (
          <span
            role="button"
            tabIndex={0}
            onClick={clearMedia}
            onKeyDown={(e) => (e.key === "Enter" ? clearMedia(e) : null)}
            className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white transition-colors hover:bg-blood"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        )}

        {/* preview chips: name suffix + price, like the live card */}
        <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs">
          <span className="rounded-md bg-black/60 px-2 py-1 font-semibold text-white">
            {product.name} <span className="text-neon">{product.package}</span>
          </span>
          <span className="rounded-md bg-black/60 px-2 py-1 font-bold text-neon">
            {formatPrice(product.price)}
          </span>
        </div>
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        onChange={onPickFile}
        className="hidden"
      />

      {uploadError && (
        <p className="-mt-1 text-xs font-semibold text-blood">{uploadError}</p>
      )}

      {/* name */}
      <div>
        <label className={labelCls}>Nome prodotto</label>
        <input
          className={inputCls}
          value={product.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="Nome"
        />
      </div>

      {/* package + quantity */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Confezione (A–Z)</label>
          <input
            className={`${inputCls} text-center uppercase`}
            value={product.package}
            maxLength={1}
            onChange={(e) =>
              set({
                package: e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z]/g, "")
                  .slice(0, 1),
              })
            }
            placeholder="A"
          />
        </div>
        <div>
          <label className={labelCls}>Quantità</label>
          <input
            type="text"
            inputMode="decimal"
            className={inputCls}
            value={product.quantity}
            onChange={(e) => {
              // allow empty + in-progress decimals; keep raw string while typing
              const v = e.target.value.replace(",", ".");
              if (v === "" || /^\d*\.?\d*$/.test(v)) set({ quantity: v });
            }}
            onBlur={(e) => {
              const n = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
              set({ quantity: n });
            }}
            placeholder="0"
          />
        </div>
      </div>

      {/* price */}
      <div>
        <label className={labelCls}>Prezzo (€)</label>
        <input
          type="text"
          inputMode="numeric"
          className={inputCls}
          value={product.price}
          onChange={(e) => {
            const v = e.target.value.replace(",", ".");
            if (v === "" || /^\d*\.?\d*$/.test(v)) set({ price: v });
          }}
          onBlur={(e) => set({ price: Math.max(0, parseFloat(e.target.value) || 0) })}
          placeholder="0"
        />
      </div>

      {/* footer: grams readout + delete (icon, with inline confirmation) */}
      <div className="flex items-center justify-between gap-2">
        {confirmDelete ? (
          <>
            <span className="text-[0.65rem] uppercase tracking-[0.14em] text-zinc-400">
              Eliminare?
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onDelete}
                aria-label="Conferma eliminazione"
                title="Conferma"
                className="grid h-9 w-9 place-items-center rounded-full bg-blood text-white transition-transform hover:scale-110"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                aria-label="Annulla"
                title="Annulla"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-zinc-400 transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <>
            <span className="text-xs text-zinc-500">{formatGrams(product.quantity)}</span>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              aria-label="Elimina prodotto"
              title="Elimina"
              className="grid h-9 w-9 place-items-center rounded-full border border-blood/40 bg-blood/10 text-blood transition-colors hover:bg-blood hover:text-white"
            >
              <Trash className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </article>
  );
}
