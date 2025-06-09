import React, { useState } from "react";

export default function LoginForm({ onLogin, erro }) {
  const [cpf, setCpf] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onLogin({ cpf });
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: "0 auto", padding: 24 }}>
      <h2>Identifique-se</h2>
      <input
        placeholder="CPF (somente números)"
        value={cpf}
        onChange={e => setCpf(e.target.value.replace(/\D/g, ""))}
        maxLength={11}
        style={{ width: "100%", padding: 10, margin: "8px 0" }}
        required
      />
      {erro && <div style={{ color: "red" }}>{erro}</div>}
      <button type="submit" style={{ width: "100%", padding: 12 }}>Entrar</button>
    </form>
  );
}
