import React, { useState } from "react";
import InputMask from "react-input-mask";

// Importe o logo se já tiver em src/assets/logo.png
// import logoEvento from "../assets/logo.png";

const corPrimaria = "#0479B3";

export default function LoginForm({ onLogin, erro }) {
  const [cpf, setCpf] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const cpfNumerico = cpf.replace(/\D/g, "");
    if (cpfNumerico.length !== 11) {
      alert("CPF inválido!");
      return;
    }
    onLogin({ cpf: cpfNumerico });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f8fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 2px 16px #0001",
          padding: 32,
          minWidth: 300,
          maxWidth: 370,
          textAlign: "center"
        }}
      >
        {/* Logo do evento - ajuste o src se salvar no projeto */}
        <img
          src="/logo-evento.png"
          alt="Logo do Evento"
          style={{
            maxWidth: 140,
            marginBottom: 18,
            borderRadius: 12,
            boxShadow: "0 2px 10px #0002"
          }}
        />

        <h2 style={{ color: corPrimaria, fontWeight: 700, marginBottom: 10, lineHeight: 1.25 }}>
          4ª Edição do Encontro<br />
          do Educacenso de Marabá-PA
        </h2>
        <p style={{ color: "#444", margin: "10px 0 20px" }}>
          Identifique-se para participar do evento
        </p>
        <form onSubmit={handleSubmit}>
          <InputMask
            mask="999.999.999-99"
            maskChar=""
            type="tel"
            inputMode="numeric"
            pattern="\d*"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={e => setCpf(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 10px",
              fontSize: 19,
              borderRadius: 8,
              border: "1px solid #e0e0e0",
              marginBottom: 18,
              textAlign: "center",
              outline: "none",
              letterSpacing: 2,
            }}
            autoFocus
            required
            maxLength={14}
          />
          <button
            type="submit"
            style={{
              background: corPrimaria,
              color: "#fff",
              fontWeight: 600,
              fontSize: 17,
              border: "none",
              borderRadius: 8,
              padding: "12px 0",
              width: "100%",
              boxShadow: "0 1px 5px #0001",
              cursor: "pointer"
            }}
          >
            Entrar
          </button>
        </form>
        {erro && (
          <div
            style={{
              color: "#d32f2f",
              marginTop: 18,
              background: "#fff6f6",
              padding: 8,
              borderRadius: 6,
              fontSize: 14
            }}
          >
            {erro}
          </div>
        )}
      </div>
      <footer style={{ textAlign: "center", fontSize: 12, color: "#aac", marginTop: 28 }}>
        © {new Date().getFullYear()} Prefeitura de Marabá — Educacenso
      </footer>
    </div>
  );
}
