import React, { useState } from "react";

const corPrimaria = "#0479B3";

export default function AdminLogin({ onLogin, onVoltar }) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Defina a senha que quiser!
  const SENHA_ADMIN = "educacenso2024";

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    setTimeout(() => {
      if (senha === SENHA_ADMIN) {
        onLogin();
      } else {
        setErro("Senha inválida.");
      }
      setCarregando(false);
    }, 500);
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#f5f8fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "env(safe-area-inset-top) 2vw env(safe-area-inset-bottom) 2vw",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 2px 18px #0002",
          padding: "7vw 7vw 5vw 7vw",
          maxWidth: 350,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        autoComplete="off"
      >
        <h2 style={{
          fontSize: "clamp(16px,4vw,24px)",
          color: corPrimaria,
          marginBottom: 20,
          fontWeight: 700,
        }}>
          Área do Administrador
        </h2>
        <label style={{ width: "100%", marginBottom: 8, fontWeight: 500 }}>
          Senha:
        </label>
        <input
          type="password"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          placeholder="Digite a senha"
          required
          style={{
            width: "100%",
            fontSize: 18,
            padding: "12px 10px",
            border: "1px solid #bbb",
            borderRadius: 8,
            outline: "none",
            marginBottom: 20,
            background: "#f5f8fa",
            color: "#222",
          }}
        />
        <button
          type="submit"
          disabled={carregando}
          style={{
            width: "100%",
            background: corPrimaria,
            color: "#fff",
            fontWeight: 700,
            fontSize: 18,
            border: "none",
            borderRadius: 8,
            padding: "12px 0",
            marginBottom: 10,
            cursor: carregando ? "not-allowed" : "pointer",
            transition: "background 0.2s",
            boxShadow: "0 1px 6px #0001",
          }}
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
        {erro && (
          <div style={{ color: "#d32f2f", margin: "8px 0", fontWeight: 500 }}>
            {erro}
          </div>
        )}
        <button
          type="button"
          onClick={onVoltar}
          style={{
            marginTop: 16,
            fontSize: 14,
            background: "none",
            color: corPrimaria,
            border: "none",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Voltar
        </button>
      </form>
    </div>
  );
}
