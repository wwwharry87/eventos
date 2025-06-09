import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function TelaQRCodeEntrada({ funcionario }) {
  const [presencaConfirmada, setPresencaConfirmada] = useState(false);

  // Faz polling para saber se a presença foi registrada
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`https://eventos-wi35.onrender.com/api/checar-frequencia?cpf=${funcionario.cpf}&tipo=entrada`);
      const data = await res.json();
      if (data.confirmada) {
        setPresencaConfirmada(true);
        clearInterval(interval);
      }
    }, 3000); // checa a cada 3 segundos

    return () => clearInterval(interval);
  }, [funcionario.cpf]);

  if (presencaConfirmada) {
    return (
      <div style={{ textAlign: "center", padding: 32 }}>
        <h2>Presença confirmada!</h2>
        <p>Bem-vindo ao evento.<br />Aproveite as atividades e siga as instruções abaixo.</p>
        {/* aqui pode colocar informações do evento */}
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: 32 }}>
      <h2>Bem-vindo(a), {funcionario.nome}!</h2>
      <p>Mostre este QR Code para registrar sua entrada no evento:</p>
      <QRCodeSVG value={funcionario.qrcode_id + "-entrada"} size={180} />
      <p style={{ color: "#888", marginTop: 16 }}>Aguarde confirmação da leitura.</p>
    </div>
  );
}
