// src/components/AdminLeitorQR.js

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function AdminLeitorQR() {
  const [mensagem, setMensagem] = useState("");
  const qrRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    const qrDivId = "qr-reader";
    if (!qrRef.current) return;

    // Cria a instância só uma vez
    html5QrCodeRef.current = new Html5Qrcode(qrDivId);

    html5QrCodeRef.current
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250,
        },
        async (decodedText) => {
          setMensagem("Lendo QR Code...");
          // Esperado: qrcode_id-tipo
          const [qrcode_id, tipoLido] = decodedText.split("-");

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

          // Aguarda alguns segundos antes de permitir nova leitura
          setTimeout(() => {
            setMensagem("");
            html5QrCodeRef.current && html5QrCodeRef.current.resume();
          }, 3500);

          // Pausa para não ler várias vezes em seguida
          html5QrCodeRef.current.pause();
        },
        (errorMessage) => {
          // Ignorar erros normais de leitura
        }
      )
      .catch((err) => {
        setMensagem("Erro ao acessar câmera: " + err);
      });

    // Limpa na desmontagem do componente
    return () => {
      html5QrCodeRef.current &&
        html5QrCodeRef.current
          .stop()
          .then(() => html5QrCodeRef.current.clear())
          .catch(() => {});
    };
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 420, margin: "0 auto" }}>
      <h2>Painel do Administrador</h2>
      <p>Aponte a câmera para o QR Code do participante:</p>
      <div
        id="qr-reader"
        ref={qrRef}
        style={{
          width: "100%",
          maxWidth: 320,
          margin: "0 auto",
          borderRadius: 12,
          overflow: "hidden",
        }}
      />
      <div style={{ marginTop: 24, fontWeight: "bold", minHeight: 30 }}>
        {mensagem}
      </div>
    </div>
  );
}
