"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { api } from "@/utils/api";
import Fireworks from "./Firework";

export default function Tentacao({ entries }: { entries: any[] }) {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<any>(null);
  const [winnerPopup, setWinnerPopup] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlaying2, setIsPlaying2] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioRef2 = useRef<HTMLAudioElement | null>(null);

  const stripRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const faceWidth = 200 + 16;
  const containerWidth = 400;

  useEffect(() => {
    audioRef.current = new Audio("/tentacao.mp3");
    audioRef.current.loop = true;

    audioRef2.current = new Audio("/vitoria.mp3");
    audioRef2.current.loop = false;

    return () => {
      audioRef.current?.pause();
      audioRef2.current?.pause();
      audioRef.current = null;
      audioRef2.current = null;
    };
  }, []);

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

  // Função que inicia o sorteio e toca o áudio do pião
  const iniciarSorteio = () => {
    setWinner(null);
    setWinnerPopup(false);
    setSpinning(true);
    setSpeed(5);

    // Tocar o áudio do pião aqui, após interação do usuário (clique no botão)
    if (audioRef.current && !isPlaying) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          console.log("🎵 Áudio do pião tocando");
        })
        .catch((e) => {
          console.warn("Erro ao tocar o áudio do pião:", e);
        });
    }

    setTimeout(() => {
      let currentSpeed = 5;
      const deceleration = setInterval(() => {
        currentSpeed -= 0.05;

        if (currentSpeed <= 0.05) {
          clearInterval(deceleration);
          setSpeed(0);
          setSpinning(false);

          // Parar o áudio do pião
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            console.log("⏹️ Áudio do pião parado");
          }

          // Centralizar o pião no vencedor aproximado
          const offset = containerWidth / 2 - faceWidth / 2;
          const totalFaces = entries.length;
          let index = Math.round(-positionRef.current / faceWidth) % totalFaces;
          if (index < 0) index += totalFaces;

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
    }, 25000);
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

        // Parar o áudio do pião ao encontrar vencedor
        if (audioRef.current && isPlaying) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setIsPlaying(false);
          console.log("⏹️ Áudio do pião parado após vencedor");
        }

        // Tocar o áudio da vitória
        if (audioRef2.current) {
          audioRef2.current
            .play()
            .then(() => {
              setIsPlaying2(true);
              console.log("🎉 Áudio da vitória tocando");
            })
            .catch((e) => {
              console.warn("Erro ao tocar áudio da vitória:", e);
            });
        }

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
              if (stripRef.current) stripRef.current.style.transition = "";
            }, 1600);
          }
        }
      } catch (err: any) {
        if (err?.response?.status !== 404) {
          console.log(err?.response?.data?.message || err.message);
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [winner, entries, isPlaying]);

  const handleCloseWinner = () => {
    setWinnerPopup(false);
    setWinner(null);
    if (audioRef2.current && isPlaying2) {
      audioRef2.current.pause();
      audioRef2.current.currentTime = 0;
      setIsPlaying2(false);
    }
  };

  return (
    <div className="relative">
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

      <div className="relative w-[400px] h-[400px] mx-auto overflow-hidden rounded-full bg-black my-12">
        <div className="absolute inset-0 rounded-full border-[50px] border-red-700 shadow-[inset_-1px_-2px_0px_3px_rgba(150,0,0,1),inset_-1px_-2px_10px_10px_rgba(0,0,0,0.5),-2px_-2px_0px_3px_rgba(150,0,0,1),-4px_-4px_10px_10px_rgba(0,0,0,0.5)] z-10 pointer-events-none"></div>

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

      {winner && winnerPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
          <Fireworks />
          <div className="bg-white p-6 rounded-2xl text-center shadow-xl min-w-xl h-[350px] py-12">
            <h2 className="text-5xl font-bold text-green-700 mb-12">
              🎉 Vencedor! 🎉
            </h2>
            <p className="text-4xl font-semibold text-gray-800 mb-8">
              {winner.chosenBy || "Convidado"} - Nº {winner.number}
            </p>
            <p className="text-lg text-gray-500 mt-2">
              Liberado em: {new Date(winner.chosenAt).toLocaleString()}
            </p>
            <button
              onClick={handleCloseWinner}
              className="bg-green-900 w-[60%] mt-8 py-2 rounded-xl cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
