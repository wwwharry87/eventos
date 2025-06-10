import React, { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import CarrosselFrequencia from "./components/CarrosselFrequencia";
import AdminLogin from "./components/AdminLogin";
import AdminLeitorQR from "./components/AdminLeitorQR";

export default function App() {
  const [pagina, setPagina] = useState("login");
  const [funcionario, setFuncionario] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const errorHandler = (error) => {
      console.error('Erro capturado:', error);
      setError('Ocorreu um erro inesperado');
    };
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  const handleFuncionarioLogin = (dadosFuncionario) => {
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

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{color: '#E53E3E'}}>Erro</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            background: '#0479B3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginTop: '20px'
          }}
        >
          Recarregar Aplicativo
        </button>
      </div>
    );
  }

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
