import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useInvoices } from "../hooks/useInvoices";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#00d4ff", "#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { stats, invoices, loading } = useInvoices();
  const navigate = useNavigate();

  const reportRef = useRef(null);

  const downloadPDF = () => {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const fecha = new Date().toLocaleDateString("es-CR");
  let y = 0;

  // ── Encabezado ──────────────────────────────────────────
  pdf.setFillColor(30, 30, 30);
  pdf.rect(0, 0, pageWidth, 28, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("InvoiceScan", 14, 13);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("Reporte de Gastos", 14, 20);

  pdf.setFontSize(9);
  pdf.text(`Generado: ${fecha}`, pageWidth - 14, 13, { align: "right" });
  pdf.text(`Usuario: ${user?.name || ""}`, pageWidth - 14, 20, { align: "right" });

  y = 38;

  // ── Línea divisora ───────────────────────────────────────
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  pdf.line(14, y - 4, pageWidth - 14, y - 4);

  // ── Resumen ──────────────────────────────────────────────
  pdf.setTextColor(80, 80, 80);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.text("RESUMEN", 14, y);
  y += 5;

  const cardW = (pageWidth - 28) / 3;
  const cardData = [
    { label: "Total Gastado", value: `CRC ${stats?.totalSpent?.toLocaleString("es-CR") || "0"}` },
    { label: "Facturas Procesadas", value: String(invoices.length) },
    { label: "Categorías", value: String(stats?.byCategory?.length || 0) },
  ];

  cardData.forEach((card, i) => {
    const x = 14 + i * (cardW + 4);
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.3);
    pdf.setFillColor(248, 248, 248);
    pdf.roundedRect(x, y, cardW, 18, 2, 2, "FD");

    pdf.setTextColor(120, 120, 120);
    pdf.setFontSize(7.5);
    pdf.setFont("helvetica", "normal");
    pdf.text(card.label, x + 4, y + 6);

    pdf.setTextColor(20, 20, 20);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text(card.value, x + 4, y + 14);
  });

  y += 26;

  // ── Gastos por categoría ─────────────────────────────────
  pdf.setDrawColor(220, 220, 220);
  pdf.setFillColor(245, 245, 245);
  pdf.rect(14, y, pageWidth - 28, 7, "FD");
  pdf.setTextColor(40, 40, 40);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.text("GASTOS POR CATEGORÍA", 17, y + 4.8);
  y += 10;

  if (stats?.byCategory?.length > 0) {
    stats.byCategory.forEach((cat, i) => {
      pdf.setTextColor(40, 40, 40);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(cat._id, 17, y + 1.5);

      pdf.setFont("helvetica", "bold");
      pdf.text(
        `CRC ${(cat.total || 0).toLocaleString("es-CR")}`,
        pageWidth - 14, y + 1.5, { align: "right" }
      );

      pdf.setDrawColor(230, 230, 230);
      pdf.setLineWidth(0.2);
      pdf.line(14, y + 5, pageWidth - 14, y + 5);
      y += 8;
    });
  }

  y += 6;

  // ── Tabla de facturas ────────────────────────────────────
  pdf.setFillColor(245, 245, 245);
  pdf.setDrawColor(220, 220, 220);
  pdf.rect(14, y, pageWidth - 28, 7, "FD");
  pdf.setTextColor(40, 40, 40);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.text("DETALLE DE FACTURAS", 17, y + 4.8);
  y += 10;

  // Encabezados de columna
  pdf.setFillColor(235, 235, 235);
  pdf.rect(14, y, pageWidth - 28, 7, "F");
  pdf.setTextColor(80, 80, 80);
  pdf.setFontSize(7.5);
  pdf.setFont("helvetica", "bold");
  pdf.text("PROVEEDOR", 17, y + 4.8);
  pdf.text("CATEGORÍA", 95, y + 4.8);
  pdf.text("FECHA", 130, y + 4.8);
  pdf.text("MONTO", pageWidth - 14, y + 4.8, { align: "right" });
  y += 9;

  // Filas
  invoices.forEach((inv, i) => {
    if (y > 265) {
      pdf.addPage();
      y = 20;
    }

    if (i % 2 === 0) {
      pdf.setFillColor(250, 250, 250);
      pdf.rect(14, y - 3, pageWidth - 28, 8, "F");
    }

    const vendor = (inv.vendor || "Sin nombre").substring(0, 45);
    pdf.setTextColor(30, 30, 30);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(vendor, 17, y + 1.5);

    pdf.setTextColor(80, 80, 80);
    pdf.text(inv.category || "—", 95, y + 1.5);
    pdf.text(inv.date || "—", 130, y + 1.5);

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(30, 30, 30);
    pdf.text(
      inv.amount ? `CRC ${inv.amount.toLocaleString("es-CR")}` : "—",
      pageWidth - 14, y + 1.5, { align: "right" }
    );

    pdf.setDrawColor(230, 230, 230);
    pdf.setLineWidth(0.1);
    pdf.line(14, y + 5, pageWidth - 14, y + 5);
    y += 8;
  });

  // ── Total final ──────────────────────────────────────────
  y += 4;
  pdf.setDrawColor(30, 30, 30);
  pdf.setLineWidth(0.5);
  pdf.line(14, y, pageWidth - 14, y);
  y += 6;

  pdf.setTextColor(30, 30, 30);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("TOTAL GENERAL", 17, y);
  pdf.text(
    `CRC ${stats?.totalSpent?.toLocaleString("es-CR") || "0"}`,
    pageWidth - 14, y, { align: "right" }
  );

  // ── Footer ───────────────────────────────────────────────
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.2);
    pdf.line(14, 285, pageWidth - 14, 285);
    pdf.setTextColor(160, 160, 160);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `InvoiceScan · Reporte de Gastos · ${fecha} · Página ${i} de ${pageCount}`,
      pageWidth / 2, 290, { align: "center" }
    );
  }

  pdf.save(`reporte-gastos-${fecha}.pdf`);
};
  const chartData = stats?.byCategory?.map((s) => ({
    name: s._id,
    value: s.total || 0,
  })) || [];

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h1 style={styles.logo}>📄 InvoiceScan</h1>
        <div style={styles.navLinks}>
          <button style={styles.navBtn} onClick={() => navigate("/upload")}>+ Subir</button>
          <button style={styles.navBtn} onClick={() => navigate("/history")}>Historial</button>
          <button style={styles.navBtnPdf} onClick={downloadPDF}>⬇ Reporte PDF</button>
          <button style={{ ...styles.navBtn, ...styles.navBtnOutline }} onClick={logout}>Salir</button>
        </div>
      </nav>

      <div style={styles.content} ref={reportRef}>
        <div style={styles.welcomeBar}>
          <h2 style={styles.welcomeText}>Hola, {user?.name} 👋</h2>
          <p style={styles.welcomeSub}>Aquí está el resumen de tus gastos</p>
        </div>

        <div style={styles.grid3}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total gastado</p>
            <p style={styles.statValue}>
              ₡{stats?.totalSpent?.toLocaleString("es-CR") || "0"}
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

        <div style={styles.grid2}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Gastos por categoría</h3>
            {chartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`₡${value.toLocaleString("es-CR")}`, "Total"]}
                      contentStyle={{ background: "#1a1d27", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={styles.legend}>
                  {chartData.map((item, i) => (
                    <div key={i} style={styles.legendItem}>
                      <span style={{ ...styles.legendDot, background: COLORS[i % COLORS.length] }} />
                      <span style={styles.legendLabel}>{item.name}</span>
                      <span style={styles.legendValue}>₡{item.value.toLocaleString("es-CR")}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={styles.empty}>Sube tu primera factura para ver estadísticas</div>
            )}
          </div>

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
                    <div style={styles.invoiceLeft}>
                      <p style={styles.invoiceVendor}>{inv.vendor || "Sin nombre"}</p>
                      <p style={styles.invoiceMeta}>{inv.category} · {inv.date || "Sin fecha"}</p>
                    </div>
                    <p style={styles.invoiceAmount}>
                      ₡{inv.amount?.toLocaleString("es-CR") || "—"}
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

      {/* Estilos responsive inyectados */}
      <style>{`
        @media (max-width: 768px) {
          .dash-grid3 { grid-template-columns: 1fr !important; }
          .dash-grid2 { grid-template-columns: 1fr !important; }
          .dash-nav-links button:nth-child(2) { display: none; }
          .dash-content { padding: 1rem !important; }
          .dash-stat-value { font-size: 1.5rem !important; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "var(--bg-primary)" },
  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "1rem 1.5rem", background: "var(--bg-secondary)",
    borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 10,
    flexWrap: "wrap", gap: "0.5rem",
  },
  logo: { fontSize: "1.2rem" },
  navLinks: { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
  navBtn: {
    background: "linear-gradient(135deg, var(--accent-violet), var(--accent-cyan))",
    border: "none", borderRadius: "8px", padding: "0.5rem 0.875rem",
    color: "#fff", fontWeight: 500, cursor: "pointer", fontSize: "0.85rem",
    whiteSpace: "nowrap",
  },
  navBtnOutline: {
    background: "transparent", border: "1px solid var(--border)",
    color: "var(--text-secondary)",
  },
  content: {
    padding: "1.5rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  welcomeBar: { marginBottom: "1.5rem" },
  welcomeText: { fontSize: "1.4rem", fontWeight: 600 },
  welcomeSub: { color: "var(--text-secondary)", marginTop: "0.25rem", fontSize: "0.9rem" },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "1.25rem",
  },
  statCard: {
    background: "var(--bg-secondary)", border: "1px solid var(--border)",
    borderRadius: "12px", padding: "1.25rem",
  },
  statLabel: { color: "var(--text-secondary)", fontSize: "0.8rem", marginBottom: "0.4rem" },
  statValue: { fontSize: "1.75rem", fontWeight: 700, color: "var(--accent-cyan)", wordBreak: "break-word" },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1rem",
  },
  card: {
    background: "var(--bg-secondary)", border: "1px solid var(--border)",
    borderRadius: "12px", padding: "1.25rem",
  },
  cardTitle: { fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" },
  empty: { color: "var(--text-secondary)", textAlign: "center", padding: "2rem 0", fontSize: "0.9rem" },
  legend: { display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.75rem" },
  legendItem: { display: "flex", alignItems: "center", gap: "0.5rem" },
  legendDot: { width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0 },
  legendLabel: { flex: 1, fontSize: "0.85rem", color: "var(--text-secondary)" },
  legendValue: { fontSize: "0.85rem", fontWeight: 500 },
  invoiceList: { display: "flex", flexDirection: "column", gap: "0.6rem" },
  invoiceItem: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "0.75rem", background: "var(--bg-card)", borderRadius: "8px", gap: "0.5rem",
  },
  invoiceLeft: { flex: 1, minWidth: 0 },
  invoiceVendor: { fontWeight: 500, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  invoiceMeta: { color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "0.2rem" },
  invoiceAmount: { color: "var(--accent-cyan)", fontWeight: 600, fontSize: "0.9rem", whiteSpace: "nowrap" },
  viewAll: {
    background: "transparent", border: "none", color: "var(--accent-cyan)",
    cursor: "pointer", marginTop: "1rem", fontSize: "0.85rem", padding: 0,
  },
  navBtnPdf: {
    background: "transparent",
    border: "1px solid var(--accent-cyan)",
    borderRadius: "8px",
    padding: "0.5rem 0.875rem",
    color: "var(--accent-cyan)",
    fontWeight: 500,
    cursor: "pointer",
    fontSize: "0.85rem",
    whiteSpace: "nowrap",
  },
};