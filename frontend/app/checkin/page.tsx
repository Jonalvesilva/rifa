"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { api } from "@/utils/api"; // ajuste conforme seu caminho

type OverlayStatus = "success" | "error" | "info";

export default function GuestCheckInScanner() {
  const qrRegionId = "qr-reader";
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const cameraIdRef = useRef<string | null>(null);
  const [overlayMessage, setOverlayMessage] = useState<string>("");
  const [overlayStatus, setOverlayStatus] = useState<OverlayStatus>("info");

  useEffect(() => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode(qrRegionId);
    }

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          const backCamera = devices.find((d) =>
            d.label.toLowerCase().includes("back")
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
              showMessage(
                "Erro ao iniciar câmera: " + (err?.message || err),
                "error"
              );
            });
        } else {
          showMessage("Nenhuma câmera encontrada.", "error");
        }
      })
      .catch((err) => {
        showMessage("Erro ao obter câmeras: " + (err?.message || err), "error");
      });

    return () => {
      html5QrCodeRef.current?.stop().catch(() => {});
      html5QrCodeRef.current = null;
    };
  }, []);

  function onScanSuccess(decodedText: string) {
    html5QrCodeRef.current?.stop();
    showMessage("🔍 Verificando convite...", "info");
    verificarConvite(decodedText);
  }

  function onScanFailure(error: string) {
    console.log(error);
  }

  function showMessage(msg: string, status: OverlayStatus = "info") {
    setOverlayMessage(msg);
    setOverlayStatus(status);
    setTimeout(() => {
      setOverlayMessage("");
    }, 3000);
  }

  async function verificarConvite(inviteId: string) {
    try {
      const res = await api.post("/check-in", { inviteId });
      const data = res.data;
      showMessage(
        `✅ Bem-vindo(a), ${data.invitedName || "convidado"}!`,
        "success"
      );
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 409) {
          showMessage(`⚠️ ${data.message}`, "error");
        } else {
          showMessage(`❌ ${data.message || "Erro desconhecido."}`, "error");
        }
      } else {
        showMessage("Erro na requisição: " + error.message, "error");
      }
    } finally {
      if (cameraIdRef.current && html5QrCodeRef.current) {
        html5QrCodeRef.current
          .start(
            { deviceId: { exact: cameraIdRef.current } },
            { fps: 10, qrbox: 250 },
            onScanSuccess,
            onScanFailure
          )
          .catch((err) =>
            showMessage(
              "Erro ao reiniciar câmera: " + (err?.message || err),
              "error"
            )
          );
      }
    }
  }

  const overlayColor = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-yellow-500",
  }[overlayStatus];

  return (
    <div className="p-4 max-w-md mx-auto text-center relative">
      <h1 className="text-xl font-bold mb-4">Entrada de Convidados</h1>
      <div
        id={qrRegionId}
        style={{
          width: "320px",
          height: "425px",
          margin: "0 auto",
          backgroundColor: "#000",
        }}
      ></div>

      {overlayMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div
            className={`text-white text-2xl font-bold text-center px-8 py-6 rounded-xl border shadow-lg ${overlayColor}`}
          >
            {overlayMessage}
          </div>
        </div>
      )}
    </div>
  );
}
