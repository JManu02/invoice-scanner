import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInvoices } from "../hooks/useInvoices";
import Layout from "../components/Layout";
import { Trash, FunnelSimple, ReceiptX } from "@phosphor-icons/react";

const CATEGORIES = ["Todas", "Alimentación", "Transporte", "Servicios", "Salud", "Tecnología", "Otros"];

export default function History() {
  const [selected, setSelected] = useState("Todas");
  const { invoices, loading, deleteInvoice, deleteAllInvoices, fetchInvoices } = useInvoices();
  const navigate = useNavigate();

  const handleFilter = (cat) => {
    setSelected(cat);
    fetchInvoices(cat === "Todas" ? {} : { category: cat });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta factura?")) return;
    await deleteInvoice(id);
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(`¿Eliminar las ${invoices.length} facturas? Esta acción no se puede deshacer.`)) return;
    await deleteAllInvoices();
  };

  return (
    <Layout title="Historial de facturas">

      {/* Header row */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>Facturas registradas</h2>
          <p style={styles.subtitle}>{invoices.length} documento{invoices.length !== 1 ? "s" : ""} encontrado{invoices.length !== 1 ? "s" : ""}</p>
        </div>
        {invoices.length > 0 && (
          <button className="btn-danger" onClick={handleDeleteAll}>
            <Trash size={15} />
            Eliminar todas
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={styles.filtersRow}>
        <FunnelSimple size={15} color="var(--text-muted)" />
        <div style={styles.filters}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              style={{
                ...styles.filterBtn,
                ...(selected === cat ? styles.filterActive : {}),
              }}
              onClick={() => handleFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={styles.skeletonRow} />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <ReceiptX size={40} color="var(--gray-400)" />
          </div>
          <p style={styles.emptyTitle}>Sin facturas</p>
          <p style={styles.emptySub}>No hay facturas en esta categoría</p>
          <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => navigate("/upload")}>
            Subir primera factura
          </button>
        </div>
      ) : (
        <div style={styles.table}>
          {/* Table header */}
          <div style={styles.tableHeader}>
            <span style={{ flex: 2 }}>Proveedor</span>
            <span style={{ flex: 1 }}>Categoría</span>
            <span style={{ flex: 1 }}>Fecha</span>
            <span style={{ flex: 1, textAlign: "right" }}>Monto</span>
            <span style={{ width: 40 }} />
          </div>

          {/* Rows */}
          {invoices.map((inv) => (
            <div key={inv._id} style={styles.tableRow}>
              <div style={{ flex: 2, minWidth: 0 }}>
                <p style={styles.vendor}>{inv.vendor || "Sin nombre"}</p>
                <p style={styles.fileName}>{inv.fileName || ""}</p>
              </div>
              <div style={{ flex: 1 }}>
                <span className="badge badge-green">{inv.category}</span>
              </div>
              <div style={{ flex: 1 }}>
                <span style={styles.date}>{inv.date || "—"}</span>
              </div>
              <div style={{ flex: 1, textAlign: "right" }}>
                <p style={styles.amount}>₡{inv.amount?.toLocaleString("es-CR") || "—"}</p>
                {inv.tax && <p style={styles.tax}>IVA ₡{inv.tax.toLocaleString("es-CR")}</p>}
              </div>
              <div style={{ width: 40, display: "flex", justifyContent: "flex-end" }}>
                <button
                  style={styles.deleteBtn}
                  onClick={() => handleDelete(inv._id)}
                  title="Eliminar"
                >
                  <Trash size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </Layout>
  );
}

const styles = {
  headerRow: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12,
  },
  title: { fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" },
  subtitle: { fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 4 },
  filtersRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 20 },
  filters: { display: "flex", gap: 6, flexWrap: "wrap" },
  filterBtn: {
    padding: "5px 14px", borderRadius: 99,
    background: "var(--white)", border: "1px solid var(--border)",
    color: "var(--text-secondary)", fontSize: "0.8rem", fontWeight: 500,
    cursor: "pointer", transition: "all 0.15s",
  },
  filterActive: {
    background: "var(--green-800)", borderColor: "var(--green-800)",
    color: "white",
  },
  skeletonRow: {
    height: 64, borderRadius: "var(--radius-md)",
    background: "var(--gray-100)", animation: "pulse 1.5s infinite",
  },
  emptyState: {
    textAlign: "center", padding: "60px 0",
    display: "flex", flexDirection: "column", alignItems: "center",
  },
  emptyIcon: {
    width: 80, height: 80, borderRadius: "var(--radius-xl)",
    background: "var(--gray-100)", display: "flex",
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  emptyTitle: { fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" },
  emptySub: { fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 4 },
  table: {
    background: "var(--white)", borderRadius: "var(--radius-lg)",
    border: "1px solid var(--border)", overflow: "hidden",
  },
  tableHeader: {
    display: "flex", alignItems: "center", gap: 16,
    padding: "10px 20px",
    background: "var(--gray-50)", borderBottom: "1px solid var(--border)",
    fontSize: "0.72rem", fontWeight: 600,
    color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em",
  },
  tableRow: {
    display: "flex", alignItems: "center", gap: 16,
    padding: "16px 20px", borderBottom: "1px solid var(--border)",
    transition: "background 0.15s",
  },
  vendor: { fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  fileName: { fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 },
  date: { fontSize: "0.82rem", color: "var(--text-secondary)" },
  amount: { fontSize: "0.95rem", fontWeight: 700, color: "var(--green-800)" },
  tax: { fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 },
  deleteBtn: {
    width: 32, height: 32, borderRadius: 8,
    background: "transparent", border: "none",
    color: "var(--gray-400)", display: "flex",
    alignItems: "center", justifyContent: "center",
    cursor: "pointer", transition: "background 0.15s, color 0.15s",
  },
};