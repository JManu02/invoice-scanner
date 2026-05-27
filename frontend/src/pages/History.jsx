import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInvoices } from "../hooks/useInvoices";

const CATEGORIES = ["Todas", "Alimentación", "Transporte", "Servicios", "Salud", "Tecnología", "Otros"];

export default function History() {
  const [selected, setSelected] = useState("Todas");
  const { invoices, loading, deleteInvoice, fetchInvoices } = useInvoices();
  const navigate = useNavigate();

  const handleFilter = (cat) => {
    setSelected(cat);
    fetchInvoices(cat === "Todas" ? {} : { category: cat });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta factura?")) return;
    await deleteInvoice(id);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.back} onClick={() => navigate("/")}>← Volver</button>
        <h2 style={styles.title}>Historial de facturas</h2>
      </div>

      {/* Filtros */}
      <div style={styles.filters}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            style={{ ...styles.filterBtn, ...(selected === cat ? styles.filterActive : {}) }}
            onClick={() => handleFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div style={styles.empty}>Cargando...</div>
      ) : invoices.length === 0 ? (
        <div style={styles.empty}>No hay facturas en esta categoría</div>
      ) : (
        <div style={styles.list}>
          {invoices.map((inv) => (
            <div key={inv._id} style={styles.card}>
              <div style={styles.cardLeft}>
                <p style={styles.vendor}>{inv.vendor || "Sin nombre"}</p>
                <p style={styles.meta}>{inv.date || "Sin fecha"} · {inv.fileName || ""}</p>
                <span style={styles.badge}>{inv.category}</span>
              </div>
              <div style={styles.cardRight}>
                <p style={styles.amount}>${inv.amount?.toFixed(2) || "—"}</p>
                {inv.tax && <p style={styles.tax}>IVA: ${inv.tax.toFixed(2)}</p>}
                <button style={styles.deleteBtn} onClick={() => handleDelete(inv._id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "var(--bg-primary)", padding: "2rem" },
  header: { display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" },
  back: { background: "transparent", border: "none", color: "var(--accent-cyan)", cursor: "pointer", fontSize: "0.95rem" },
  title: { fontSize: "1.5rem", fontWeight: 600 },
  filters: { display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" },
  filterBtn: {
    background: "var(--bg-secondary)", border: "1px solid var(--border)",
    borderRadius: "999px", padding: "0.4rem 1rem", color: "var(--text-secondary)",
    cursor: "pointer", fontSize: "0.85rem",
  },
  filterActive: { background: "var(--accent-violet)", color: "#fff", borderColor: "var(--accent-violet)" },
  empty: { color: "var(--text-secondary)", textAlign: "center", padding: "4rem 0" },
  list: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  card: {
    background: "var(--bg-secondary)", border: "1px solid var(--border)",
    borderRadius: "12px", padding: "1.25rem 1.5rem",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  cardLeft: { display: "flex", flexDirection: "column", gap: "0.3rem" },
  vendor: { fontWeight: 600, fontSize: "0.95rem" },
  meta: { color: "var(--text-secondary)", fontSize: "0.8rem" },
  badge: {
    display: "inline-block", background: "var(--accent-cyan-dim)",
    color: "var(--accent-cyan)", borderRadius: "999px",
    padding: "0.2rem 0.75rem", fontSize: "0.75rem", fontWeight: 500, marginTop: "0.25rem",
  },
  cardRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" },
  amount: { fontSize: "1.2rem", fontWeight: 700, color: "var(--accent-cyan)" },
  tax: { color: "var(--text-secondary)", fontSize: "0.8rem" },
  deleteBtn: { background: "transparent", border: "none", cursor: "pointer", fontSize: "1rem", marginTop: "0.5rem" },
};