import React, { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";

// Função beep sonoro
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

const corPrimaria = "#0479B3";
const corSecundaria = "#FFD600";

export default function CarrosselFrequencia({ funcionario, onLogout }) {
  const [presencaConfirmada, setPresencaConfirmada] = useState(false);
  const [swiperReady, setSwiperReady] = useState(false);
  const swiperRef = useRef(null);
  const beepedRef = useRef(false);

  // Polling para confirmação da entrada
  useEffect(() => {
    if (presencaConfirmada) return;
    const interval = setInterval(async () => {
      const res = await fetch(
        `https://eventos-wi35.onrender.com/api/checar-frequencia?cpf=${funcionario.cpf}&tipo=entrada`
      );
      const data = await res.json();
      if (data.confirmada) {
        setPresencaConfirmada(true);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [funcionario.cpf, presencaConfirmada]);

  // Efeito: ao confirmar presença, faz beep/vibra/navega
  useEffect(() => {
    if (
      presencaConfirmada &&
      swiperReady &&
      swiperRef.current &&
      !beepedRef.current
    ) {
      if (window.navigator.vibrate) {
        window.navigator.vibrate(180);
      }
      beep();
      beepedRef.current = true;
      setTimeout(() => {
        swiperRef.current.slideNext();
      }, 800);
    }
  }, [presencaConfirmada, swiperReady]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f8fa",
        display: "flex",
        flexDirection: "column",
      }}
    >
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
            fontSize: "clamp(20px,4vw,28px)",
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

      <div style={{ flex: 1, display: "flex" }}>
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            setSwiperReady(true);
          }}
          allowTouchMove={presencaConfirmada}
          spaceBetween={8}
          slidesPerView={1}
          style={{
            flex: 1,
            minHeight: "calc(100vh - 110px)",
            paddingTop: "2vh",
            paddingBottom: "2vh",
          }}
        >
          {/* Tela do QR de entrada */}
          <SwiperSlide>
            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                boxShadow: "0 1px 10px #0001",
                margin: "5vw 1vw",
                padding: "6vw 2vw",
                textAlign: "center",
                minHeight: "50vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h3 style={{ color: corPrimaria, marginBottom: 10 }}>
                Bem-vindo(a),{" "}
                <span style={{ color: "#222" }}>{funcionario.nome}</span>
              </h3>
              <p style={{ fontWeight: 500 }}>
                Mostre este QR Code na ENTRADA do evento:
              </p>
              <QRCodeSVG
                value={funcionario.qrcode_id + "-entrada"}
                size={window.innerWidth > 430 ? 180 : window.innerWidth * 0.6}
              />
              <div style={{ margin: "22px 0 8px", color: "#888", fontSize: 15 }}>
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

          {/* Tela de boas-vindas/Informações */}
          <SwiperSlide>
            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                boxShadow: "0 1px 10px #0001",
                margin: "5vw 1vw",
                padding: "6vw 2vw",
                textAlign: "center",
                minHeight: "50vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h3 style={{ color: corPrimaria, marginBottom: 8 }}>
                Presença confirmada!
              </h3>
              <p style={{ fontWeight: 500, marginBottom: 12 }}>
                Olá, <b>{funcionario.nome}</b>! <br />
                Aproveite a <b>4ª Edição do Encontro do Educacenso de Marabá-PA</b>.<br />
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
              <div style={{ textAlign: "left", margin: "22px 0 0 0" }}>
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
                  <li>Em caso de dúvida, procure a equipe organizadora.</li>
                </ul>
              </div>
              <div style={{ marginTop: 32, color: "#999", fontSize: 15 }}>
                Deslize para a esquerda para gerar o QR Code de saída.
              </div>
            </div>
          </SwiperSlide>

          {/* Tela de QR Code de saída */}
          <SwiperSlide>
            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                boxShadow: "0 1px 10px #0001",
                margin: "5vw 1vw",
                padding: "6vw 2vw",
                textAlign: "center",
                minHeight: "50vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
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
      </div>
      <footer
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "#aac",
          padding: 10,
          marginTop: 18,
        }}
      >
        © {new Date().getFullYear()} Prefeitura de Marabá — Educacenso
      </footer>
    </div>
  );
}
