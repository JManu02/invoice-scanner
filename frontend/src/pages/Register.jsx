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
    <div className="auth-root">
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
            <h2 className="auth-left-title">Empieza hoy,<br />sin costo.</h2>
            <p className="auth-left-desc">
              Crea tu cuenta y comienza a escanear facturas de forma automática con tecnología OCR.
            </p>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-card">
          <div style={{ marginBottom: 32 }}>
            <h1 className="auth-form-title">Crear cuenta</h1>
            <p className="auth-form-sub">Completa los datos para registrarte</p>
          </div>

          {error && <div className="auth-error-box">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field-group">
              <label className="input-label">Nombre completo</label>
              <div className="auth-input-wrap">
                <User size={16} color="var(--gray-400)" className="auth-input-icon" />
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

          <p className="auth-switch-text">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="auth-switch-link">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
