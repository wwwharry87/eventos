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

  const cleaned = qr.trim();
  const parts = cleaned.split("-");
  if (parts.length >= 2) {
    return {
      qrcode_id: parts.slice(0, -1).join("-"),
      tipo: parts[parts.length - 1]
    };
  }
  return { qrcode_id: cleaned, tipo: "entrada" };
}

// Detecção melhorada de PWA
function isPWA() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone ||
    document.referrer.includes("android-app://")
  );
}

// Verifica se é iOS
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export default function AdminLeitorQR({ onLogout }) {
  const [status, setStatus] = useState("INICIANDO");
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState("");
  const [showPWAWarning, setShowPWAWarning] = useState(false);
  const html5QrcodeRef = useRef(null);
  const retryCountRef = useRef(0);
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Inicialização com tratamento especial para iOS PWA
  useEffect(() => {
    const checkCameraAccess = async () => {
      try {
        // Verificar permissões de câmera primeiro
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        
        // Se for iOS em PWA, mostrar aviso mas permitir tentar
        if (isPWA() && isIOS()) {
          setShowPWAWarning(true);
          setStatus("PWA_WARNING");
        } else {
          iniciarCamera();
        }
      } catch (err) {
        console.error("Erro de permissão de câmera:", err);
        handleCameraError(err);
      }
    };

    checkCameraAccess();

    return () => {
      if (html5QrcodeRef.current?.isScanning) {
        html5QrcodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Configuração otimizada para iOS PWA
  const getCameraConfig = () => {
    if (isIOS() && isPWA()) {
      return {
        facingMode: { exact: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      };
    }
    return { facingMode: "environment" };
  };

  const iniciarCamera = async () => {
    setStatus("INICIANDO");
    setErro("");
    setResultado(null);
    isProcessingRef.current = false;
    
    try {
      if (html5QrcodeRef.current?.isScanning) {
        await html5QrcodeRef.current.stop();
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const scanner = new Html5Qrcode("leitor-qr-admin");
      html5QrcodeRef.current = scanner;
      retryCountRef.current = 0;

      const config = {
        fps: isIOS() ? 5 : 10, // FPS mais baixo para iOS
        qrbox: (width, height) => {
          const size = Math.min(width, height) * 0.7;
          return { width: size, height: size };
        },
        disableFlip: false,
        supportedScanTypes: [Html5Qrcode.SCAN_TYPE_CAMERA],
        formatsToSupport: [Html5Qrcode.BARCODE_FORMAT.QR_CODE]
      };

      console.log("Iniciando câmera com configuração:", config);
      
      await scanner.start(
        getCameraConfig(),
        config,
        handleDecodedText,
        handleScanError
      );
      
      setStatus("PRONTO");
      console.log("Scanner iniciado com sucesso");
    } catch (err) {
      console.error("Falha ao iniciar câmera:", err);
      handleCameraError(err);
    }
  };

  const handleCameraError = (err) => {
    console.error("Erro de câmera:", err);
    
    if (err.name === 'NotAllowedError') {
      setStatus("SEM_CAMERA");
      setErro("Permissão de câmera negada. Por favor habilite nas configurações.");
      return;
    }
    
    retryCountRef.current += 1;
    
    if (retryCountRef.current > 2) {
      setStatus("SEM_CAMERA");
      setErro(isPWA() && isIOS() 
        ? "Problema com a câmera no PWA. Tente abrir no Safari."
        : "Não foi possível acessar a câmera.");
      return;
    }

    setTimeout(iniciarCamera, retryCountRef.current * 2000);
  };

  const handleDecodedText = async (decodedText) => {
    if (isProcessingRef.current || status !== "PRONTO") return;
    
    isProcessingRef.current = true;
    setStatus("LENDO");
    
    try {
      // Parar scanner temporariamente
      if (html5QrcodeRef.current?.isScanning) {
        await html5QrcodeRef.current.pause();
      }

      const { qrcode_id, tipo } = parseQR(decodedText);
      
      if (!qrcode_id) {
        throw new Error("QR Code inválido");
      }

      const tipoNormalizado = tipo ? tipo.toLowerCase() : "entrada";
      const tiposValidos = ["entrada", "saida", "saída"];
      
      if (tipo && !tiposValidos.includes(tipoNormalizado)) {
        throw new Error(`Tipo inválido: ${tipo}`);
      }

      const res = await fetch("https://eventos-wi35.onrender.com/api/frequencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrcode_id, tipo: tipoNormalizado }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.mensagem || `Erro ${res.status}`);
      }

      const data = await res.json();
      setResultado({ ...data, tipo: tipoNormalizado });
      setStatus("SUCESSO");
      
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      playBeep(900, 120);
      
      setTimeout(() => {
        isProcessingRef.current = false;
        iniciarCamera();
      }, 2000);
    } catch (err) {
      console.error("Erro:", err);
      setStatus("ERRO");
      setErro(err.message);
      
      setTimeout(() => {
        isProcessingRef.current = false;
        iniciarCamera();
      }, 2500);
    }
  };

  const handleScanError = (err) => {
    if (!err.includes("NotFoundException")) {
      console.warn("Erro de leitura:", err);
    }
  };

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

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        Leitor de QR Code — Admin
        <button onClick={onLogout} style={styles.logoutButton} aria-label="Sair">
          ⎋
        </button>
      </header>

      <div style={styles.scannerArea}>
        {showPWAWarning && (
          <div style={styles.warningBox}>
            <h3 style={styles.warningTitle}>⚠️ Aviso - PWA no iOS</h3>
            <p style={styles.warningText}>
              No iOS, a câmera pode ter melhor desempenho quando aberta no Safari.
              Para melhor experiência:
            </p>
            <ol style={styles.warningList}>
              <li>Abra no Safari</li>
              <li>Conceda permissão de câmera</li>
              <li>Adicione à tela inicial novamente</li>
            </ol>
            <button 
              onClick={() => {
                setShowPWAWarning(false);
                iniciarCamera();
              }}
              style={styles.actionButton}
            >
              Tentar no PWA
            </button>
          </div>
        )}

        <div style={styles.cameraContainer}>
          <div id="leitor-qr-admin" ref={scannerRef} style={styles.cameraView} />
          
          {status !== "PRONTO" && status !== "PWA_WARNING" && (
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
                  <p>❌ {erro || "Câmera não acessível"}</p>
                  <button onClick={iniciarCamera} style={styles.actionButton}>
                    Tentar Novamente
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

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
              <button onClick={iniciarCamera} style={styles.actionButton}>
                Tentar Novamente
              </button>
            </div>
          )}
        </div>
      </div>

      <footer style={styles.footer}>
        © {new Date().getFullYear()} Prefeitura de Marabá — Educacenso
      </footer>
    </div>
  );
}

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
  warningBox: {
    background: "#fff3cd",
    border: "1px solid #ffeaa7",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "20px",
    textAlign: "center",
    width: "100%",
  },
  warningTitle: {
    color: "#856404",
    margin: "0 0 8px 0",
    fontSize: "16px",
    fontWeight: "bold",
  },
  warningText: {
    color: "#856404",
    margin: "0 0 12px 0",
    fontSize: "14px",
    lineHeight: "1.4",
  },
  warningList: {
    textAlign: "left",
    paddingLeft: "20px",
    margin: "12px 0",
    fontSize: "14px",
    color: "#856404",
  },
  cameraContainer: {
    width: "280px",
    height: "280px",
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