import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useInvoices } from "../hooks/useInvoices";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { UploadSimple, FilePdf, TrendUp } from "@phosphor-icons/react";
import Layout from "../components/Layout";
import jsPDF from "jspdf";

const COLORS = ["#166534", "#22c55e", "#84cc16", "#15803d", "#4ade80", "#86efac"];

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, invoices, loading } = useInvoices();
  const navigate = useNavigate();
  const reportRef = useRef(null);

  const chartData = stats?.byCategory?.map((s) => ({
    name: s._id,
    value: s.total || 0,
  })) || [];

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
    pdf.text(`Generado: ${fecha}`, pageWidth - 14, 13, { align: "right" });
    pdf.text(`Usuario: ${user?.name || ""}`, pageWidth - 14, 20, { align: "right" });
    y = 38;

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
      { label: "Categorias", value: String(stats?.byCategory?.length || 0) },
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
    pdf.setFillColor(245, 245, 245);
    pdf.setDrawColor(220, 220, 220);
    pdf.rect(14, y, pageWidth - 28, 7, "FD");
    pdf.setTextColor(40, 40, 40);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.text("GASTOS POR CATEGORIA", 17, y + 4.8);
    y += 10;

    if (stats?.byCategory?.length > 0) {
      stats.byCategory.forEach((cat) => {
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
    pdf.text("CATEGORIA", 88, y + 4.8);
    pdf.text("FECHA", 118, y + 4.8);
    pdf.text("IVA", 143, y + 4.8);
    pdf.text("MONTO", pageWidth - 14, y + 4.8, { align: "right" });
    y += 9;

    // Filas
    let totalIVA = 0;

    invoices.forEach((inv, i) => {
      if (y > 265) { pdf.addPage(); y = 20; }
      if (i % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(14, y - 3, pageWidth - 28, 8, "F");
      }

      const vendorClean = (inv.vendor || "Sin nombre")
        .replace(/\n/g, " ").replace(/\s+/g, " ").trim().substring(0, 38);

      pdf.setTextColor(30, 30, 30);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(vendorClean, 17, y + 1.5);

      pdf.setTextColor(80, 80, 80);
      pdf.text(inv.category || "—", 88, y + 1.5);
      pdf.text(inv.date || "—", 118, y + 1.5);

      const ivaTxt = inv.tax ? `CRC ${inv.tax.toLocaleString("es-CR")}` : "—";
      pdf.setTextColor(100, 100, 100);
      pdf.text(ivaTxt, 143, y + 1.5);
      if (inv.tax) totalIVA += inv.tax;

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

    // ── Totales finales ──────────────────────────────────────
    y += 4;

    // Fila IVA total
    pdf.setFillColor(248, 248, 248);
    pdf.rect(14, y, pageWidth - 28, 8, "F");
    pdf.setTextColor(80, 80, 80);
    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "normal");
    pdf.text("TOTAL IVA PAGADO", 17, y + 5.5);
    pdf.text(
      `CRC ${totalIVA.toLocaleString("es-CR")}`,
      pageWidth - 14, y + 5.5, { align: "right" }
    );
    y += 10;

    // Línea separadora
    pdf.setDrawColor(30, 30, 30);
    pdf.setLineWidth(0.5);
    pdf.line(14, y, pageWidth - 14, y);
    y += 6;

    // Total general
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
        `InvoiceScan · Reporte de Gastos · ${fecha} · Pagina ${i} de ${pageCount}`,
        pageWidth / 2, 290, { align: "center" }
      );
    }

    pdf.save(`reporte-gastos-${fecha}.pdf`);
  };

  return (
    <Layout title="Dashboard">
      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            Bienvenido, {user?.name}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: 4 }}>
            Resumen de tus gastos registrados
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-secondary" onClick={downloadPDF}>
            <FilePdf size={16} />
            Reporte PDF
          </button>
          <button className="btn-primary" onClick={() => navigate("/upload")}>
            <UploadSimple size={16} />
            Subir factura
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <p className="stat-label">Total gastado</p>
          <p className="stat-value accent">
            ₡{stats?.totalSpent?.toLocaleString("es-CR") || "0"}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
            <TrendUp size={14} color="var(--green-500)" />
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Este período</span>
          </div>
        </div>
        <div className="stat-card">
          <p className="stat-label">Facturas procesadas</p>
          <p className="stat-value">{invoices.length}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>documentos escaneados</span>
          </div>
        </div>
        <div className="stat-card">
          <p className="stat-label">Categorías</p>
          <p className="stat-value">{stats?.byCategory?.length || 0}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>tipos de gasto</span>
          </div>
        </div>
      </div>

      {/* Chart + Recent */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>

        {/* Pie chart */}
        <div className="card">
          <p className="section-header">Gastos por categoría</p>
          {chartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} innerRadius={45} dataKey="value">
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`₡${value.toLocaleString("es-CR")}`, "Total"]}
                    contentStyle={{ background: "white", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {chartData.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: "0.82rem", color: "var(--text-secondary)" }}>{item.name}</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      ₡{item.value.toLocaleString("es-CR")}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Sube tu primera factura para ver estadísticas
            </div>
          )}
        </div>

        {/* Recent invoices */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p className="section-header" style={{ margin: 0 }}>Facturas recientes</p>
            {invoices.length > 0 && (
              <button className="btn-ghost" style={{ fontSize: "0.78rem", padding: "4px 8px" }} onClick={() => navigate("/history")}>
                Ver todas
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: 56, borderRadius: 8, background: "var(--gray-100)", animation: "pulse 1.5s infinite" }} />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              No hay facturas aún
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {invoices.slice(0, 5).map((inv, i) => (
                <div key={inv._id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 0",
                  borderBottom: i < Math.min(invoices.length, 5) - 1 ? "1px solid var(--border)" : "none",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {inv.vendor || "Sin nombre"}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                      <span className="badge badge-green">{inv.category}</span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{inv.date || "—"}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--green-800)", whiteSpace: "nowrap", marginLeft: 12 }}>
                    ₡{inv.amount?.toLocaleString("es-CR") || "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Layout>
  );
}