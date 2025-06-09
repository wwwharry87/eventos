import React, { useState } from "react";
import LoginForm from "././components/LoginForm";
import CarrosselFrequencia from "././components/CarrosselFrequencia";
import AdminLogin from "././components/AdminLogin";
import AdminLeitorQR from "././components/AdminLeitorQR";

function App() {
  const [pagina, setPagina] = useState("login");
  const [funcionario, setFuncionario] = useState(null);
  const [admin, setAdmin] = useState(false);

  // LOGIN FUNCIONÁRIO
  const handleLogin = (dadosFuncionario) => {
    setFuncionario(dadosFuncionario);
    setPagina("carrossel");
  };

  // LOGOUT
  const handleLogout = () => {
    setFuncionario(null);
    setAdmin(false);
    setPagina("login");
  };

  // LOGIN ADMIN
  const handleAdminLogin = () => {
    setAdmin(true);
    setPagina("admin");
  };

  // LOGOUT ADMIN
  const handleAdminLogout = () => {
    setAdmin(false);
    setPagina("login");
  };

  // Renderização condicional
  if (pagina === "login")
    return (
      <LoginForm
        onLogin={handleLogin}
        onAdminClick={() => setPagina("admin-login")}
      />
    );

  if (pagina === "carrossel")
    return (
      <CarrosselFrequencia funcionario={funcionario} onLogout={handleLogout} />
    );

  if (pagina === "admin-login")
    return <AdminLogin onLogin={handleAdminLogin} onVoltar={() => setPagina("login")} />;

  if (pagina === "admin")
    return <AdminLeitorQR onLogout={handleAdminLogout} />;

  return <div>Algo deu errado. Tente novamente.</div>;
}

export default App;
