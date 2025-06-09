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
const corTexto = "#2d3748";
const corFundo = "#f7fafc";

export default function CarrosselFrequencia({ funcionario, onLogout }) {
  const [presencaConfirmada, setPresencaConfirmada] = useState(false);
  const [swiperReady, setSwiperReady] = useState(false);
  const swiperRef = useRef(null);
  const beepedRef = useRef(false);

  // Polling para confirmação da entrada
  useEffect(() => {
    if (presencaConfirmada) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `https://eventos-wi35.onrender.com/api/checar-frequencia?cpf=${funcionario.cpf}&tipo=entrada`
        );
        const data = await res.json();
        if (data.confirmada) {
          setPresencaConfirmada(true);
        }
      } catch (error) {
        console.error("Erro ao verificar frequência:", error);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [funcionario.cpf, presencaConfirmada]);

  // Efeito: ao confirmar presença, faz beep/vibra/navega
  useEffect(() => {
    if (presencaConfirmada && swiperReady && swiperRef.current && !beepedRef.current) {
      if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
      beep();
      beepedRef.current = true;
      setTimeout(() => {
        swiperRef.current.slideNext();
      }, 800);
    }
  }, [presencaConfirmada, swiperReady]);

  // Estilo para cobrir toda a área segura da tela
  const mainStyle = {
    minHeight: "100dvh",
    width: "100vw",
    background: corFundo,
    display: "flex",
    flexDirection: "column",
    paddingTop: "env(safe-area-inset-top)",
    paddingBottom: "env(safe-area-inset-bottom)",
    paddingLeft: "env(safe-area-inset-left)",
    paddingRight: "env(safe-area-inset-right)",
    boxSizing: "border-box",
    overflow: "hidden",
    position: "relative",
    fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
  };

  // Estilo do card reutilizável
  const cardStyle = {
    background: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    margin: "16px 8px",
    padding: "24px 16px",
    textAlign: "center",
    minHeight: "60vh",
    maxWidth: "500px",
    width: "calc(100% - 16px)",
    marginLeft: "auto",
    marginRight: "auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    border: "1px solid rgba(0, 0, 0, 0.05)"
  };

  return (
    <div style={mainStyle}>
      {/* Header moderno com gradiente */}
      <header
        style={{
          background: `linear-gradient(135deg, ${corPrimaria} 0%, #03679a 100%)`,
          color: "#fff",
          padding: "16px 0 12px 0",
          textAlign: "center",
          borderBottomLeftRadius: "20px",
          borderBottomRightRadius: "20px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          position: "relative",
          zIndex: 10
        }}
      >
        <h2
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: "clamp(18px, 4.5vw, 22px)",
            letterSpacing: "0.3px",
            lineHeight: "1.3",
            padding: "0 40px"
          }}
        >
          4ª Edição do Encontro<br />do Educacenso de Marabá-PA
        </h2>
        <button
          onClick={onLogout}
          style={{
            position: "absolute",
            top: "14px",
            right: "16px",
            background: "rgba(255, 255, 255, 0.15)",
            border: "none",
            color: "#fff",
            fontSize: "22px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background 0.2s",
            zIndex: 2
          }}
          title="Sair"
          aria-label="Sair"
        >
          ⎋
        </button>
      </header>

      {/* Conteúdo principal com Swiper */}
      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column",
        padding: "8px 0 0 0"
      }}>
        <Swiper
          modules={[Pagination]}
          pagination={{
            clickable: true,
            bulletActiveClass: "swiper-pagination-bullet-active",
            bulletClass: "swiper-pagination-bullet"
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            setSwiperReady(true);
          }}
          allowTouchMove={presencaConfirmada}
          spaceBetween={8}
          slidesPerView={1}
          style={{
            flex: 1,
            width: "100%",
            "--swiper-pagination-color": corPrimaria,
            "--swiper-pagination-bullet-inactive-color": "#cbd5e0",
            "--swiper-pagination-bullet-inactive-opacity": 1,
            "--swiper-pagination-bullet-size": "10px",
            "--swiper-pagination-bullet-horizontal-gap": "6px"
          }}
        >
          {/* Tela do QR de entrada */}
          <SwiperSlide>
            <div style={cardStyle}>
              <h3 style={{ 
                color: corPrimaria, 
                marginBottom: "16px",
                fontSize: "20px",
                fontWeight: 600
              }}>
                Bem-vindo(a),{" "}
                <span style={{ color: corTexto }}>{funcionario.nome}</span>
              </h3>
              <p style={{ 
                fontWeight: 500, 
                color: corTexto,
                marginBottom: "24px",
                fontSize: "16px"
              }}>
                Mostre este QR Code na <b>ENTRADA</b> do evento:
              </p>
              
              <div style={{
                padding: "12px",
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
                marginBottom: "24px"
              }}>
                <QRCodeSVG
                  value={funcionario.qrcode_id + "-entrada"}
                  size={Math.min(window.innerWidth * 0.6, 220)}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <div style={{ 
                margin: "16px 0 8px", 
                color: "#718096", 
                fontSize: "15px"
              }}>
                Aguarde a leitura do administrador...
              </div>
              
              {!presencaConfirmada ? (
                <div style={{ 
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: corSecundaria, 
                  fontWeight: 600,
                  fontSize: "15px",
                  background: "rgba(255, 214, 0, 0.1)",
                  padding: "8px 12px",
                  borderRadius: "8px"
                }}>
                  <span style={{ fontSize: "20px" }}>⏳</span> Aguardando confirmação
                </div>
              ) : (
                <div style={{ 
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#38a169", 
                  fontWeight: 600,
                  fontSize: "15px",
                  background: "rgba(56, 161, 105, 0.1)",
                  padding: "8px 12px",
                  borderRadius: "8px"
                }}>
                  <span style={{ fontSize: "20px" }}>✅</span> Presença confirmada!
                </div>
              )}
            </div>
          </SwiperSlide>

          {/* Tela de boas-vindas/Informações */}
          <SwiperSlide>
            <div style={cardStyle}>
              <div style={{
                background: "rgba(4, 121, 179, 0.1)",
                padding: "12px",
                borderRadius: "12px",
                marginBottom: "20px"
              }}>
                <h3 style={{ 
                  color: corPrimaria, 
                  marginBottom: "8px",
                  fontSize: "20px",
                  fontWeight: 600
                }}>
                  Presença confirmada!
                </h3>
                <p style={{ 
                  fontWeight: 500, 
                  color: corTexto,
                  fontSize: "16px",
                  lineHeight: "1.4"
                }}>
                  Olá, <b>{funcionario.nome}</b>!<br />
                  Aproveite o evento.
                </p>
              </div>
              
              {funcionario.aniversariante && (
                <div style={{
                  color: "#d69e2e",
                  fontWeight: 600,
                  background: "#fffaf0",
                  padding: "12px",
                  borderRadius: "12px",
                  margin: "16px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "15px",
                  border: "1px solid rgba(214, 158, 46, 0.2)"
                }}>
                  <span style={{ fontSize: "20px" }}>🎂</span> Parabéns, hoje é seu aniversário!
                </div>
              )}
              
              <div style={{ 
                textAlign: "left", 
                width: "100%",
                margin: "20px 0 0 0",
                background: "rgba(247, 250, 252, 0.7)",
                border: "1px solid rgba(226, 232, 240, 0.7)",
                borderRadius: "12px",
                padding: "16px"
              }}>
                <div style={{
                  color: corPrimaria,
                  fontWeight: 600,
                  fontSize: "17px",
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke={corPrimaria} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8V12" stroke={corPrimaria} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16H12.01" stroke={corPrimaria} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Regras rápidas:
                </div>
                <ul style={{ 
                  lineHeight: "1.6", 
                  fontSize: "15px",
                  color: corTexto,
                  paddingLeft: "24px",
                  margin: 0
                }}>
                  <li style={{ marginBottom: "8px" }}>Traga documento com foto</li>
                  <li style={{ marginBottom: "8px" }}>Respeite horários de entrada e saída</li>
                  <li style={{ marginBottom: "8px" }}>Use este app quando solicitado</li>
                  <li>Em caso de dúvida, procure a organização</li>
                </ul>
              </div>
              
              <div style={{ 
                marginTop: "24px", 
                color: "#a0aec0", 
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#a0aec0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="#a0aec0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 18V12" stroke="#a0aec0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 15H15" stroke="#a0aec0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Deslize para a esquerda para o QR Code de saída
              </div>
            </div>
          </SwiperSlide>

          {/* Tela de QR Code de saída */}
          <SwiperSlide>
            <div style={cardStyle}>
              <h3 style={{ 
                color: corPrimaria, 
                marginBottom: "16px",
                fontSize: "20px",
                fontWeight: 600
              }}>
                Saída do Evento
              </h3>
              <p style={{ 
                fontWeight: 500, 
                color: corTexto,
                marginBottom: "24px",
                fontSize: "16px"
              }}>
                Ao FINALIZAR, mostre este QR Code para registrar sua <b>SAÍDA</b>:
              </p>
              
              <div style={{
                padding: "12px",
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
                marginBottom: "24px"
              }}>
                <QRCodeSVG
                  value={funcionario.qrcode_id + "-saida"}
                  size={Math.min(window.innerWidth * 0.6, 220)}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <div style={{ 
                color: "#718096", 
                marginTop: "16px", 
                fontSize: "15px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 4L12 14.01L9 11.01" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Obrigado pela sua participação!
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>

      {/* Footer minimalista */}
      <footer
        style={{
          textAlign: "center",
          fontSize: "12px",
          color: "#a0aec0",
          padding: "12px",
          marginTop: "auto",
          background: "rgba(247, 250, 252, 0.8)",
          borderTop: "1px solid rgba(226, 232, 240, 0.7)"
        }}
      >
        © {new Date().getFullYear()} Prefeitura de Marabá — Educacenso
      </footer>
    </div>
  );
}