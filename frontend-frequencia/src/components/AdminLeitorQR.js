import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const corPrimaria = "#0479B3";

export default function AdminLeitorQR({ onLogout }) {
  const [mensagem, setMensagem] = useState("");
  const [ultimoLido, setUltimoLido] = useState("");
  const qrRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    const qrDivId = "qr-reader";
    if (!qrRef.current) return;

    html5QrCodeRef.current = new Html5Qrcode(qrDivId);

    html5QrCodeRef.current
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          if (decodedText === ultimoLido) {
            setMensagem("⚠️ Já leu este funcionário agora há pouco!");
            return;
          }
          setUltimoLido(decodedText);
          setMensagem("Lendo QR Code...");

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
            } else if (
              resp.mensagem &&
              resp.mensagem.toLowerCase().includes("já registrada")
            ) {
              setMensagem("⚠️ Frequência já registrada para este funcionário.");
            } else {
              setMensagem(resp.mensagem || "Erro ao registrar presença.");
            }
          } catch (e) {
            setMensagem("Erro de conexão com o servidor.");
          }

          setTimeout(() => {
            setMensagem("");
            setUltimoLido(""); 
            html5QrCodeRef.current && html5QrCodeRef.current.resume();
          }, 3500);

          html5QrCodeRef.current.pause();
        },
        (errorMessage) => {}
      )
      .catch((err) => {
        setMensagem("Erro ao acessar câmera: " + err);
      });

    return () => {
      html5QrCodeRef.current &&
        html5QrCodeRef.current
          .stop()
          .then(() => html5QrCodeRef.current.clear())
          .catch(() => {});
    };
  }, [ultimoLido]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f8fa",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 38
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 2px 16px #0001",
          padding: 30,
          width: "100%",
          maxWidth: 420,
          textAlign: "center"
        }}
      >
        <h2 style={{ color: corPrimaria, fontWeight: 700 }}>
          Leitura de Frequência
        </h2>
        <div
          id="qr-reader"
          ref={qrRef}
          style={{
            width: "100%",
            maxWidth: 320,
            margin: "0 auto 20px auto",
            borderRadius: 12,
            overflow: "hidden",
            background: "#fafbfc"
          }}
        />
        <div
          style={{
            marginTop: 18,
            fontWeight: "bold",
            fontSize: 17,
            color: "#444"
          }}
        >
          {mensagem}
        </div>
        <button
          onClick={onLogout}
          style={{
            marginTop: 22,
            background: "#f5f8fa",
            color: corPrimaria,
            border: "none",
            padding: "9px 20px",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 500,
            fontSize: 16,
            boxShadow: "0 1px 3px #0001"
          }}
        >
          Sair do Painel
        </button>
      </div>
    </div>
  );
}
