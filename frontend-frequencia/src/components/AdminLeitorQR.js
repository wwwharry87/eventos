// src/components/AdminLeitorQR.js
import React, { useState } from "react";
import { useZxing } from "react-zxing";

export default function AdminLeitorQR() {
  const [mensagem, setMensagem] = useState("");
  const [ultimoQR, setUltimoQR] = useState("");
  const [tipo, setTipo] = useState("entrada");

  const onDecode = async (result) => {
    if (result === ultimoQR) return;
    setUltimoQR(result);

    setMensagem("Lendo QR Code...");
    const [qrcode_id, tipoLido] = result.split("-");
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
    setTimeout(() => {
      setMensagem("");
      setUltimoQR("");
    }, 3500);
  };

  const { ref } = useZxing({
    onDecode,
    paused: false,
  });

  return (
    <div style={{ padding: 24, maxWidth: 420, margin: "0 auto" }}>
      <h2>Painel do Administrador</h2>
      <p>Aponte a câmera para o QR Code do participante:</p>
      <div style={{ maxWidth: 350, margin: "0 auto" }}>
        <video ref={ref} style={{ width: "100%", borderRadius: 10 }} />
      </div>
      <div style={{ marginTop: 24, fontWeight: "bold", minHeight: 30 }}>{mensagem}</div>
    </div>
  );
}
