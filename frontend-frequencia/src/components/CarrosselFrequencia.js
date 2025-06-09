import React, { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";

const corPrimaria = "#0479B3";
const corSecundaria = "#FFD600";

function beep(frequency = 700, duration = 140) {
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
  // HOOKS sempre no topo!
  const [presencaConfirmada, setPresencaConfirmada] = useState(false);
  const [swiperReady, setSwiperReady] = useState(false);
  const swiperRef = useRef(null);
  const beepedRef = useRef(false);

  // Checa confirmação da frequência
  useEffect(() => {
    if (!funcionario || !funcionario.cpf || presencaConfirmada) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `https://eventos-wi35.onrender.com/api/checar-frequencia?cpf=${funcionario.cpf}&tipo=entrada`
        );
        const data = await res.json();
        if (data.confirmada) {
          setPresencaConfirmada(true);
        }
      } catch (err) {}
    }, 2000);
    return () => clearInterval(interval);
  }, [funcionario, presencaConfirmada]);

  // Avança após confirmação
  useEffect(() => {
    if (
      presencaConfirmada &&
      swiperReady &&
      swiperRef.current &&
      !beepedRef.current
    ) {
      if (window.navigator.vibrate) window.navigator.vibrate(180);
      beep();
      beepedRef.current = true;
      setTimeout(() => {
        swiperRef.current.slideNext();
      }, 900);
    }
  }, [presencaConfirmada, swiperReady]);

  // Bloqueia voltar para tela do QRCode de entrada
  function bloquearVoltar(swiper) {
    if (swiper.activeIndex === 0 && presencaConfirmada) {
      swiper.slideTo(1, 0);
    }
  }

  if (!funcionario || !funcionario.qrcode_id) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: 100,
          color: "#d32f2f",
        }}
      >
        Erro ao carregar dados do funcionário.<br />
        Tente refazer o login.
      </div>
    );
  }

  // Estilos responsivos
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

  return (
    <div style={mainStyle}>
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
          4ª Edição do Encontro<br />
          do Educacenso de Marabá-PA
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

      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          setSwiperReady(true);
        }}
        onSlideChange={bloquearVoltar}
        allowTouchMove={presencaConfirmada} // swipe só depois da confirmação
        initialSlide={0}
        style={{
          flex: 1,
          minHeight: "calc(100vh - 110px)",
          paddingTop: "2vh",
          paddingBottom: "2vh",
        }}
      >
        {/* QR ENTRADA */}
        <SwiperSlide>
          <div className="card-frequencia" style={cardStyle}>
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
          </div>
        </SwiperSlide>

        {/* INFO */}
        <SwiperSlide>
          <div className="card-frequencia" style={cardStyle}>
            <h3 style={{ color: corPrimaria, marginBottom: 8 }}>
              Presença confirmada!
            </h3>
            <p style={{ fontWeight: 500, marginBottom: 12 }}>
              Olá, <b>{funcionario.nome}</b>! <br />
              Aproveite a <b>4ª Edição do Encontro do Educacenso de Marabá-PA</b>.
              <br />
              <span
                role="img"
                aria-label="confetti"
                style={{ fontSize: 32, marginTop: 10 }}
              >
                🎉
              </span>
            </p>
            {funcionario.aniversariante && (
              <p
                style={{
                  color: "#ff9800",
                  fontWeight: "bold",
                  background: "#fffbe9",
                  padding: 8,
                  borderRadius: 8,
                  margin: "18px 0",
                }}
              >
                🎂 Parabéns, hoje é seu aniversário!
              </p>
            )}
            <div style={{ textAlign: "left", margin: "18px 0 0 0" }}>
              <div
                style={{
                  color: "#4e5d6c",
                  fontWeight: 600,
                  fontSize: 17,
                  marginBottom: 8,
                }}
              >
                ➤ Regras rápidas:
              </div>
              <ul style={{ lineHeight: 1.5, fontSize: 15, paddingLeft: 16 }}>
                <li>Traga documento com foto.</li>
                <li>Respeite horários de entrada e saída.</li>
                <li>Use este app sempre que solicitado.</li>
                <li>
                  Em caso de dúvida, procure a equipe organizadora.
                </li>
              </ul>
            </div>
            <div style={{ marginTop: 32, color: "#999", fontSize: 15 }}>
              Deslize para a esquerda para gerar o QR Code de saída.
            </div>
          </div>
        </SwiperSlide>

        {/* QR SAÍDA */}
        <SwiperSlide>
          <div className="card-frequencia" style={cardStyle}>
            <h3 style={{ color: corPrimaria, marginBottom: 12 }}>
              Saída do Evento
            </h3>
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
        </SwiperSlide>
      </Swiper>

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

// Card style
const cardStyle = {
  background: "#fff",
  borderRadius: 18,
  boxShadow: "0 2px 18px #0002",
  margin: "5vw 1vw",
  padding: "7vw 4vw 6vw 4vw",
  textAlign: "center",
  minHeight: "60vh",
  maxWidth: 500,
  width: "98vw",
  marginLeft: "auto",
  marginRight: "auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  animation: "fadeInCard .7s"
};
