import { FiLogOut } from "react-icons/fi";

export default function TelaBoasVindas({ funcionario, onLogout }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 24, position: "relative" }}>
      <button
        onClick={onLogout}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "none",
          border: "none",
          cursor: "pointer"
        }}
        title="Sair"
      >
        <FiLogOut size={28} color="#2c3e50" />
      </button>
      <h2>Bem-vindo(a), {funcionario.nome}!</h2>
      {funcionario.aniversariante && <p style={{ color: "#f39c12", fontWeight: "bold" }}>🎉 Parabéns, hoje é seu aniversário!</p>}
      <p>Presença confirmada no IV Censo Escolar de Marabá-PA!</p>
    </div>
  );
}
