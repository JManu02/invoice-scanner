import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Receipt, EnvelopeSimple, LockSimple, User, ArrowRight } from "@phosphor-icons/react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.left}>
        <div style={styles.leftInner}>
          <div style={styles.brand}>
            <div style={styles.brandIcon}>
              <Receipt size={28} color="white" weight="fill" />
            </div>
            <div>
              <p style={styles.brandName}>InvoiceScan</p>
              <p style={styles.brandSub}>Gestión inteligente de gastos</p>
            </div>
          </div>
          <div style={styles.leftContent}>
            <h2 style={styles.leftTitle}>Empieza hoy,<br />sin costo.</h2>
            <p style={styles.leftDesc}>
              Crea tu cuenta y comienza a escanear facturas de forma automática con tecnología OCR.
            </p>
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.formCard}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={styles.formTitle}>Crear cuenta</h1>
            <p style={styles.formSub}>Completa los datos para registrarte</p>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label className="input-label">Nombre completo</label>
              <div style={styles.inputWrap}>
                <User size={16} color="var(--gray-400)" style={styles.inputIcon} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: 40 }}
                  placeholder="Tu nombre"
                  required
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label className="input-label">Correo electrónico</label>
              <div style={styles.inputWrap}>
                <EnvelopeSimple size={16} color="var(--gray-400)" style={styles.inputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: 40 }}
                  placeholder="tu@correo.com"
                  required
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label className="input-label">Contraseña</label>
              <div style={styles.inputWrap}>
                <LockSimple size={16} color="var(--gray-400)" style={styles.inputIcon} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: 40 }}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8, padding: "13px 20px" }} disabled={loading}>
              {loading ? "Creando cuenta..." : (<>Crear cuenta <ArrowRight size={16} /></>)}
            </button>
          </form>

          <p style={styles.switchText}>
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" style={styles.switchLink}>Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: { display: "flex", minHeight: "100dvh" },
  left: { flex: 1, background: "var(--green-800)", display: "flex", flexDirection: "column", padding: "40px 48px" },
  leftInner: { display: "flex", flexDirection: "column", height: "100%", maxWidth: 420 },
  brand: { display: "flex", alignItems: "center", gap: 12, marginBottom: "auto" },
  brandIcon: { width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" },
  brandName: { fontSize: "1.1rem", fontWeight: 700, color: "white", letterSpacing: "-0.02em" },
  brandSub: { fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", marginTop: 2 },
  leftContent: { paddingBottom: 48 },
  leftTitle: { fontSize: "2.5rem", fontWeight: 700, color: "white", letterSpacing: "-0.04em", lineHeight: 1.15, marginBottom: 16 },
  leftDesc: { fontSize: "0.95rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.6 },
  right: { width: "460px", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 32px", background: "var(--bg-app)" },
  formCard: { width: "100%", maxWidth: 380 },
  formTitle: { fontSize: "1.6rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" },
  formSub: { fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: 6 },
  errorBox: { background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", padding: "10px 14px", borderRadius: 8, fontSize: "0.875rem", marginBottom: 20 },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  inputWrap: { position: "relative" },
  inputIcon: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" },
  switchText: { textAlign: "center", marginTop: 24, fontSize: "0.875rem", color: "var(--text-secondary)" },
  switchLink: { color: "var(--green-800)", fontWeight: 600, textDecoration: "none" },
};