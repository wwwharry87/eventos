import React, { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

const corPrimaria = "#0479B3";
const corSecundaria = "#FFD600";

function beep(frequency = 600, duration = 120) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.connect(ctx.destination);
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      ctx.close();
    }, duration);
  } catch (e) {}
}

export default function CarrosselFrequencia({ funcionario, onLogout }) {
  const [etapa, setEtapa] = useState(0); // 0: entrada, 1: info, 2: saída
  const [presencaConfirmada, setPresencaConfirmada] = useState(false);
  const [pollingAtivo, setPollingAtivo] = useState(true);
  const beepedRef = useRef(false);

  // Polling para confirmação da entrada
  useEffect(() => {
    if (!pollingAtivo) return;
    if (presencaConfirmada) return;
    const interval = setInterval(async () => {
      const res = await fetch(
        `https://eventos-wi35.onrender.com/api/checar-frequencia?cpf=${funcionario.cpf}&tipo=entrada`
      );
      const data = await res.json();
      if (data.confirmada) {
        setPresencaConfirmada(true);
        setPollingAtivo(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [funcionario.cpf, presencaConfirmada, pollingAtivo]);

  // Quando confirma presença, vibra/beepa/avança (se usuário clicar ou automático)
  useEffect(() => {
    if (presencaConfirmada && !beepedRef.current) {
      if (window.navigator.vibrate) {
        window.navigator.vibrate(180);
      }
      beep();
      beepedRef.current = true;
    }
  }, [presencaConfirmada]);

  // Para mobile/iphone: preencher a tela toda respeitando área segura
  const mainStyle = {
    minHeight: "100dvh",
    width: "100vw",
    background: "#f5f8fa",
    display: "flex",
    flexDirection: "column",
    paddingTop: "env(safe-area-inset-top)",
    paddingBottom: "env(safe-area-inset-bottom)",
    paddingLeft: "env(safe-area-inset-left)",
    paddingRight: "env(safe-area-inset-right)",
    boxSizing: "border-box",
    overflow: "hidden",
    position: "relative",
  };

  // Avança de etapa (manual pelo botão)
  const nextEtapa = () => setEtapa((prev) => Math.min(prev + 1, 2));
  // Volta (se quiser dar essa opção)
  const prevEtapa = () => setEtapa((prev) => Math.max(prev - 1, 0));

  // Cards do fluxo
  const cards = [
    // ETAPA 0 - QRCode ENTRADA
    <div key="entrada" className="card-frequencia">
      <h3 style={{ color: corPrimaria, marginBottom: 12 }}>
        Bem-vindo(a), <span style={{ color: "#222" }}>{funcionario.nome}</span>
      </h3>
      <p style={{ fontWeight: 500, marginBottom: 12 }}>
        Mostre este QR Code na <b>ENTRADA</b> do evento:
      </p>
      <QRCodeSVG
        value={funcionario.qrcode_id + "-entrada"}
        size={window.innerWidth > 430 ? 180 : window.innerWidth * 0.6}
      />
      <div style={{ margin: "18px 0 8px", color: "#888", fontSize: 15 }}>
        Aguarde a leitura do administrador...
      </div>
      {!presencaConfirmada ? (
        <span style={{ color: corSecundaria, fontWeight: 600 }}>
          ⏳ Esperando conferência do admin...
        </span>
      ) : (
        <span style={{ color: "green", fontWeight: "bold" }}>
          ✅ Presença confirmada!
        </span>
      )}
      {/* Avança só depois da confirmação */}
      <button
        className="btn-next"
        disabled={!presencaConfirmada}
        style={{
          background: presencaConfirmada ? corPrimaria : "#ddd",
          color: "#fff",
          fontWeight: "bold",
          marginTop: 32,
          fontSize: 18,
          padding: "12px 36px",
          borderRadius: 10,
          border: "none",
          cursor: presencaConfirmada ? "pointer" : "not-allowed",
          transition: "all .2s"
        }}
        onClick={nextEtapa}
      >
        Avançar
      </button>
    </div>,

    // ETAPA 1 - INFORMAÇÕES
    <div key="infos" className="card-frequencia">
      <h3 style={{ color: corPrimaria, marginBottom: 8 }}>Presença confirmada!</h3>
      <p style={{ fontWeight: 500, marginBottom: 12 }}>
        Olá, <b>{funcionario.nome}</b>! <br />
        Aproveite a <b>4ª Edição do Encontro do Educacenso de Marabá-PA</b>.
        <br />
        <span role="img" aria-label="confetti" style={{ fontSize: 32, marginTop: 10 }}>🎉</span>
      </p>
      {funcionario.aniversariante && (
        <p style={{
          color: "#ff9800",
          fontWeight: "bold",
          background: "#fffbe9",
          padding: 8,
          borderRadius: 8,
          margin: "18px 0",
        }}>
          🎂 Parabéns, hoje é seu aniversário!
        </p>
      )}
      <div style={{ textAlign: "left", margin: "18px 0 0 0" }}>
        <div style={{ color: "#4e5d6c", fontWeight: 600, fontSize: 17, marginBottom: 8 }}>
          ➤ Regras rápidas:
        </div>
        <ul style={{ lineHeight: 1.5, fontSize: 15, paddingLeft: 16 }}>
          <li>Traga documento com foto.</li>
          <li>Respeite horários de entrada e saída.</li>
          <li>Use este app sempre que solicitado.</li>
          <li>Em caso de dúvida, procure a equipe organizadora.</li>
        </ul>
      </div>
      <button className="btn-next" style={{
        background: corPrimaria,
        color: "#fff",
        fontWeight: "bold",
        marginTop: 32,
        fontSize: 18,
        padding: "12px 36px",
        borderRadius: 10,
        border: "none",
        cursor: "pointer"
      }} onClick={nextEtapa}>
        Gerar QR de saída
      </button>
    </div>,

    // ETAPA 2 - QRCode SAÍDA
    <div key="saida" className="card-frequencia">
      <h3 style={{ color: corPrimaria, marginBottom: 12 }}>Saída do Evento</h3>
      <p style={{ fontWeight: 500 }}>
        Ao FINALIZAR, mostre este QR Code para registrar sua SAÍDA:
      </p>
      <QRCodeSVG
        value={funcionario.qrcode_id + "-saida"}
        size={window.innerWidth > 430 ? 180 : window.innerWidth * 0.6}
      />
      <div style={{ color: "#888", marginTop: 16, fontSize: 15 }}>
        Obrigado pela sua participação!
      </div>
    </div>
  ];

  // CSS Card (pode jogar em um arquivo .css se quiser)
  const cardStyle = `
    .card-frequencia {
      background: #fff;
      border-radius: 18px;
      box-shadow: 0 2px 18px #0002;
      margin: 5vw 1vw;
      padding: 7vw 4vw 6vw 4vw;
      text-align: center;
      min-height: 60vh;
      max-width: 500px;
      width: 98vw;
      margin-left: auto;
      margin-right: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      animation: fadeInCard .7s;
    }
    .btn-next {
      box-shadow: 0 2px 8px #0001;
    }
    @keyframes fadeInCard {
      from { opacity: 0; transform: translateY(20px);}
      to { opacity: 1; transform: translateY(0);}
    }
  `;

  return (
    <div style={mainStyle}>
      <style>{cardStyle}</style>
      <header
        style={{
          background: corPrimaria,
          color: "#fff",
          padding: "4vw 0 2vw 0",
          textAlign: "center",
          borderBottomLeftRadius: 18,
          borderBottomRightRadius: 18,
          boxShadow: "0 2px 8px #0002",
          position: "relative",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: "clamp(18px,4vw,28px)",
            letterSpacing: 0.5,
          }}
        >
          4ª Edição do Encontro<br />do Educacenso de Marabá-PA
        </h2>
        <button
          onClick={onLogout}
          style={{
            position: "absolute",
            top: 16,
            right: 18,
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: 24,
            cursor: "pointer",
            zIndex: 2,
          }}
          title="Sair"
        >
          <span aria-label="Sair" role="img">
            ⎋
          </span>
        </button>
      </header>
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {cards[etapa]}
      </main>
      <footer
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "#aac",
          padding: 10,
          marginTop: 10,
        }}
      >
        © {new Date().getFullYear()} Prefeitura de Marabá — Educacenso
      </footer>
    </div>
  );
}
