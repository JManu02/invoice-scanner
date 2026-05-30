import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { useInvoices } from "../hooks/useInvoices";

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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.back} onClick={() => navigate("/")}>← Volver</button>
        <h2 style={styles.title}>Subir factura</h2>
      </div>

      <div style={styles.card}>
        {/* Dropzone */}
        <div {...getRootProps()} style={{
          ...styles.dropzone,
          borderColor: isDragActive ? "var(--accent-cyan)" : "var(--border)",
          background: isDragActive ? "var(--accent-cyan-dim)" : "var(--bg-card)",
        }}>
          <input {...getInputProps()} />
          <div style={styles.dropContent}>
            <span style={styles.dropIcon}>📂</span>
            {file ? (
              <p style={styles.fileName}>{file.name}</p>
            ) : (
              <>
                <p style={styles.dropText}>
                  {isDragActive ? "Suelta el archivo aquí" : "Arrastra tu factura aquí"}
                </p>
                <p style={styles.dropSub}>o haz clic para seleccionar · JPG, PNG, PDF</p>
              </>
            )}
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {file && !result && (
          <button style={styles.btn} onClick={handleUpload} disabled={loading}>
            {loading ? "⏳ Procesando con OCR..." : "🔍 Procesar factura"}
          </button>
        )}

        {/* Resultado */}
        {result && (
          <div style={styles.result}>
            <h3 style={styles.resultTitle}>✅ Factura procesada</h3>
            <div style={styles.resultGrid}>
              <ResultRow label="Proveedor" value={result.vendor} />
              <ResultRow label="Monto" value={result.amount ? `₡${result.amount.toLocaleString("es-CR")}` : "—"} />
              <ResultRow label="IVA" value={result.tax ? `₡${result.tax.toLocaleString("es-CR")}` : "—"} />
              <ResultRow label="Fecha" value={result.date || "—"} />
              <ResultRow label="Categoría" value={result.category} accent />
            </div>
            <div style={styles.resultActions}>
              <button style={styles.btn} onClick={() => { setResult(null); setFile(null); }}>
                Subir otra
              </button>
              <button style={{ ...styles.btn, ...styles.btnOutline }} onClick={() => navigate("/history")}>
                Ver historial
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const ResultRow = ({ label, value, accent }) => (
  <div style={rowStyles.row}>
    <span style={rowStyles.label}>{label}</span>
    <span style={{ ...rowStyles.value, color: accent ? "var(--accent-cyan)" : "var(--text-primary)" }}>
      {value}
    </span>
  </div>
);

const rowStyles = {
  row: { display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid var(--border)" },
  label: { color: "var(--text-secondary)", fontSize: "0.9rem" },
  value: { fontWeight: 500, fontSize: "0.9rem" },
};

const styles = {
  container: { minHeight: "100vh", background: "var(--bg-primary)", padding: "1.5rem" },
  header: { display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" },
  back: { background: "transparent", border: "none", color: "var(--accent-cyan)", cursor: "pointer", fontSize: "0.95rem", whiteSpace: "nowrap" },
  title: { fontSize: "1.3rem", fontWeight: 600 },
  card: {
    background: "var(--bg-secondary)", border: "1px solid var(--border)",
    borderRadius: "16px", padding: "1.5rem",
    maxWidth: "600px", margin: "0 auto", width: "100%",
  },
  dropzone: {
    border: "2px dashed", borderRadius: "12px", padding: "2.5rem 1.5rem",
    textAlign: "center", cursor: "pointer", transition: "all 0.2s",
  },
  dropContent: { display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" },
  dropIcon: { fontSize: "2.5rem" },
  dropText: { fontSize: "1rem", fontWeight: 500 },
  dropSub: { color: "var(--text-secondary)", fontSize: "0.82rem" },
  fileName: { fontWeight: 500, color: "var(--accent-cyan)", wordBreak: "break-all" },
  error: {
    background: "rgba(239,68,68,0.1)", border: "1px solid var(--error)",
    color: "var(--error)", padding: "0.75rem 1rem", borderRadius: "8px",
    marginTop: "1rem", fontSize: "0.88rem",
  },
  btn: {
    width: "100%", marginTop: "1.25rem",
    background: "linear-gradient(135deg, var(--accent-violet), var(--accent-cyan))",
    border: "none", borderRadius: "8px", padding: "0.875rem",
    color: "#fff", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer",
  },
  btnOutline: { background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)" },
  result: { marginTop: "1.5rem" },
  resultTitle: { fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--success)" },
  resultGrid: { display: "flex", flexDirection: "column" },
  resultActions: { display: "flex", gap: "0.75rem", flexWrap: "wrap" },
};