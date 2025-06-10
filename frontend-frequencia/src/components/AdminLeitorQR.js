import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const COLORS = {
  primary: "#0479B3",
  success: "#38A169",
  error: "#E53E3E",
  background: "#F7FAFC",
  text: "#2D3748"
};

function parseQR(qr) {
  if (!qr) return { qrcode_id: null, tipo: null };
  
  // Suporte para múltiplos formatos de QR Code
  const parts = qr.split("-");
  if (parts.length >= 2) {
    return { 
      qrcode_id: parts.slice(0, -1).join("-"), // Pega tudo exceto o último elemento como ID
      tipo: parts[parts.length - 1] // Último elemento como tipo
    };
  }
  return { qrcode_id: qr, tipo: "entrada" }; // Fallback para QR codes antigos
}

export default function AdminLeitorQR({ onLogout }) {
  const [status, setStatus] = useState("INICIANDO");
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState("");
  const html5QrcodeRef = useRef(null);
  const retryCountRef = useRef(0);
  const scannerRef = useRef(null);

  // Estados possíveis: INICIANDO | PRONTO | LENDO | SUCESSO | ERRO | SEM_CAMERA

  // Função robusta para iniciar/reiniciar a câmera
  const iniciarCamera = async () => {
    setStatus("INICIANDO");
    setErro("");
    setResultado(null);
    
    try {
      // Limpar qualquer scanner existente
      if (html5QrcodeRef.current?.isScanning) {
        await html5QrcodeRef.current.stop();
      }

      // Criar novo scanner com configurações otimizadas
      const scanner = new Html5Qrcode("leitor-qr-admin");
      html5QrcodeRef.current = scanner;
      retryCountRef.current = 0;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 15, // Aumentado para melhor detecção
          qrbox: function(viewfinderWidth, viewfinderHeight) {
            // Área de leitura dinâmica baseada no tamanho do viewfinder
            let minEdgePercentage = 0.7; // 70% da menor dimensão
            let minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
            let qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
            return {
              width: qrboxSize,
              height: qrboxSize,
            };
          },
          disableFlip: false, // Permitir flip para melhor leitura
          // Removido videoConstraints que pode não ser suportado
        },
        (decodedText) => {
          console.log("QR Code Decodificado:", decodedText); // Log para verificar se a função é chamada
          handleDecodedText(decodedText);
        },
        handleScanError
      );
      
      setStatus("PRONTO");
    } catch (err) {
      console.error("Falha ao iniciar câmera:", err);
      handleCameraError(err);
    }
  };

  // Tratamento avançado de erros de câmera
  const handleCameraError = (err) => {
    retryCountRef.current += 1;
    
    if (retryCountRef.current > 3) {
      setStatus("SEM_CAMERA");
      setErro("Não foi possível acessar a câmera. Verifique as permissões.");
      return;
    }

    // Tentar novamente com delay crescente
    setTimeout(() => {
      iniciarCamera();
    }, retryCountRef.current * 1000);
  };

  // Processamento do QR Code com validação melhorada
  const handleDecodedText = async (decodedText) => {
    console.log("handleDecodedText chamado com:", decodedText); // Log adicional
    
    if (status !== "PRONTO" && status !== "LENDO") {
      console.log("Status não permite leitura:", status);
      return;
    }
    
    // Evitar múltiplas leituras simultâneas
    setStatus("LENDO");
    
    const { qrcode_id, tipo } = parseQR(decodedText);
    console.log("QR parseado:", { qrcode_id, tipo }); // Log do parsing

    if (!qrcode_id) {
      setStatus("ERRO");
      setErro("QR Code inválido: ID não encontrado");
      setTimeout(iniciarCamera, 2000);
      return;
    }

    // Valores válidos para tipo
    const tiposValidos = ["entrada", "saida", "saída"];
    const tipoNormalizado = tipo ? tipo.toLowerCase() : "entrada";
    
    if (tipo && !tiposValidos.includes(tipoNormalizado)) {
      setStatus("ERRO");
      setErro(`Tipo de QR Code inválido: ${tipo}`);
      setTimeout(iniciarCamera, 2000);
      return;
    }

    try {
      const res = await fetch("https://eventos-wi35.onrender.com/api/frequencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          qrcode_id, 
          tipo: tipoNormalizado 
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.mensagem || `Erro ${res.status} ao registrar`);
      }
      
      // Feedback de sucesso
      setResultado({ ...data, tipo: tipoNormalizado });
      setStatus("SUCESSO");
      
      // Feedback tátil e sonoro
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      playBeep(900, 120);
      
      // Reinício automático rápido
      setTimeout(iniciarCamera, 1500);
    } catch (err) {
      console.error("Erro no registro:", err);
      setStatus("ERRO");
      setErro(err.message);
      setTimeout(iniciarCamera, 2000);
    }
  };

  // Ignorar erros normais de leitura
  const handleScanError = (err) => {
    // Adicionar log detalhado para depuração
    console.error("Erro de leitura do QR Code:", err);
    if (!err.includes("NotFoundException") && status === "PRONTO") {
      console.warn("Erro de leitura (não NotFoundException):");
    }
  };

  // Beep otimizado para iOS
  const playBeep = (freq = 700, duration = 120) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(ctx.destination);
      osc.start();
      setTimeout(() => osc.stop(), duration);
    } catch (e) {
      console.warn("Beep não suportado");
    }
  };

  // Gerenciamento de ciclo de vida
  useEffect(() => {
    iniciarCamera();
    
    return () => {
      if (html5QrcodeRef.current?.isScanning) {
        html5QrcodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Renderização otimizada
  return (
    <div style={styles.container}>
      {/* Cabeçalho */}
      <header style={styles.header}>
        Leitor de QR Code — Admin
        <button onClick={onLogout} style={styles.logoutButton} aria-label="Sair">
          ⎋
        </button>
      </header>

      {/* Área principal */}
      <div style={styles.scannerArea}>
        {/* Container da câmera */}
        <div style={styles.cameraContainer}>
          <div 
            id="leitor-qr-admin"
            ref={scannerRef}
            style={styles.cameraView}
          />
          
          {/* Overlay de status */}
          {status !== "PRONTO" && (
            <div style={styles.overlay}>
              {status === "INICIANDO" && (
                <div style={styles.statusMessage}>
                  <div style={styles.spinner} />
                  <p>Iniciando câmera...</p>
                </div>
              )}
              
              {status === "LENDO" && (
                <div style={styles.statusMessage}>
                  <div style={styles.spinner} />
                  <p>Processando QR Code...</p>
                </div>
              )}
              
              {status === "SEM_CAMERA" && (
                <div style={styles.errorMessage}>
                  <p>❌ Câmera não acessível</p>
                  <button 
                    onClick={iniciarCamera}
                    style={styles.actionButton}
                  >
                    Tentar Novamente
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mensagens de status */}
        <div style={styles.statusContainer}>
          {status === "PRONTO" && (
            <p style={styles.readyText}>Aponte para o QR Code do participante</p>
          )}
          
          {status === "SUCESSO" && resultado && (
            <div style={styles.successBox}>
              <div style={styles.successHeader}>
                ✓ {resultado.tipo === "entrada" ? "ENTRADA" : "SAÍDA"} registrada!
              </div>
              <div style={styles.userName}>{resultado.nome}</div>
              <div style={styles.timestamp}>
                {new Date(resultado.data_hora).toLocaleString("pt-BR")}
              </div>
            </div>
          )}
          
          {status === "ERRO" && (
            <div style={styles.errorBox}>
              <p>{erro || "Erro desconhecido"}</p>
              <button 
                onClick={iniciarCamera}
                style={styles.actionButton}
              >
                Tentar Novamente
              </button>
            </div>
          )}
          
          {/* Botão de teste para verificar se a função funciona */}
          <button 
            onClick={() => handleDecodedText("123456789012-entrada")}
            style={{...styles.actionButton, marginTop: "10px", backgroundColor: "#666"}}
          >
            Testar QR Code (Debug)
          </button>
        </div>
      </div>

      {/* Rodapé */}
      <footer style={styles.footer}>
        © {new Date().getFullYear()} Prefeitura de Marabá — Educacenso
      </footer>
    </div>
  );
}

// Estilos otimizados
const styles = {
  container: {
    minHeight: "100dvh",
    background: COLORS.background,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "env(safe-area-inset-top)",
    paddingBottom: "env(safe-area-inset-bottom)",
    fontFamily: "'Segoe UI', Roboto, sans-serif",
  },
  header: {
    background: `linear-gradient(135deg, ${COLORS.primary} 0%, #03679a 100%)`,
    color: "#fff",
    width: "100%",
    padding: "20px 0",
    textAlign: "center",
    fontWeight: 700,
    fontSize: "clamp(18px, 4vw, 22px)",
    position: "relative",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
  logoutButton: {
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
  },
  scannerArea: {
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
    padding: "20px",
    position: "relative",
  },
  cameraContainer: {
    width: "240px",
    height: "240px",
    margin: "0 auto",
    borderRadius: "12px",
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 2px 12px rgba(0, 116, 178, 0.1)",
  },
  cameraView: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(255, 255, 255, 0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  statusMessage: {
    textAlign: "center",
    color: COLORS.primary,
    fontWeight: 600,
  },
  errorMessage: {
    textAlign: "center",
    color: COLORS.error,
  },
  spinner: {
    border: `4px solid ${COLORS.primary}20`,
    borderTop: `4px solid ${COLORS.primary}`,
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
  statusContainer: {
    marginTop: "20px",
    width: "100%",
    textAlign: "center",
  },
  readyText: {
    color: COLORS.primary,
    fontWeight: 600,
  },
  successBox: {
    background: `${COLORS.success}10`,
    border: `1px solid ${COLORS.success}30`,
    borderRadius: "12px",
    padding: "16px",
    color: COLORS.text,
  },
  successHeader: {
    color: COLORS.success,
    fontWeight: 700,
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  userName: {
    color: COLORS.primary,
    fontWeight: 700,
    fontSize: "18px",
    margin: "8px 0",
  },
  timestamp: {
    color: "#718096",
    fontSize: "14px",
  },
  errorBox: {
    background: `${COLORS.error}10`,
    border: `1px solid ${COLORS.error}30`,
    borderRadius: "12px",
    padding: "16px",
    color: COLORS.error,
  },
  actionButton: {
    background: COLORS.primary,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    marginTop: "12px",
  },
  footer: {
    textAlign: "center",
    fontSize: "12px",
    color: "#A0AEC0",
    padding: "16px",
    marginTop: "auto",
    width: "100%",
  },
};

// Adicionar CSS para animação do spinner
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

