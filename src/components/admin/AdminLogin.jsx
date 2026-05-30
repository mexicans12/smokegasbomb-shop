import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { login } from "../../data/auth.js";

export default function AdminLogin({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await login(username, password)) {
      onSuccess();
    } else {
      setError(true);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-neon/60";

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass relative w-full max-w-sm rounded-3xl p-8 text-center sm:p-10"
      >
        <img
          src="/logo.jpg"
          alt="Logo"
          className="mx-auto mb-6 h-20 w-20 rounded-full border border-[#ffc21a]/40 object-cover shadow-[0_0_50px_-8px_rgba(255,194,26,0.6)]"
        />
        <p className="eyebrow mb-3">Pannello Admin</p>
        <h1 className="display mb-8 text-4xl text-white">
          <span className="text-neon text-glow">ACCEDI</span>
        </h1>

        <div className="space-y-3 text-left">
          <input
            type="text"
            autoComplete="username"
            placeholder="Nome utente"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError(false);
            }}
            className={inputCls}
          />
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            className={inputCls}
          />
        </div>

        {error && (
          <p className="mt-4 text-sm font-semibold text-blood">
            Credenziali non valide.
          </p>
        )}

        <button
          type="submit"
          className="btn-glow mt-7 w-full rounded-full bg-neon py-3.5 text-sm font-extrabold uppercase tracking-[0.2em] text-[#1a1206] transition-transform hover:scale-[1.02] active:scale-95"
        >
          Entra
        </button>

        <Link
          to="/"
          className="mt-5 inline-block text-xs uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-white"
        >
          ← Torna al sito
        </Link>
      </motion.form>
    </div>
  );
}
