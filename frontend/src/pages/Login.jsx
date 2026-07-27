import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Receipt, EnvelopeSimple, LockSimple, ArrowRight } from "@phosphor-icons/react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Panel izquierdo */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <Receipt size={28} color="white" weight="fill" />
            </div>
            <div>
              <p className="auth-brand-name">InvoiceScan</p>
              <p className="auth-brand-sub">Gestión inteligente de gastos</p>
            </div>
          </div>

          <div className="auth-left-content">
            <h2 className="auth-left-title">Tus finanzas,<br />bajo control.</h2>
            <p className="auth-left-desc">
              Escanea facturas, organiza tus gastos y genera reportes profesionales en segundos.
            </p>
            <div className="auth-feature-list">
              {["OCR automático de facturas", "Categorización inteligente", "Reportes PDF exportables"].map((f) => (
                <div key={f} className="auth-feature-item">
                  <div className="auth-feature-dot" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="auth-right">
        <div className="auth-form-card">
          <div style={{ marginBottom: 32 }}>
            <h1 className="auth-form-title">Iniciar sesión</h1>
            <p className="auth-form-sub">Ingresa tus credenciales para continuar</p>
          </div>

          {error && (
            <div className="auth-error-box">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field-group">
              <label className="input-label">Correo electrónico</label>
              <div className="auth-input-wrap">
                <EnvelopeSimple size={16} color="var(--gray-400)" className="auth-input-icon" />
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

            <div className="auth-field-group">
              <label className="input-label">Contraseña</label>
              <div className="auth-input-wrap">
                <LockSimple size={16} color="var(--gray-400)" className="auth-input-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: 40 }}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8, padding: "13px 20px" }} disabled={loading}>
              {loading ? "Verificando..." : (
                <>Ingresar <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="auth-switch-text">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="auth-switch-link">Crear cuenta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
