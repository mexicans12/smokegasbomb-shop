import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductEditor from "./ProductEditor.jsx";
import { loadProducts, saveProducts, blankProduct } from "../../data/products.js";
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "../../data/settings.js";

export default function AdminDashboard({ onLogout }) {
  const [products, setProducts] = useState(null); // null = loading
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // editable social links
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  useEffect(() => {
    loadProducts().then(setProducts);
    loadSettings().then(setSettings);
  }, []);

  const updateSetting = (key, value) => {
    setSettings((s) => ({ ...s, [key]: value }));
    setSettingsDirty(true);
    setSettingsSaved(false);
    setSettingsError("");
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    setSettingsError("");
    try {
      await saveSettings(settings);
      setSettingsDirty(false);
      setSettingsSaved(true);
    } catch (e) {
      setSettingsError(e.message || "Salvataggio non riuscito");
    } finally {
      setSettingsSaving(false);
    }
  };

  const markChanged = () => {
    setDirty(true);
    setSaved(false);
    setError("");
  };

  const updateProduct = (updated) => {
    setProducts((list) => list.map((p) => (p.id === updated.id ? updated : p)));
    markChanged();
  };

  const deleteProduct = (id) => {
    setProducts((list) => list.filter((p) => p.id !== id));
    markChanged();
  };

  const addProduct = () => {
    setProducts((list) => [...list, blankProduct(list)]);
    markChanged();
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await saveProducts(products);
      setDirty(false);
      setSaved(true);
    } catch (e) {
      setError(e.message || "Salvataggio non riuscito");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* top bar */}
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#070504]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="Logo"
              className="h-10 w-10 rounded-full border border-[#ffc21a]/40 object-cover"
            />
            <div>
              <p className="eyebrow !text-[0.6rem]">Pannello Admin</p>
              <h1 className="display text-2xl leading-none text-white">
                Gestione Prodotti
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-zinc-300 transition-colors hover:border-white/30 hover:text-white"
            >
              Vai al sito
            </Link>
            <button
              onClick={onLogout}
              className="rounded-full border border-blood/40 bg-blood/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blood transition-colors hover:bg-blood hover:text-white"
            >
              Esci
            </button>
          </div>
        </div>
      </header>

      {/* toolbar */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 pt-8 sm:px-6">
        <div>
          <h2 className="display text-4xl text-white sm:text-5xl">
            <span className="text-neon text-glow">PRODOTTI</span>
          </h2>
          <p className="mt-1 text-sm uppercase tracking-[0.1em] text-zinc-500">
            {products?.length ?? 0} PRODOTTI · LE MODIFICHE APPAIONO SUL SITO DOPO IL SALVATAGGIO
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {error && (
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-blood">
              {error}
            </span>
          )}
          {saved && !dirty && (
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-neon">
              ✓ Salvato
            </span>
          )}
          {dirty && (
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
              Modifiche non salvate
            </span>
          )}
          <button
            onClick={addProduct}
            disabled={!products}
            className="rounded-full border border-white/12 bg-white/[0.03] px-5 py-2.5 text-xs font-extrabold uppercase tracking-[0.16em] text-white transition-colors hover:border-white/30 disabled:opacity-40"
          >
            + Aggiungi
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="btn-glow rounded-full bg-neon px-6 py-2.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#1a1206] transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
          >
            {saving ? "Salvataggio…" : "Salva modifiche"}
          </button>
        </div>
      </div>

      {/* social links settings */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <div className="glass rounded-2xl p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="display text-2xl text-white">
                <span className="text-neon text-glow">LINK SOCIAL</span>
              </h3>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-500">
                Link usati nei bottoni Telegram e Instagram
              </p>
            </div>
            <div className="flex items-center gap-2">
              {settingsError && (
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-blood">
                  {settingsError}
                </span>
              )}
              {settingsSaved && !settingsDirty && (
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-neon">
                  ✓ Salvato
                </span>
              )}
              <button
                onClick={handleSaveSettings}
                disabled={!settingsDirty || settingsSaving}
                className="btn-glow rounded-full bg-neon px-5 py-2.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#1a1206] transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
              >
                {settingsSaving ? "Salvataggio…" : "Salva link"}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[0.65rem] font-bold uppercase tracking-[0.16em] text-zinc-500">
                Link Telegram
              </label>
              <input
                type="url"
                inputMode="url"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-neon/60"
                value={settings.telegram}
                onChange={(e) => updateSetting("telegram", e.target.value)}
                placeholder="https://t.me/iltuocanale"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[0.65rem] font-bold uppercase tracking-[0.16em] text-zinc-500">
                Link Instagram
              </label>
              <input
                type="url"
                inputMode="url"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-neon/60"
                value={settings.instagram}
                onChange={(e) => updateSetting("instagram", e.target.value)}
                placeholder="https://instagram.com/iltuoprofilo"
              />
            </div>
          </div>
        </div>
      </div>

      {/* product grid */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {products === null ? (
          <div className="glass rounded-2xl p-12 text-center text-zinc-500">
            Caricamento prodotti…
          </div>
        ) : products.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-zinc-500">
            Nessun prodotto. Premi “+ Aggiungi” per crearne uno.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductEditor
                key={p.id}
                product={p}
                onChange={updateProduct}
                onDelete={() => deleteProduct(p.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
