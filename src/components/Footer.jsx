import { Telegram, Instagram } from "./icons.jsx";

const SOCIALS = [
  {
    Icon: Telegram,
    label: "Telegram",
    href: "https://t.me",
    className:
      "bg-[#229ED9] shadow-[0_8px_26px_-8px_rgba(34,158,217,0.7)] hover:shadow-[0_12px_34px_-8px_rgba(34,158,217,0.95)]",
  },
  {
    Icon: Instagram,
    label: "Instagram",
    href: "https://instagram.com",
    style: {
      background:
        "linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)",
    },
    className:
      "shadow-[0_8px_26px_-8px_rgba(214,41,118,0.6)] hover:shadow-[0_12px_34px_-8px_rgba(214,41,118,0.9)]",
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/8 px-6 py-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 text-center sm:grid-cols-3">
        {/* logo (left) */}
        <div className="flex justify-center sm:justify-start">
          <img
            src="/logo.jpg"
            alt="Logo"
            className="h-12 w-12 shrink-0 rounded-full border border-[#ffc21a]/40 object-cover shadow-[0_0_30px_-8px_rgba(255,194,26,0.6)]"
          />
        </div>

        {/* copyright (center) */}
        <p className="text-xs uppercase tracking-[0.28em] text-zinc-600">
          © 2026 · Solo membri · 18+
        </p>

        {/* socials (right) */}
        <div className="flex items-center justify-center gap-3 sm:justify-end">
          {SOCIALS.map(({ Icon, label, href, className, style }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              style={style}
              className={`grid h-11 w-11 place-items-center rounded-full text-white ring-1 ring-inset ring-white/20 transition-transform hover:scale-110 ${className}`}
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
