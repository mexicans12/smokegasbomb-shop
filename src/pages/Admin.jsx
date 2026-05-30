import { useEffect, useState } from "react";
import Atmosphere from "../components/Atmosphere.jsx";
import AdminLogin from "../components/admin/AdminLogin.jsx";
import AdminDashboard from "../components/admin/AdminDashboard.jsx";
import { checkSession, logout } from "../data/auth.js";

export default function Admin() {
  // null = still checking the session, true/false = resolved
  const [authed, setAuthed] = useState(null);

  useEffect(() => {
    checkSession().then(setAuthed);
  }, []);

  const handleLogout = async () => {
    await logout();
    setAuthed(false);
  };

  return (
    <>
      <Atmosphere />
      {authed === null ? (
        <div className="grid min-h-screen place-items-center">
          <p className="eyebrow animate-pulse">Caricamento…</p>
        </div>
      ) : authed ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <AdminLogin onSuccess={() => setAuthed(true)} />
      )}
    </>
  );
}
