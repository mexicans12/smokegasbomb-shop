/**
 * Fixed background atmosphere: gold glow (left) + graffiti-red glow (right)
 * fading to warm near-black, plus a film-grain overlay.
 * Palette mirrors the SMOKE GAS BOMB logo. Sits behind all content.
 */
export default function Atmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#070504]">
      {/* blurred brand artwork — bottom layer, behind everything */}
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center"
        style={{
          backgroundImage: "url('/background.png')",
          filter: "blur(8px)",
          opacity: 0.32,
        }}
      />
      {/* darkening wash so foreground content stays readable */}
      <div className="absolute inset-0 bg-[#070504]/60" />

      {/* gold glow, top-left */}
      <div
        className="absolute -left-[20%] -top-[15%] h-[85vh] w-[65vw]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(255,194,26,0.18), transparent 62%)",
          filter: "blur(30px)",
        }}
      />
      {/* red glow, bottom-right */}
      <div
        className="absolute -bottom-[15%] -right-[20%] h-[85vh] w-[65vw]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(224,36,28,0.18), transparent 62%)",
          filter: "blur(30px)",
        }}
      />
      {/* warm ember wash, center */}
      <div
        className="absolute left-1/2 top-1/3 h-[60vh] w-[60vw] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(circle at center, rgba(255,122,26,0.07), transparent 65%)",
          filter: "blur(40px)",
        }}
      />
      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.72) 100%)",
        }}
      />
      {/* film grain */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
