import React, { useState } from "react";
import { QrReader } from "@blackbox-vision/react-qr-reader";

export default function AdminLeitorQR() {
  const [mensagem, setMensagem] = useState("");
  const [ultimoQR, setUltimoQR] = useState("");
  const [tipo, setTipo] = useState("entrada"); // ou "saida"

  // Handler para o resultado do QR
  const handleResult = async (result, error) => {
    if (!!result) {
      const valor = result?.text || result;
      if (valor === ultimoQR) return; // evita processar várias vezes o mesmo QR Code
      setUltimoQR(valor);

      setMensagem("Lendo QR Code...");
      // Espera formato 'QRCODEID-entrada' ou 'QRCODEID-saida'
      const [qrcode_id, tipoLido] = valor.split("-");

      try {
        const res = await fetch("http://localhost:4000/api/frequencia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            qrcode_id,
            tipo: tipoLido || tipo,
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
      // Limpa depois de alguns segundos para ler outro QR
      setTimeout(() => {
        setMensagem("");
        setUltimoQR("");
      }, 3500);
    }
    if (!!error) {
      setMensagem("Erro ao acessar câmera: " + error?.message);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 420, margin: "0 auto" }}>
      <h2>Painel do Administrador</h2>
      <p>Aponte a câmera para o QR Code do participante:</p>
      <div style={{ maxWidth: 350, margin: "0 auto" }}>
        <QrReader
          constraints={{ facingMode: "environment" }}
          onResult={handleResult}
          style={{ width: "100%" }}
        />
      </div>
      <div style={{ marginTop: 24, fontWeight: "bold", minHeight: 30 }}>{mensagem}</div>
    </div>
  );
}
