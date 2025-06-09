import React, { useState } from "react";
import QrReader from "react-qr-barcode-scanner";

export default function AdminLeitorQR() {
  const [data, setData] = useState("");
  const [mensagem, setMensagem] = useState("");

  // Função para lidar quando um QR code é lido
  const handleScan = async (result) => {
    if (!result) return;
    if (result.text === data) return; // evita múltiplas leituras iguais
    setData(result.text);

    setMensagem("Lendo QR Code...");

    // Esperado: qrcode_id-tipo (ex: 12345678900-entrada)
    const [qrcode_id, tipoLido] = result.text.split("-");

    try {
      const res = await fetch("https://eventos-wi35.onrender.com/api/frequencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrcode_id,
          tipo: tipoLido || "entrada",
        }),
      });
      const resp = await res.json();
      if (res.ok) {
        setMensagem(`✅ Presença confirmada de ${resp.nome}!`);
      } else {
        setMensagem(resp.mensagem || "Erro ao registrar presença.");
      }
    } catch (e) {
      setMensagem("Erro de conexão com o servidor.");
    }

    // Reseta para permitir nova leitura após alguns segundos
    setTimeout(() => {
      setMensagem("");
      setData("");
    }, 3500);
  };

  return (
    <div style={{ padding: 24, maxWidth: 420, margin: "0 auto" }}>
      <h2>Painel do Administrador</h2>
      <p>Aponte a câmera para o QR Code do participante:</p>
      <div style={{ maxWidth: 350, margin: "0 auto" }}>
        <QrReader
          onUpdate={handleScan}
          constraints={{ facingMode: "environment" }}
          style={{ width: "100%", borderRadius: 10 }}
        />
      </div>
      <div style={{ marginTop: 24, fontWeight: "bold", minHeight: 30 }}>
        {mensagem}
      </div>
    </div>
  );
}
