import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const corPrimaria = "#0479B3";
const corSucesso = "#38A169";
const corErro = "#E53E3E";
const corFundo = "#F7FAFC";

function parseQR(qr) {
  const [qrcode_id, tipo] = (qr || "").split("-");
  return { qrcode_id, tipo };
}

export default function AdminLeitorQR({ onLogout }) {
  const scannerRef = useRef();
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState("");
  const [lendo, setLendo] = useState(true);
  const [cameraIniciada, setCameraIniciada] = useState(false);
  const html5QrcodeRef = useRef(null);

  // Função para reiniciar a leitura
  const reiniciarLeitura = async () => {
    setResultado(null);
    setErro("");
    setLendo(true);
    
    if (html5QrcodeRef.current) {
      try {
        // Primeiro pare o scanner se estiver rodando
        if (html5QrcodeRef.current.isScanning) {
          await html5QrcodeRef.current.stop().catch(stopErr => {
            console.warn("Erro ao parar scanner:", stopErr);
          });
        }
        
        // Pequeno delay para garantir que o scanner foi parado
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Depois inicie novamente
        await html5QrcodeRef.current.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1,
          },
          handleDecodedText,
          handleScanError
        );
        setCameraIniciada(true);
      } catch (err) {
        console.error("Erro ao reiniciar scanner:", err);
        setErro("Erro ao reiniciar scanner. Por favor, recarregue a página.");
        setCameraIniciada(false);
        
        // Tenta novamente após 3 segundos
        setTimeout(reiniciarLeitura, 3000);
      }
    }
  };

  // Função para processar o QR Code lido
  const handleDecodedText = async (decodedText) => {
    setLendo(false);
    const { qrcode_id, tipo } = parseQR(decodedText);

    if (!qrcode_id || !tipo) {
      setErro("QR Code inválido.");
      return;
    }

    try {
      const res = await fetch("https://eventos-wi35.onrender.com/api/frequencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrcode_id, tipo }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.mensagem || "Erro ao registrar frequência.");
      
      setResultado({ ...data, tipo });
      
      // Feedback de sucesso
      if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
      beep(900, 120);
      
      // Reinicia automaticamente após 2 segundos
      setTimeout(reiniciarLeitura, 2000);
    } catch (err) {
      setErro(err.message);
      // Reinicia automaticamente após erro
      setTimeout(reiniciarLeitura, 3000);
    }
  };

  // Função para lidar com erros de leitura
  const handleScanError = (errMsg) => {
    // Ignora erros de "NotFoundException" que são normais durante a leitura
    if (!errMsg.includes("NotFoundException")) {
      setErro("Não foi possível acessar a câmera. Tente liberar permissão.");
      setLendo(false);
      setCameraIniciada(false);
    }
  };

  // Função beep sonoro
  const beep = (frequency = 700, duration = 140) => {
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
    } catch (e) {
      console.error("Erro no beep:", e);
    }
  };

  useEffect(() => {
    const initScanner = async () => {
      // Delay para garantir que o DOM esteja pronto
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const scannerElement = document.getElementById('leitor-qr-admin');
      if (!scannerElement) {
        setErro("Elemento do scanner não encontrado");
        return;
      }

      // Verifica se o elemento está visível
      const rect = scannerElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        setErro("Elemento do scanner não está visível");
        return;
      }

      const scanner = new Html5Qrcode("leitor-qr-admin");
      html5QrcodeRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1,
          },
          handleDecodedText,
          handleScanError
        );
        setCameraIniciada(true);
      } catch (err) {
        console.error("Erro ao iniciar scanner:", err);
        setErro("Erro ao iniciar scanner: " + err.message);
        setCameraIniciada(false);
        
        // Tenta novamente após 1 segundo se for um erro de permissão
        if (err.message.includes("Permission") || err.message.includes("permission")) {
          setTimeout(initScanner, 1000);
        }
      }
    };

    initScanner();

    return () => {
      const cleanup = async () => {
        if (html5QrcodeRef.current?.isScanning) {
          try {
            await html5QrcodeRef.current.stop();
          } catch (err) {
            console.warn("Erro na limpeza do scanner:", err);
          }
        }
      };
      cleanup();
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: corFundo,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        position: 'relative',
      }}
    >
      {/* Header moderno */}
      <header
        style={{
          background: `linear-gradient(135deg, ${corPrimaria} 0%, #03679a 100%)`,
          color: "#fff",
          width: "100%",
          padding: "20px 0 16px 0",
          textAlign: "center",
          fontWeight: 700,
          fontSize: "clamp(18px, 4vw, 22px)",
          position: "relative",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        Leitor de QR Code — Admin
        <button
          onClick={onLogout}
          style={{
            position: "absolute",
            top: "14px",
            right: "16px",
            background: "rgba(255, 255, 255, 0.15)",
            border: "none",
            color: "#fff",
            fontSize: "24px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          title="Sair"
          aria-label="Sair"
        >
          ⎋
        </button>
      </header>

      {/* Área do scanner */}
      <div
        style={{
          marginTop: "20px",
          width: "98vw",
          maxWidth: "400px",
          minHeight: "360px",
          borderRadius: "20px",
          background: "#fff",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          position: "relative",
          border: "1px solid rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Container da câmera */}
        <div
          style={{
            width: "240px",
            height: "240px",
            margin: "0 auto",
            background: cameraIniciada ? "transparent" : "#f5f8fa",
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0, 116, 178, 0.1)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            ref={scannerRef}
            id="leitor-qr-admin"
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
            }}
          />
          
          {/* Overlay de loading */}
          {!cameraIniciada && (
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(245, 248, 250, 0.8)",
              zIndex: 2,
            }}>
              <div style={{
                color: corPrimaria,
                fontWeight: 600,
                textAlign: "center",
              }}>
                Iniciando câmera...
              </div>
            </div>
          )}
        </div>

        {/* Mensagem de status */}
        {lendo && !erro && !resultado && (
          <div style={{ 
            marginTop: "16px", 
            color: corPrimaria, 
            fontWeight: 600,
            fontSize: "16px",
            textAlign: "center",
          }}>
            {cameraIniciada 
              ? "Aponte a câmera para o QR Code do funcionário" 
              : "Preparando o leitor..."}
          </div>
        )}

        {/* Mensagem de erro */}
        {erro && (
          <div
            style={{
              marginTop: "16px",
              color: corErro,
              fontWeight: 500,
              textAlign: "center",
              background: "rgba(229, 62, 62, 0.05)",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid rgba(229, 62, 62, 0.1)",
              width: "100%",
            }}
          >
            {erro}
            <button
              style={{
                marginTop: "12px",
                background: corPrimaria,
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontWeight: 600,
                cursor: "pointer",
                width: "100%",
                transition: "background 0.2s",
              }}
              onClick={() => {
                if (erro.includes("recarregue")) {
                  window.location.reload();
                } else {
                  reiniciarLeitura();
                }
              }}
            >
              {erro.includes("recarregue") ? "Recarregar Página" : "Tentar Novamente"}
            </button>
          </div>
        )}

        {/* Resultado da leitura */}
        {resultado && (
          <div
            style={{
              marginTop: "16px",
              background: "rgba(56, 161, 105, 0.05)",
              color: "#114",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 2px 12px rgba(56, 161, 105, 0.1)",
              textAlign: "center",
              fontSize: "16px",
              fontWeight: 500,
              width: "100%",
              border: "1px solid rgba(56, 161, 105, 0.1)",
            }}
          >
            {resultado.nome ? (
              <>
                <div style={{ 
                  color: corSucesso,
                  fontWeight: 600,
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke={corSucesso} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 4L12 14.01L9 11.01" stroke={corSucesso} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Frequência {resultado.tipo === "entrada" ? "de ENTRADA" : "de SAÍDA"} registrada!
                </div>
                <div style={{ 
                  color: corPrimaria, 
                  fontWeight: 700, 
                  margin: "8px 0",
                  fontSize: "18px",
                }}>
                  {resultado.nome}
                </div>
                <div style={{ 
                  fontSize: "14px", 
                  color: "#718096",
                  marginBottom: "12px",
                }}>
                  {new Date(resultado.data_hora).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </div>
                <div style={{
                  fontSize: "14px",
                  color: "#718096",
                  fontStyle: "italic",
                }}>
                  Continuando a leitura automaticamente...
                </div>
              </>
            ) : (
              <div style={{ color: corErro }}>
                Registro não encontrado
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rodapé minimalista */}
      <footer
        style={{
          textAlign: "center",
          fontSize: "12px",
          color: "#A0AEC0",
          padding: "16px",
          marginTop: "auto",
          width: "100%",
        }}
      >
        © {new Date().getFullYear()} Prefeitura de Marabá — Educacenso
      </footer>
    </div>
  );
}