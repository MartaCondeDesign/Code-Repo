import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "@fontsource/opendyslexic/400.css";
import "@fontsource/opendyslexic/700.css";
import "@xyflow/react/dist/style.css";
import "./map.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "32px", fontFamily: "sans-serif", color: "#1e293b", maxWidth: "600px", margin: "40px auto", background: "#ffffff", borderRadius: "12px", border: "1px solid #cbd5e1", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}>
          <h2 style={{ color: "#dc2626", marginTop: 0 }}>Error en la aplicación</h2>
          <p style={{ fontSize: "14px", color: "#475569" }}>Se ha producido un error inesperado al renderizar la interfaz:</p>
          <pre style={{ background: "#f8fafc", padding: "12px", borderRadius: "6px", fontSize: "12px", color: "#b91c1c", overflowX: "auto" }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => {
              window.localStorage.clear();
              window.location.reload();
            }}
            style={{ background: "#2563eb", color: "#ffffff", border: 0, padding: "10px 18px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", marginTop: "12px" }}
          >
            Limpiar datos de sesión y reiniciar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
