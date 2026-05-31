import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { useInvoices } from "../hooks/useInvoices";
import Layout from "../components/Layout";
import {
  CloudArrowUp,
  FilePdf,
  CheckCircle,
  Buildings,
  Money,
  Calendar,
  Tag,
  ArrowRight,
} from "@phosphor-icons/react";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const { uploadInvoice } = useInvoices();
  const navigate = useNavigate();

  const onDrop = useCallback((accepted) => {
    setFile(accepted[0]);
    setResult(null);
    setError("");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "application/pdf": [] },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const data = await uploadInvoice(file);
      setResult(data.invoice);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error procesando la factura");
    } finally {
      setLoading(false);
    }
  };

  const resultRows = result ? [
    { icon: Buildings, label: "Proveedor", value: result.vendor || "—" },
    { icon: Money, label: "Monto total", value: result.amount ? `₡${result.amount.toLocaleString("es-CR")}` : "—", accent: true },
    { icon: Money, label: "IVA", value: result.tax ? `₡${result.tax.toLocaleString("es-CR")}` : "—" },
    { icon: Calendar, label: "Fecha", value: result.date || "—" },
    { icon: Tag, label: "Categoría", value: result.category || "—" },
  ] : [];

  return (
    <Layout title="Subir factura">
      <div style={styles.container}>

        {/* Left — dropzone */}
        <div style={styles.left}>
          <div style={styles.leftHeader}>
            <h2 style={styles.title}>Cargar documento</h2>
            <p style={styles.subtitle}>Sube una imagen o PDF de tu factura y el sistema extraerá los datos automáticamente.</p>
          </div>

          <div
            {...getRootProps()}
            style={{
              ...styles.dropzone,
              borderColor: isDragActive ? "var(--green-500)" : file ? "var(--green-400)" : "var(--border)",
              background: isDragActive ? "var(--green-100)" : file ? "var(--green-50)" : "var(--white)",
            }}
          >
            <input {...getInputProps()} />
            <div style={styles.dropContent}>
              {file ? (
                <>
                  <div style={{ ...styles.dropIconWrap, background: "var(--green-100)" }}>
                    <FilePdf size={32} color="var(--green-800)" weight="fill" />
                  </div>
                  <p style={styles.fileName}>{file.name}</p>
                  <p style={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</p>
                </>
              ) : (
                <>
                  <div style={styles.dropIconWrap}>
                    <CloudArrowUp size={32} color={isDragActive ? "var(--green-700)" : "var(--gray-400)"} />
                  </div>
                  <p style={styles.dropTitle}>
                    {isDragActive ? "Suelta el archivo aquí" : "Arrastra tu factura aquí"}
                  </p>
                  <p style={styles.dropSub}>o haz clic para seleccionar</p>
                  <div style={styles.formatBadges}>
                    {["JPG", "PNG", "PDF"].map(f => (
                      <span key={f} style={styles.formatBadge}>{f}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {error && (
            <div style={styles.errorBox}>{error}</div>
          )}

          {file && !result && (
            <button
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "13px", marginTop: 16 }}
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div style={styles.spinner} />
                  Procesando con OCR...
                </>
              ) : (
                <>Procesar factura <ArrowRight size={16} /></>
              )}
            </button>
          )}
        </div>

        {/* Right — result */}
        <div style={styles.right}>
          {!result ? (
            <div style={styles.emptyResult}>
              <div style={styles.emptyIcon}>
                <FilePdf size={40} color="var(--gray-400)" />
              </div>
              <p style={styles.emptyTitle}>Sin resultados aún</p>
              <p style={styles.emptySub}>Sube una factura para ver los datos extraídos aquí</p>
            </div>
          ) : (
            <div>
              <div style={styles.resultHeader}>
                <CheckCircle size={22} color="var(--green-700)" weight="fill" />
                <span style={styles.resultTitle}>Factura procesada</span>
              </div>

              <div style={styles.resultRows}>
                {resultRows.map(({ icon: Icon, label, value, accent }) => (
                  <div key={label} style={styles.resultRow}>
                    <div style={styles.resultRowLeft}>
                      <div style={styles.resultIconWrap}>
                        <Icon size={15} color="var(--green-700)" />
                      </div>
                      <span style={styles.resultLabel}>{label}</span>
                    </div>
                    <span style={{ ...styles.resultValue, color: accent ? "var(--green-800)" : "var(--text-primary)", fontWeight: accent ? 700 : 500 }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => { setResult(null); setFile(null); }}
                >
                  Subir otra
                </button>
                <button
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => navigate("/history")}
                >
                  Ver historial
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </Layout>
  );
}

const styles = {
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 24,
    alignItems: "start",
  },
  left: { display: "flex", flexDirection: "column", gap: 0 },
  leftHeader: { marginBottom: 24 },
  title: { fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" },
  subtitle: { fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.6 },
  dropzone: {
    border: "2px dashed", borderRadius: "var(--radius-lg)",
    padding: "48px 24px", textAlign: "center", cursor: "pointer",
    transition: "all 0.2s",
  },
  dropContent: { display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  dropIconWrap: {
    width: 72, height: 72, borderRadius: "var(--radius-lg)",
    background: "var(--gray-100)",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  dropTitle: { fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" },
  dropSub: { fontSize: "0.82rem", color: "var(--text-secondary)" },
  formatBadges: { display: "flex", gap: 6, marginTop: 4 },
  formatBadge: {
    padding: "3px 10px", borderRadius: 99,
    background: "var(--gray-100)", color: "var(--gray-500)",
    fontSize: "0.72rem", fontWeight: 600,
  },
  fileName: { fontSize: "0.95rem", fontWeight: 600, color: "var(--green-800)" },
  fileSize: { fontSize: "0.78rem", color: "var(--text-secondary)" },
  errorBox: {
    background: "#fef2f2", border: "1px solid #fca5a5",
    color: "#dc2626", padding: "10px 14px",
    borderRadius: "var(--radius-md)", fontSize: "0.875rem", marginTop: 12,
  },
  spinner: {
    width: 16, height: 16, borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    animation: "spin 0.7s linear infinite",
  },
  right: {
    background: "var(--white)", borderRadius: "var(--radius-lg)",
    border: "1px solid var(--border)",
    padding: 28, minHeight: 360,
    display: "flex", flexDirection: "column", justifyContent: "center",
  },
  emptyResult: { textAlign: "center", padding: "24px 0" },
  emptyIcon: {
    width: 80, height: 80, borderRadius: "var(--radius-xl)",
    background: "var(--gray-50)", display: "flex",
    alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
  },
  emptyTitle: { fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" },
  emptySub: { fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.5 },
  resultHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 20 },
  resultTitle: { fontSize: "1rem", fontWeight: 700, color: "var(--green-800)" },
  resultRows: { display: "flex", flexDirection: "column" },
  resultRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "13px 0", borderBottom: "1px solid var(--border)",
  },
  resultRowLeft: { display: "flex", alignItems: "center", gap: 10 },
  resultIconWrap: {
    width: 30, height: 30, borderRadius: 8,
    background: "var(--green-50)", display: "flex",
    alignItems: "center", justifyContent: "center",
  },
  resultLabel: { fontSize: "0.875rem", color: "var(--text-secondary)" },
  resultValue: { fontSize: "0.875rem" },
};