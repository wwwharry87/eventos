import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import CarrosselFrequencia from "./components/CarrosselFrequencia";
import AdminLogin from "./components/AdminLogin";
import AdminLeitorQR from "./components/AdminLeitorQR";

export default function App() {
  // Estados principais
  const [pagina, setPagina] = useState("login");
  const [funcionario, setFuncionario] = useState(null);

  // Login de funcionário comum
  const handleFuncionarioLogin = (dadosFuncionario) => {
    setFuncionario(dadosFuncionario);
    setPagina("carrossel");
  };

  // Logout geral
  const handleLogout = () => {
    setFuncionario(null);
    setPagina("login");
  };

  // Login admin
  const handleAdminLogin = () => {
    setPagina("admin");
  };

  // Logout admin
  const handleAdminLogout = () => {
    setPagina("login");
  };

  // Renderização condicional por página
  switch (pagina) {
    case "login":
      return (
        <LoginForm
          onLogin={handleFuncionarioLogin}
          onAdminClick={() => setPagina("admin-login")}
        />
      );
    case "carrossel":
      return (
        <CarrosselFrequencia
          funcionario={funcionario}
          onLogout={handleLogout}
        />
      );
    case "admin-login":
      return (
        <AdminLogin
          onLogin={handleAdminLogin}
          onVoltar={() => setPagina("login")}
        />
      );
    case "admin":
      return <AdminLeitorQR onLogout={handleAdminLogout} />;
    default:
      return <div>Algo deu errado. Tente novamente.</div>;
  }
}
