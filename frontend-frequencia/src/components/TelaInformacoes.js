export default function TelaInformacoes() {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 24 }}>
        <h3>Informações do Evento</h3>
        <p><b>Data:</b> 11 de junho de 2024</p>
        <p><b>Local:</b> [Nome do Local do Evento]</p>
        <p>Leia atentamente as orientações e, em caso de dúvida, procure a equipe organizadora.</p>
        <ul style={{ textAlign: "left", margin: "16px 0" }}>
          <li>Traga seu documento com foto.</li>
          <li>Respeite o horário de entrada e saída.</li>
          <li>Utilize este app sempre que solicitado.</li>
        </ul>
      </div>
    );
  }
  