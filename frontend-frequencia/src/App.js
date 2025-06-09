import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import TelaQRCodeEntrada from "./components/TelaQRCodeEntrada";
import AdminLogin from "./components/AdminLogin";
import AdminLeitorQR from "./components/AdminLeitorQR";

function App() {
  // Estados para controle do fluxo
  const [funcionario, setFuncionario] = useState(null);
  const [erro, setErro] = useState("");
  const [adminLogado, setAdminLogado] = useState(false);
  const [mostrarAdminLogin, setMostrarAdminLogin] = useState(false);

  // Função de login do funcionário (apenas CPF)
  async function handleLogin({ cpf }) {
    setErro("");
    try {
      const response = await fetch("https://eventos-wi35.onrender.com/api/funcionario-cpf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf }),
      });
      const data = await response.json();
      if (response.ok) {
        setFuncionario(data);
        localStorage.setItem("funcionario", JSON.stringify(data));
      } else {
        setErro(data.mensagem || "Erro ao autenticar");
      }
    } catch (e) {
      setErro("Erro de conexão com o servidor");
    }
  }

  // Mantém login do funcionário na sessão
  React.useEffect(() => {
    const salvo = localStorage.getItem("funcionario");
    if (salvo) {
      setFuncionario(JSON.parse(salvo));
    }
  }, []);

  function handleLogout() {
    setFuncionario(null);
    localStorage.removeItem("funcionario");
  }

  // Função de login do admin
  function handleAdminLogin(usuario, senha) {
    // Pode trocar para buscar do backend se quiser mais segurança
    if (usuario === "admin" && senha === "123456") {
      setAdminLogado(true);
      setMostrarAdminLogin(false);
    } else {
      alert("Usuário ou senha incorretos!");
    }
  }

  function handleAdminLogout() {
    setAdminLogado(false);
  }

  // Renderiza painel do admin se logado
  if (adminLogado) return <AdminLeitorQR onLogout={handleAdminLogout} />;

  // Renderiza tela de login admin se ativado
  if (mostrarAdminLogin)
    return (
      <AdminLogin
        onLogin={handleAdminLogin}
        onVoltar={() => setMostrarAdminLogin(false)}
      />
    );

  // Renderiza tela de funcionário (login ou QR)
  return (
    <div style={{ minHeight: "100vh", background: "#f5f6fa", position: "relative" }}>
      {!funcionario ? (
        <>
          <LoginForm onLogin={handleLogin} erro={erro} />
          <button
            onClick={() => setMostrarAdminLogin(true)}
            style={{
              position: "absolute",
              bottom: 20,
              right: 20,
              padding: "8px 20px",
              background: "#222",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              zIndex: 99
            }}
          >
            Sou Administrador
          </button>
        </>
      ) : (
        <TelaQRCodeEntrada funcionario={funcionario} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
