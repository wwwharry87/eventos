import React, { useState } from "react";

const corPrimaria = "#0479B3";

export default function LoginForm({ onLogin, erro }) {
  const [cpf, setCpf] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!cpf) return;
    onLogin({ cpf });
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
          padding: 36,
          minWidth: 300,
          maxWidth: 350,
          textAlign: "center"
        }}
      >
        <h2 style={{ color: corPrimaria, fontWeight: 700, marginBottom: 8 }}>
          4ª Edição do Encontro<br />do Educacenso de Marabá-PA
        </h2>
        <p style={{ color: "#444", margin: "14px 0 18px" }}>
          Identifique-se para participar do evento
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Digite seu CPF"
            maxLength={11}
            value={cpf}
            onChange={(e) => setCpf(e.target.value.replace(/\D/g, ""))}
            style={{
              width: "100%",
              padding: "12px 10px",
              fontSize: 16,
              borderRadius: 8,
              border: "1px solid #e0e0e0",
              marginBottom: 18,
              outline: "none"
            }}
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
              padding: "11px 0",
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
