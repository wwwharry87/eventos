import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const corPrimaria = "#0479B3";

function parseQR(qr) {
  // Esperado: qrcode_id-tipo (tipo = entrada/saida)
  const [qrcode_id, tipo] = (qr || "").split("-");
  return { qrcode_id, tipo };
}

export default function AdminLeitorQR({ onLogout }) {
  const scannerRef = useRef();
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState("");
  const [lendo, setLendo] = useState(true);

  useEffect(() => {
    let scanner;
    const iniciar = async () => {
      setErro("");
      setLendo(true);
      setResultado(null);

      if (!scannerRef.current) return;
      if (window.Html5QrcodeScanner) window.Html5QrcodeScanner.clear();

      scanner = new Html5Qrcode("leitor-qr-admin");
      scanner
        .start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1,
          },
          async (decodedText) => {
            setLendo(false);
            scanner.stop();
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
              // Beep/vibrar
              if (window.navigator.vibrate) window.navigator.vibrate(180);
              if (window.AudioContext || window.webkitAudioContext) {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                osc.type = "sine";
                osc.frequency.value = 900;
                osc.connect(ctx.destination);
                osc.start();
                setTimeout(() => { osc.stop(); ctx.close(); }, 120);
              }
            } catch (err) {
              setErro(err.message);
            }
          },
          (errMsg) => {
            setErro("Não foi possível acessar a câmera. Tente liberar permissão.");
            setLendo(false);
          }
        )
        .catch((e) => setErro("Erro ao iniciar o scanner: " + e.message));

      return () => {
        if (scanner) scanner.stop();
      };
    };

    iniciar();

    return () => {
      if (scanner) scanner.stop();
    };
    // eslint-disable-next-line
  }, []);

  // Para reiniciar leitura
  const handleReiniciar = () => {
    window.location.reload();
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#f5f8fa",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <header
        style={{
          background: corPrimaria,
          color: "#fff",
          width: "100vw",
          padding: "24px 0 10px 0",
          textAlign: "center",
          fontWeight: 700,
          fontSize: "clamp(17px,4vw,23px)",
          position: "relative",
        }}
      >
        Leitor de QR Code — Admin
        <button
          onClick={onLogout}
          style={{
            position: "absolute",
            top: 12,
            right: 18,
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: 26,
            cursor: "pointer",
          }}
          title="Sair"
        >
          ⎋
        </button>
      </header>

      <div
        style={{
          marginTop: 14,
          width: "98vw",
          maxWidth: 360,
          minHeight: 360,
          borderRadius: 20,
          background: "#fff",
          boxShadow: "0 2px 12px #0002",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 18,
          position: "relative",
        }}
      >
        <div
          ref={scannerRef}
          id="leitor-qr-admin"
          style={{
            width: 240,
            height: 240,
            margin: "0 auto",
            background: "#f5f8fa",
            borderRadius: 12,
            boxShadow: "0 2px 8px #0074b22e",
          }}
        />
        {lendo && (
          <div style={{ marginTop: 12, color: corPrimaria, fontWeight: 600 }}>
            Aponte a câmera para o QR Code do funcionário.
          </div>
        )}
        {erro && (
          <div
            style={{
              marginTop: 16,
              color: "#d32f2f",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            {erro}
            <button
              style={{
                marginTop: 10,
                background: corPrimaria,
                color: "#fff",
                border: "none",
                borderRadius: 7,
                padding: "7px 18px",
                fontWeight: 600,
                cursor: "pointer",
                marginLeft: 8,
              }}
              onClick={handleReiniciar}
            >
              Reiniciar
            </button>
          </div>
        )}
        {resultado && (
          <div
            style={{
              marginTop: 16,
              background: "#eafaea",
              color: "#114",
              borderRadius: 8,
              padding: "15px 10px",
              boxShadow: "0 1px 6px #34b23318",
              textAlign: "center",
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            {resultado.nome ? (
              <>
                <div>
                  ✅ Frequência {resultado.tipo === "entrada" ? "de ENTRADA" : "de SAÍDA"} registrada!
                </div>
                <div style={{ color: corPrimaria, fontWeight: 700, marginTop: 3 }}>
                  {resultado.nome}
                </div>
                <div style={{ fontSize: 14, color: "#666" }}>
                  {new Date(resultado.data_hora).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </div>
              </>
            ) : (
              <span>Registro não encontrado.</span>
            )}
            <button
              onClick={handleReiniciar}
              style={{
                marginTop: 10,
                background: corPrimaria,
                color: "#fff",
                border: "none",
                borderRadius: 7,
                padding: "7px 18px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Ler outro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
