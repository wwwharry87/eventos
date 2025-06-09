import React, { useState } from "react";

export default function AdminLogin({ onLogin, onVoltar }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onLogin(usuario, senha);
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: "80px auto", padding: 24, background: "#fff", borderRadius: 10, boxShadow: "0 2px 12px #0001" }}>
      <h2>Login de Administrador</h2>
      <input
        placeholder="Usuário"
        value={usuario}
        onChange={e => setUsuario(e.target.value)}
        style={{ width: "100%", padding: 10, margin: "8px 0" }}
        required
      />
      <input
        placeholder="Senha"
        type="password"
        value={senha}
        onChange={e => setSenha(e.target.value)}
        style={{ width: "100%", padding: 10, margin: "8px 0" }}
        required
      />
      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <button type="submit" style={{ flex: 1, padding: 10 }}>Entrar</button>
        <button type="button" style={{ flex: 1, padding: 10, background: "#ddd" }} onClick={onVoltar}>Voltar</button>
      </div>
    </form>
  );
}
