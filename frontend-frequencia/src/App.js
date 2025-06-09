import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import CarrosselFrequencia from "./components/CarrosselFrequencia";
import AdminLogin from "./components/AdminLogin";
import AdminLeitorQR from "./components/AdminLeitorQR";

export default function App() {
  const [pagina, setPagina] = useState("login");
  const [funcionario, setFuncionario] = useState(null);

  const handleFuncionarioLogin = (dadosFuncionario) => {
    console.log("Dados do funcionário:", dadosFuncionario); // Adicionado para debug
    setFuncionario(dadosFuncionario);
    setPagina("carrossel");
  };

  const handleLogout = () => {
    setFuncionario(null);
    setPagina("login");
  };

  const handleAdminLogin = () => {
    setPagina("admin");
  };

  const handleAdminLogout = () => {
    setPagina("login");
  };

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