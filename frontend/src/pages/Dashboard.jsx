import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useInvoices } from "../hooks/useInvoices";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#00d4ff", "#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { stats, invoices, loading } = useInvoices();
  const navigate = useNavigate();

  const chartData = stats?.byCategory?.map((s) => ({
    name: s._id,
    value: s.total || 0,
  })) || [];

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <h1 style={styles.logo}>📄 InvoiceScan</h1>
        <div style={styles.navLinks}>
          <button style={styles.navBtn} onClick={() => navigate("/upload")}>+ Subir factura</button>
          <button style={styles.navBtn} onClick={() => navigate("/history")}>Historial</button>
          <button style={{...styles.navBtn, ...styles.navBtnOutline}} onClick={logout}>Salir</button>
        </div>
      </nav>

      <div style={styles.content}>
        {/* Bienvenida */}
        <div style={styles.welcomeBar}>
          <h2 style={styles.welcomeText}>Hola, {user?.name} 👋</h2>
          <p style={styles.welcomeSub}>Aquí está el resumen de tus gastos</p>
        </div>

        {/* Stats cards */}
        <div style={styles.grid3}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total gastado</p>
            <p style={styles.statValue}>
              ${stats?.totalSpent?.toFixed(2) || "0.00"}
            </p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Facturas procesadas</p>
            <p style={styles.statValue}>{invoices.length}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Categorías</p>
            <p style={styles.statValue}>{stats?.byCategory?.length || 0}</p>
          </div>
        </div>

        {/* Chart + recent */}
        <div style={styles.grid2}>
          {/* Pie chart */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Gastos por categoría</h3>
            {chartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`$${value.toFixed(2)}`, "Total"]}
                      contentStyle={{ background: "#1a1d27", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={styles.legend}>
                  {chartData.map((item, i) => (
                    <div key={i} style={styles.legendItem}>
                      <span style={{ ...styles.legendDot, background: COLORS[i % COLORS.length] }} />
                      <span style={styles.legendLabel}>{item.name}</span>
                      <span style={styles.legendValue}>${item.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={styles.empty}>Sube tu primera factura para ver estadísticas</div>
            )}
          </div>

          {/* Facturas recientes */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Facturas recientes</h3>
            {loading ? (
              <div style={styles.empty}>Cargando...</div>
            ) : invoices.length === 0 ? (
              <div style={styles.empty}>No hay facturas aún</div>
            ) : (
              <div style={styles.invoiceList}>
                {invoices.slice(0, 5).map((inv) => (
                  <div key={inv._id} style={styles.invoiceItem}>
                    <div>
                      <p style={styles.invoiceVendor}>{inv.vendor || "Sin nombre"}</p>
                      <p style={styles.invoiceMeta}>{inv.category} · {inv.date || "Sin fecha"}</p>
                    </div>
                    <p style={styles.invoiceAmount}>
                      ${inv.amount?.toFixed(2) || "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {invoices.length > 0 && (
              <button style={styles.viewAll} onClick={() => navigate("/history")}>
                Ver todas →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "var(--bg-primary)" },
  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "1rem 2rem", background: "var(--bg-secondary)",
    borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 10,
  },
  logo: { fontSize: "1.3rem" },
  navLinks: { display: "flex", gap: "0.75rem" },
  navBtn: {
    background: "linear-gradient(135deg, var(--accent-violet), var(--accent-cyan))",
    border: "none", borderRadius: "8px", padding: "0.5rem 1rem",
    color: "#fff", fontWeight: 500, cursor: "pointer", fontSize: "0.9rem",
  },
  navBtnOutline: {
    background: "transparent", border: "1px solid var(--border)",
    color: "var(--text-secondary)",
  },
  content: { padding: "2rem", maxWidth: "1200px", margin: "0 auto" },
  welcomeBar: { marginBottom: "2rem" },
  welcomeText: { fontSize: "1.6rem", fontWeight: 600 },
  welcomeSub: { color: "var(--text-secondary)", marginTop: "0.25rem" },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" },
  statCard: {
    background: "var(--bg-secondary)", border: "1px solid var(--border)",
    borderRadius: "12px", padding: "1.5rem",
  },
  statLabel: { color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.5rem" },
  statValue: { fontSize: "2rem", fontWeight: 700, color: "var(--accent-cyan)" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  card: {
    background: "var(--bg-secondary)", border: "1px solid var(--border)",
    borderRadius: "12px", padding: "1.5rem",
  },
  cardTitle: { fontSize: "1rem", fontWeight: 600, marginBottom: "1.25rem" },
  empty: { color: "var(--text-secondary)", textAlign: "center", padding: "2rem 0", fontSize: "0.9rem" },
  legend: { display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" },
  legendItem: { display: "flex", alignItems: "center", gap: "0.5rem" },
  legendDot: { width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0 },
  legendLabel: { flex: 1, fontSize: "0.85rem", color: "var(--text-secondary)" },
  legendValue: { fontSize: "0.85rem", fontWeight: 500 },
  invoiceList: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  invoiceItem: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "0.75rem", background: "var(--bg-card)", borderRadius: "8px",
  },
  invoiceVendor: { fontWeight: 500, fontSize: "0.9rem" },
  invoiceMeta: { color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.2rem" },
  invoiceAmount: { color: "var(--accent-cyan)", fontWeight: 600 },
  viewAll: {
    background: "transparent", border: "none", color: "var(--accent-cyan)",
    cursor: "pointer", marginTop: "1rem", fontSize: "0.9rem", padding: 0,
  },
};