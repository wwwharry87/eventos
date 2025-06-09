import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

// Paleta de cores
const corPrimaria = "#0479B3";
const corSecundaria = "#FFD600";

export default function CarrosselFrequencia({ funcionario, onLogout }) {
  const [presencaConfirmada, setPresencaConfirmada] = useState(false);
  const [swiperRef, setSwiperRef] = useState(null);

  // Polling para confirmação da entrada
  useEffect(() => {
    if (presencaConfirmada || !swiperRef) return;
    const interval = setInterval(async () => {
      const res = await fetch(
        `https://eventos-wi35.onrender.com/api/checar-frequencia?cpf=${funcionario.cpf}&tipo=entrada`
      );
      const data = await res.json();
      if (data.confirmada) {
        setPresencaConfirmada(true);
        swiperRef.slideNext();
        clearInterval(interval);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [funcionario.cpf, presencaConfirmada, swiperRef]);

  return (
    <div style={{
      maxWidth: 430, margin: "0 auto", minHeight: "100vh",
      background: "#f5f8fa"
    }}>
      <header style={{
        background: corPrimaria,
        color: "#fff",
        padding: "20px 0 8px 0",
        textAlign: "center",
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        boxShadow: "0 2px 8px #0002",
      }}>
        <h2 style={{
          margin: 0,
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 0.5,
        }}>
          4ª Edição do Encontro<br />do Educacenso de Marabá-PA
        </h2>
      </header>

      <Swiper
        onSwiper={setSwiperRef}
        allowTouchMove={presencaConfirmada}
        spaceBetween={50}
        slidesPerView={1}
        style={{ height: "calc(100vh - 90px)", paddingTop: 20 }}
      >
        {/* Tela do QR de entrada */}
        <SwiperSlide>
          <div style={{
            background: "#fff", borderRadius: 18, boxShadow: "0 1px 10px #0001",
            margin: "24px 8px", padding: 30, textAlign: "center"
          }}>
            <h3 style={{ color: corPrimaria, marginBottom: 10 }}>
              Bem-vindo(a), <span style={{ color: "#222" }}>{funcionario.nome}</span>
            </h3>
            <p style={{ fontWeight: 500 }}>Mostre este QR Code na ENTRADA do evento:</p>
            <QRCodeSVG value={funcionario.qrcode_id + "-entrada"} size={190} />
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
          <div style={{
            background: "#fff", borderRadius: 18, boxShadow: "0 1px 10px #0001",
            margin: "24px 8px", padding: 30, textAlign: "center"
          }}>
            <h3 style={{ color: corPrimaria, marginBottom: 8 }}>
              Presença confirmada!
            </h3>
            <p style={{ fontWeight: 500, marginBottom: 12 }}>
              Olá, <b>{funcionario.nome}</b>! <br />
              Aproveite a <b>4ª Edição do Encontro do Educacenso de Marabá-PA</b>.<br />
              <span role="img" aria-label="confetti" style={{ fontSize: 32, marginTop: 10 }}>🎉</span>
            </p>
            {funcionario.aniversariante && (
              <p style={{
                color: "#ff9800", fontWeight: "bold", background: "#fffbe9",
                padding: 8, borderRadius: 8, margin: "18px 0"
              }}>
                🎂 Parabéns, hoje é seu aniversário!
              </p>
            )}
            <div style={{ textAlign: "left", margin: "22px 0 0 0" }}>
              <div style={{
                color: "#4e5d6c", fontWeight: 600, fontSize: 17, marginBottom: 8
              }}>
                ➤ Regras rápidas:
              </div>
              <ul style={{ lineHeight: 1.5, fontSize: 15 }}>
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
          <div style={{
            background: "#fff", borderRadius: 18, boxShadow: "0 1px 10px #0001",
            margin: "24px 8px", padding: 30, textAlign: "center"
          }}>
            <h3 style={{ color: corPrimaria, marginBottom: 12 }}>
              Saída do Evento
            </h3>
            <p style={{ fontWeight: 500 }}>Ao FINALIZAR, mostre este QR Code para registrar sua SAÍDA:</p>
            <QRCodeSVG value={funcionario.qrcode_id + "-saida"} size={190} />
            <div style={{ color: "#888", marginTop: 16, fontSize: 15 }}>
              Obrigado pela sua participação!
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
      <footer style={{ textAlign: "center", fontSize: 12, color: "#aac", padding: 10, marginTop: 18 }}>
        © {new Date().getFullYear()} Prefeitura de Marabá — Educacenso
      </footer>
    </div>
  );
}
