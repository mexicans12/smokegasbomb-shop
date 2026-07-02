/* Gold accent bar — section divider / centerpiece.
   (Replaces the former green/white/red tricolor.) */
export default function AccentBar({ className = "" }) {
  return (
    <div
      className={`h-[3px] w-[120px] rounded-full ${className}`}
      style={{
        background:
          "linear-gradient(90deg, transparent, #ffc21a 30%, #ff7a1a 70%, transparent)",
      }}
    />
  );
}
