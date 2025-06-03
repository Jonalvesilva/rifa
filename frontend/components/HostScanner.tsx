"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const deviceId = "ID-FIXO-DO-ANFITRIAO";

export default function HostScanner() {
  const qrRegionId = "qr-reader";
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const cameraIdRef = useRef<string | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode(qrRegionId);
    }

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          const backCamera = devices.find((device) =>
            device.label.toLowerCase().includes("back")
          );
          cameraIdRef.current = backCamera ? backCamera.id : devices[0].id;

          html5QrCodeRef.current
            ?.start(
              { deviceId: { exact: cameraIdRef.current } },
              { fps: 10, qrbox: 250 },
              onScanSuccess,
              onScanFailure
            )
            .catch((err) => {
              setMessage("Erro ao iniciar câmera: " + (err?.message || err));
            });
        } else {
          setMessage("Nenhuma câmera encontrada.");
        }
      })
      .catch((err) => {
        setMessage("Erro ao obter câmeras: " + (err?.message || err));
      });

    return () => {
      html5QrCodeRef.current?.stop().catch(() => {});
      html5QrCodeRef.current = null;
    };
  }, []);

  function onScanSuccess(decodedText: string) {
    html5QrCodeRef.current?.stop();
    setMessage("QR Code detectado: " + decodedText);
    liberarVencedor(decodedText);
  }

  function onScanFailure(error: string) {
    // Pode ignorar erros frequentes de leitura
    console.log(error);
  }

  async function liberarVencedor(token: string) {
    try {
      const res = await fetch("/api/unlock-winner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "device-id": deviceId,
        },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        setMessage("✅ Vencedor liberado com sucesso!");
      } else {
        const json = await res.json();
        setMessage("❌ Erro: " + (json.message || "Não autorizado"));
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage("Erro na requisição: " + error.message);
      } else if (typeof error === "string") {
        setMessage("Erro na requisição: " + error);
      } else {
        setMessage("Erro desconhecido na requisição.");
      }
    } finally {
      // Reiniciar leitura
      if (cameraIdRef.current && html5QrCodeRef.current) {
        html5QrCodeRef.current
          .start(
            { deviceId: { exact: cameraIdRef.current } },
            { fps: 10, qrbox: 250 },
            onScanSuccess,
            onScanFailure
          )
          .catch((err) => {
            const errMsg = err instanceof Error ? err.message : String(err);
            setMessage("Erro ao reiniciar câmera: " + errMsg);
          });
      }
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto text-center">
      <h1 className="text-xl font-bold mb-4">
        Leitura do QR Code do Anfitrião
      </h1>
      <div
        id={qrRegionId}
        style={{
          width: "320px",
          height: "425px",
          margin: "0 auto",
          backgroundColor: "#000",
        }}
      ></div>
      <p className="mt-4">{message}</p>
    </div>
  );
}
