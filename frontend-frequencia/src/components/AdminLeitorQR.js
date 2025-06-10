import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { FaSignOutAlt } from "react-icons/fa";

function playBeep(frequency = 1100, duration = 100) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = frequency;
    o.start();
    g.gain.setValueAtTime(0.17, ctx.currentTime);
    setTimeout(() => {
      o.stop();
      ctx.close();
    }, duration);
  } catch (err) {}
}

// Utilitário para parsear o QR
function parseQR(text) {
  if (!text) return { qrcode_id: null, tipo: null };
  const match = text.match(/^(\d{11,14})(?:-(entrada|saida|saída))?$/i);
  if (match) {
    return {
      qrcode_id: match[1],
      tipo: match[2] ? match[2].toLowerCase() : "entrada",
    };
  }
  return { qrcode_id: text.replace(/\D/g, ""), tipo: "entrada" };
}

export default function AdminLeitorQR({ onLogout }) {
  const [status, setStatus] = useState("PRONTO");
  const [erro, setErro] = useState(null);
  const [resultado, setResultado] = useState(null);
  const scannerRef = useRef();

  function iniciarCamera() {
    setErro(null);
    setResultado(null);
    setStatus("PRONTO");

    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
    }

    const html5QrcodeScanner = new Html5QrcodeScanner(
      "reader",
      { fps: 12, qrbox: 230, disableFlip: false },
      false
    );
    scannerRef.current = html5QrcodeScanner;

    html5QrcodeScanner.render(
      async (decodedText) => {
        await handleDecodedText(decodedText);
      },
      (err) => {}
    );
  }

  useEffect(() => {
    iniciarCamera();
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
    // eslint-disable-next-line
  }, []);

  async function handleDecodedText(decodedText) {
    if (status !== "PRONTO" && status !== "LENDO") return;
    setStatus("LENDO");
    const { qrcode_id, tipo } = parseQR(decodedText);

    if (!qrcode_id) {
      setStatus("ERRO");
      setErro("QR Code inválido: ID não encontrado.");
      setTimeout(() => iniciarCamera(), 1400);
      return;
    }

    const tiposValidos = ["entrada", "saida", "saída"];
    const tipoFinal = tipo && tiposValidos.includes(tipo) ? tipo : "entrada";

    try {
      const res = await fetch("https://eventos-wi35.onrender.com/api/frequencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrcode_id, tipo: tipoFinal }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("ERRO");
        setErro(data.mensagem || `Erro ${res.status} ao registrar`);
        setTimeout(() => iniciarCamera(), 1700);
        return;
      }

      setResultado({ ...data, tipo: tipoFinal });
      setStatus("SUCESSO");
      if (navigator.vibrate) navigator.vibrate([110, 30, 70]);
      playBeep(1200, 120);

      setTimeout(() => iniciarCamera(), 1200);
    } catch (err) {
      setStatus("ERRO");
      setErro("Erro de rede: " + err.message);
      setTimeout(() => iniciarCamera(), 1800);
    }
  }

  function renderResultado() {
    if (!resultado) return null;
    return (
      <div style={{
        background: "#e5f8ec",
        border: "2px solid #36b37e",
        borderRadius: "16px",
        padding: "14px 0 10px",
        margin: "16px auto 0",
        width: 265,
        textAlign: "center",
        color: "#195e36",
        fontWeight: 600
      }}>
        <div style={{ fontSize: 16, marginBottom: 2 }}>
          {resultado.tipo === "saida" || resultado.tipo === "saída"
            ? "Saída registrada!"
            : "Entrada registrada!"}
        </div>
        <div style={{ fontSize: 17, margin: "5px 0 0" }}>
          {resultado.nome}
        </div>
        <div style={{ fontSize: 13, opacity: 0.67 }}>
          {resultado.data_hora && new Date(resultado.data_hora).toLocaleString("pt-BR", { hour12: false })}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <header style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        background: "rgba(4,121,179,0.13)",
        boxSizing: "border-box"
      }}>
        <div style={{
          fontWeight: "bold",
          fontSize: 19,
          color: "#0479b3",
          letterSpacing: 1.2,
          marginLeft: 6
        }}>
          Frequência - ADMIN
        </div>
        <button
          onClick={onLogout}
          style={{
            background: "none",
            border: "none",
            color: "#0479b3",
            fontSize: 26,
            cursor: "pointer",
            padding: 7,
            marginRight: 3
          }}
          title="Sair"
        >
          <FaSignOutAlt />
        </button>
      </header>

      <div style={{
        fontWeight: 600,
        fontSize: 21,
        color: "#222",
        margin: "22px 0 16px"
      }}>
        Leitor de QR Code
      </div>

      <div
        id="reader"
        style={{
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: "#f2f7fa",
          boxShadow: "0 2px 16px #0479b333",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          marginBottom: 17
        }}
      ></div>

      {status === "SUCESSO" && renderResultado()}

      {erro && (
        <div style={{
          color: "#b3261e",
          background: "#fff6f4",
          border: "1.5px solid #fce5e3",
          borderRadius: 12,
          padding: "13px 15px",
          marginTop: 12,
          fontWeight: 500,
          width: 265,
          textAlign: "center"
        }}>
          {erro}
        </div>
      )}

      {status === "PRONTO" && (
        <div style={{
          color: "#0479b3",
          marginTop: 10,
          fontSize: 15,
          textAlign: "center"
        }}>
          Aponte a câmera para o QR Code do funcionário.<br />
          O registro aparecerá automaticamente!
        </div>
      )}
      {status === "LENDO" && (
        <div style={{
          color: "#0479b3",
          marginTop: 11,
          fontSize: 16
        }}>
          Lendo QR Code...
        </div>
      )}
    </div>
  );
}
