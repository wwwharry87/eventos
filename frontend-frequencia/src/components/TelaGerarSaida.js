import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";


export default function TelaGerarSaida({ funcionario }) {
  const [mostrarQRCode, setMostrarQRCode] = useState(false);

  function handleGerarQRCode() {
    setMostrarQRCode(true);
    // Aqui pode registrar intenção de saída se desejar, ou só gerar o QR
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 24 }}>
      <h3>Saída do Evento</h3>
      {!mostrarQRCode ? (
        <button
          onClick={handleGerarQRCode}
          style={{ padding: 12, marginTop: 24, fontSize: 18 }}
        >
          Gerar QR Code de saída
        </button>
      ) : (
        <>
          <p>Mostre este QR Code na saída para registrar sua presença.</p>
          <QRCodeSVG value={funcionario.qrcode_id + "-saida"} size={180} />
        </>
      )}
    </div>
  );
}
