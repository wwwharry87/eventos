import React, { useState } from "react";

const corPrimaria = "#0479B3";

export default function AdminLogin({ onLogin, onVoltar }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onLogin(usuario, senha);
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
        <h2 style={{ color: corPrimaria, fontWeight: 700, marginBottom: 12 }}>
          Acesso do Administrador
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Usuário"
            value={usuario}
            onChange={e => setUsuario(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 10px",
              fontSize: 16,
              borderRadius: 8,
              border: "1px solid #e0e0e0",
              marginBottom: 12
            }}
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 10px",
              fontSize: 16,
              borderRadius: 8,
              border: "1px solid #e0e0e0",
              marginBottom: 18
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
        <button
          onClick={onVoltar}
          style={{
            marginTop: 16,
            background: "#f5f8fa",
            color: corPrimaria,
            border: "none",
            padding: "7px 18px",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 500,
            fontSize: 15
          }}
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
