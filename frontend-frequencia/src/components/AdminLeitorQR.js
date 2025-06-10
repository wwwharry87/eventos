import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { FaSignOutAlt } from "react-icons/fa";

// Função para tocar um beep
function playBeep(frequency = 900, duration = 100) {
  if (window.AudioContext || window.webkitAudioContext) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = frequency;
    o.start();
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    setTimeout(() => {
      o.stop();
      ctx.close();
    }, duration);
  }
}

// Função utilitária para parsear o QR code (espera formato: qrcode_id-tipo)
function parseQR(text) {
  if (!text) return { qrcode_id: null, tipo: null };
  const match = text.match(/^(\d{11,14})(?:-(entrada|saida|saída))?$/i);
  if (match) {
    return {
      qrcode_id: match[1],
      tipo: match[2] ? match[2].toLowerCase() : "entrada",
    };
  }
  // Se não bater o padrão, tenta só CPF
  return { qrcode_id: text.replace(/\D/g, ""), tipo: "entrada" };
}

export default function AdminLeitorQR({ onLogout }) {
  const [status, setStatus] = useState("PRONTO"); // PRONTO, LENDO, SUCESSO, ERRO
  const [erro, setErro] = useState(null);
  const [resultado, setResultado] = useState(null);
  const scannerRef = useRef();

  // Reinicia o scanner
  function iniciarCamera() {
    setErro(null);
    setResultado(null);
    setStatus("PRONTO");

    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
    }

    const html5QrcodeScanner = new Html5QrcodeScanner(
      "reader",
      { fps: 12, qrbox: 220, disableFlip: false },
      false
    );
    scannerRef.current = html5QrcodeScanner;

    html5QrcodeScanner.render(
      async (decodedText) => {
        await handleDecodedText(decodedText);
      },
      (err) => {
        // Falha de leitura (normal, não precisa alertar sempre)
      }
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

  // Lógica ao ler QR
  async function handleDecodedText(decodedText) {
    if (status !== "PRONTO" && status !== "LENDO") return;

    setStatus("LENDO");
    const { qrcode_id, tipo } = parseQR(decodedText);

    if (!qrcode_id) {
      setStatus("ERRO");
      setErro("QR Code inválido: ID não encontrado");
      setTimeout(() => iniciarCamera(), 1500);
      return;
    }

    // Validar tipo
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
        setTimeout(() => iniciarCamera(), 1800);
        return;
      }

      setResultado({ ...data, tipo: tipoFinal });
      setStatus("SUCESSO");
      if (navigator.vibrate) navigator.vibrate([100, 30, 80]);
      playBeep(900, 120);

      setTimeout(() => iniciarCamera(), 1600);

    } catch (err) {
      setStatus("ERRO");
      setErro("Erro de rede: " + err.message);
      setTimeout(() => iniciarCamera(), 2000);
    }
  }

  // Exibição do resultado
  function renderResultado() {
    if (!resultado) return null;
    return (
      <div style={{
        background: "#e6f8ec",
        border: "2px solid #36b37e",
        borderRadius: "16px",
        padding: "20px",
        margin: "10px auto 0",
        maxWidth: 340,
        textAlign: "center",
        color: "#195e36"
      }}>
        <strong>{resultado.tipo === "saida" || resultado.tipo === "saída" ? "Saída registrada!" : "Entrada registrada!"}</strong>
        <div style={{fontSize: 18, margin: "8px 0 4px"}}>
          {resultado.nome}
        </div>
        <div style={{fontSize: 15, opacity: 0.7}}>{resultado.data_hora && new Date(resultado.data_hora).toLocaleString("pt-BR", { hour12: false })}</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      background: "linear-gradient(135deg,#e3f2fd 50%,#f0fff3 100%)",
      display: "flex",
      flexDirection: "column"
    }}>
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        background: "rgba(4,121,179,0.12)"
      }}>
        <div style={{ fontWeight: "bold", fontSize: 18, color: "#0479b3", letterSpacing: 1 }}>
          Admin Frequência
        </div>
        <button
          onClick={onLogout}
          style={{
            background: "none",
            border: "none",
            color: "#0479b3",
            fontSize: 26,
            cursor: "pointer",
            padding: 6,
          }}
          title="Sair"
        >
          <FaSignOutAlt />
        </button>
      </header>
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "start",
        padding: "14px 0"
      }}>
        <div style={{ fontWeight: 600, fontSize: 22, color: "#222", margin: "8px 0 18px" }}>
          Leitura do QR Code
        </div>
        <div id="reader" style={{
          width: 260,
          height: 260,
          borderRadius: 18,
          background: "#fff",
          boxShadow: "0 3px 18px #0479b330",
          overflow: "hidden"
        }}></div>

        {status === "SUCESSO" && renderResultado()}

        {erro && (
          <div style={{
            color: "#b3261e",
            background: "#fff6f4",
            border: "1.5px solid #fce5e3",
            borderRadius: 12,
            padding: "13px 15px",
            marginTop: 15,
            fontWeight: 500,
            maxWidth: 340
          }}>
            {erro}
          </div>
        )}

        {status === "PRONTO" && (
          <div style={{
            color: "#888",
            marginTop: 14,
            fontSize: 15
          }}>
            Aponte a câmera para o QR Code do servidor.
          </div>
        )}
        {status === "LENDO" && (
          <div style={{
            color: "#0479b3",
            marginTop: 14,
            fontSize: 16
          }}>
            Lendo QR Code...
          </div>
        )}
      </main>
    </div>
  );
}
