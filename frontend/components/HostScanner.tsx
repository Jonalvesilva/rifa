"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { api } from "@/utils/api";

export default function HostScanner() {
  const qrRegionId = "qr-reader";
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const cameraIdRef = useRef<string | null>(null);
  const [overlay, setOverlay] = useState<{
    message: string;
    color: "green" | "red";
  } | null>(null);

  useEffect(() => {
    html5QrCodeRef.current = new Html5Qrcode(qrRegionId);

    Html5Qrcode.getCameras()
      .then((devices) => {
        const camera =
          devices.find((d) => d.label.toLowerCase().includes("back")) ||
          devices[0];

        cameraIdRef.current = camera.id;

        html5QrCodeRef.current?.start(
          { deviceId: { exact: camera.id } },
          { fps: 10, qrbox: 250 },
          onScanSuccess,
          () => {}
        );
      })
      .catch(() =>
        setOverlay({ message: "Erro ao acessar câmera", color: "red" })
      );

    return () => {
      html5QrCodeRef.current?.stop().catch(() => {});
      html5QrCodeRef.current = null;
    };
  }, []);

  function onScanSuccess(decodedText: string) {
    html5QrCodeRef.current?.stop().then(() => {
      desbloquearVencedor(decodedText);
    });
  }

  async function desbloquearVencedor(token: string) {
    try {
      const res = await api.post(
        "/scan/unlock-winner",
        { token },
        {
          headers: {
            "device-id": "SEU_DEVICE_ID_SEGREDO",
          },
        }
      );

      setOverlay({ message: "✅ Vencedor liberado!", color: "green" });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "❌ Erro ao liberar vencedor";
      setOverlay({ message: msg, color: "red" });
    } finally {
      setTimeout(() => {
        setOverlay(null);
        html5QrCodeRef.current?.start(
          { deviceId: { exact: cameraIdRef.current! } },
          { fps: 10, qrbox: 250 },
          onScanSuccess,
          () => {}
        );
      }, 3000);
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto text-center relative">
      <h1 className="text-xl font-bold mb-4">Leitura do QR Code</h1>

      <div
        id={qrRegionId}
        style={{
          width: 320,
          height: 425,
          margin: "0 auto",
          background: "#000",
        }}
      />

      {overlay && (
        <div
          className={`absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center text-white text-2xl font-bold transition-opacity bg-opacity-80 z-50 ${
            overlay.color === "green" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {overlay.message}
        </div>
      )}
    </div>
  );
}
