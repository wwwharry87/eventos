import React, { useState } from "react";
import InputMask from "react-input-mask";

const corPrimaria = "#0479B3";

export default function LoginForm({ onLogin, onAdminClick }) {
  const [cpf, setCpf] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Função para tirar máscara e enviar só números
  const cpfNumerico = cpf.replace(/\D/g, "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    if (cpfNumerico.length !== 11) {
      setErro("CPF inválido.");
      return;
    }
    setCarregando(true);
    try {
      const res = await fetch(
        "https://eventos-wi35.onrender.com/api/funcionario-cpf",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cpf: cpfNumerico }),
        }
      );
      if (!res.ok) throw new Error("Funcionário não encontrado.");
      const funcionario = await res.json();
      onLogin(funcionario);
    } catch (err) {
      setErro("Funcionário não encontrado ou CPF inválido.");
    } finally {
      setCarregando(false);
    }
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
          padding: "6vw 7vw 5vw 7vw",
          maxWidth: 350,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        autoComplete="off"
      >
        <img
          src="https://educacenso.maraba.pa.gov.br/static/media/logo_maraba_educacenso.f84c6cb8.png"
          alt="Logo Evento"
          style={{
            width: 98,
            marginBottom: 14,
            borderRadius: 15,
            background: "#eef",
            boxShadow: "0 2px 8px #0002",
          }}
        />
        <h2 style={{
          fontSize: "clamp(16px,4vw,24px)",
          color: corPrimaria,
          marginBottom: 10,
          fontWeight: 700,
        }}>
          4ª Edição do Encontro<br />do Educacenso de Marabá-PA
        </h2>
        <label style={{ width: "100%", marginBottom: 6, fontWeight: 500 }}>
          CPF do Servidor:
        </label>
        <InputMask
          mask="999.999.999-99"
          maskPlaceholder={null}
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          inputMode="numeric"
          type="tel"
          autoComplete="off"
          pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
          required
          style={{
            width: "100%",
            fontSize: 18,
            padding: "12px 10px",
            border: "1px solid #bbb",
            borderRadius: 8,
            outline: "none",
            marginBottom: 18,
            letterSpacing: 2,
            textAlign: "center",
            background: "#f5f8fa",
            color: "#222",
          }}
        />
        <button
          disabled={carregando}
          type="submit"
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
          {carregando ? "Verificando..." : "Entrar"}
        </button>
        {erro && (
          <div style={{ color: "#d32f2f", margin: "8px 0", fontWeight: 500 }}>
            {erro}
          </div>
        )}
        <button
          type="button"
          onClick={onAdminClick}
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
          Sou Administrador
        </button>
      </form>
    </div>
  );
}
