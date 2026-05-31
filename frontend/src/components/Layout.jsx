import { useNavigate, useLocation } from "react-router-dom";
import {
  ChartPie,
  UploadSimple,
  ClockCounterClockwise,
  SignOut,
  Receipt,
} from "@phosphor-icons/react";
import { useAuth } from "../hooks/useAuth";

const NAV_ITEMS = [
  { label: "Dashboard", icon: ChartPie, path: "/" },
  { label: "Subir factura", icon: UploadSimple, path: "/upload" },
  { label: "Historial", icon: ClockCounterClockwise, path: "/history" },
];

export default function Layout({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">

      {/* Sidebar desktop */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Receipt size={18} color="white" weight="fill" />
            </div>
            <div>
              <div className="sidebar-logo-title">InvoiceScan</div>
              <div className="sidebar-logo-sub">Gestión de gastos</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 12px 8px" }}>
            Menú
          </p>
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
            <button
              key={path}
              className={`nav-item ${location.pathname === path ? "active" : ""}`}
              onClick={() => navigate(path)}
            >
              <Icon size={18} weight={location.pathname === path ? "fill" : "regular"} />
              {label}
              <span className="nav-dot" />
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ padding: "10px 12px", marginBottom: 8 }}>
            <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "white" }}>{user?.name}</p>
            <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{user?.email}</p>
          </div>
          <button className="nav-item" onClick={logout}>
            <SignOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">

        {/* Topbar */}
        <header className="topbar">
          <span className="topbar-title">{title}</span>
          <div className="topbar-actions">
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--green-100)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.85rem", fontWeight: 700, color: "var(--green-800)",
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="page-content">
          {children}
        </main>
      </div>

      {/* Bottom nav móvil */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
          <button
            key={path}
            className={`bottom-nav-item ${location.pathname === path ? "active" : ""}`}
            onClick={() => navigate(path)}
          >
            <Icon size={22} weight={location.pathname === path ? "fill" : "regular"} />
            {label}
          </button>
        ))}
        <button className="bottom-nav-item" onClick={logout}>
          <SignOut size={22} />
          Salir
        </button>
      </nav>

    </div>
  );
}