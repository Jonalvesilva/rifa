"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { api } from "@/utils/api";
import { errorToast } from "@/utils/toast";

export default function Tentacao({ entries }: { entries: any[] }) {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<any>(null);
  const [winnerPopup, setWinnerPopup] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const faceWidth = 200 + 16;
  const containerWidth = 400;

  // Gira o pião
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      if (speed <= 0) return;

      positionRef.current -= speed;

      if (Math.abs(positionRef.current) >= entries.length * faceWidth) {
        positionRef.current = 0;
      }

      if (stripRef.current) {
        stripRef.current.style.transform = `translateX(${positionRef.current}px)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    if (speed > 0) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [speed, entries.length]);

  // Inicia o sorteio
  const iniciarSorteio = () => {
    setWinner(null);
    setWinnerPopup(false);
    setSpinning(true);
    setSpeed(3.5);
    handlePlay();

    setTimeout(() => {
      let currentSpeed = 3.5;
      const deceleration = setInterval(() => {
        currentSpeed -= 0.05;

        if (currentSpeed <= 0.05) {
          clearInterval(deceleration);
          setSpeed(0);
          setSpinning(false);

          handlePause();
          handleReset();

          // 👉 Centraliza o QR Code mais próximo do centro
          const offset = containerWidth / 2 - faceWidth / 2;
          const totalFaces = entries.length;
          let index = Math.round(-positionRef.current / faceWidth) % totalFaces;
          if (index < 0) index += totalFaces; // evita índice negativo

          positionRef.current = -index * faceWidth + offset;

          if (stripRef.current) {
            stripRef.current.style.transition = "transform 1.5s ease-out";
            stripRef.current.style.transform = `translateX(${positionRef.current}px)`;
            setTimeout(() => {
              if (stripRef.current) stripRef.current.style.transition = "";
            }, 1600);
          }
        } else {
          setSpeed(currentSpeed);
        }
      }, 200);
    }, 20000);
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (winner) return;

      try {
        const res = await api.get("scan/winner");
        const data = res.data;

        console.log("🔍 Vencedor encontrado:", data);

        setWinner(data);
        setWinnerPopup(true);

        // 👉 Centraliza o QR Code do vencedor
        const winnerIndex = entries.findIndex(
          (e) => e.qrcodeToken === data.qrcodeToken
        );
        if (winnerIndex !== -1) {
          const offset = containerWidth / 2 - faceWidth / 2;
          positionRef.current = -winnerIndex * faceWidth + offset;

          if (stripRef.current) {
            stripRef.current.style.transition = "transform 1.5s ease-out";
            stripRef.current.style.transform = `translateX(${positionRef.current}px)`;
            setTimeout(() => {
              if (stripRef.current) {
                stripRef.current.style.transition = "";
              }
            }, 1600);
          }
        }

        // Oculta o popup depois de 20s
        setTimeout(() => {
          setWinnerPopup(false);
          setWinner(null); // permite detectar um novo desbloqueio
        }, 20000);
      } catch (err: any) {
        if (err?.response?.status !== 404) {
          //errorToast("Erro ao buscar vencedor:");
          console.log(err?.response?.data?.message || err.message);
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [winner, entries]);

  useEffect(() => {
    // Cria o elemento de áudio
    audioRef.current = new Audio("/tentacao.mp3");
    audioRef.current.loop = true;

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const handlePlay = () => {
    audioRef.current?.play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      //audioRef.current.play();
      //setIsPlaying(true);
    }
  };

  return (
    <div className="relative">
      {/* Botão Iniciar */}
      <div className="text-center mt-8">
        {!spinning && speed === 0 && (
          <button
            onClick={iniciarSorteio}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl text-xl shadow-md"
          >
            Iniciar Sorteio
          </button>
        )}
      </div>

      {/* Pião */}
      <div className="relative w-[400px] h-[400px] mx-auto overflow-hidden rounded-full bg-black my-12">
        {/* Moldura */}
        <div className="absolute inset-0 rounded-full border-[50px] border-red-700 shadow-[inset_-1px_-2px_0px_3px_rgba(150,0,0,1),inset_-1px_-2px_10px_10px_rgba(0,0,0,0.5),-2px_-2px_0px_3px_rgba(150,0,0,1),-4px_-4px_10px_10px_rgba(0,0,0,0.5)] z-10 pointer-events-none"></div>

        {/* Container centralizado */}
        <div
          ref={containerRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[320px] flex items-center"
          style={{ overflow: "visible", width: containerWidth }}
        >
          <div
            ref={stripRef}
            className="flex h-full"
            style={{ willChange: "transform" }}
          >
            {entries.map((entry, idx) => (
              <div
                key={idx}
                className="w-[200px] h-full bg-white border-4 border-black flex items-center justify-center mx-2"
              >
                <QRCode value={entry.qrcodeToken} size={120} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popup do vencedor */}
      {winner && winnerPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
          <div className="bg-white p-6 rounded-2xl text-center shadow-xl max-w-md">
            <h2 className="text-2xl font-bold text-green-700 mb-4">
              🎉 Vencedor!
            </h2>
            <p className="text-lg font-semibold text-gray-800">
              {winner.chosenBy || "Convidado"} - Nº {winner.number}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Liberado em: {new Date(winner.chosenAt).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
