"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "react-qr-code";

export default function Tentacao({ entries }: { entries: any[] }) {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null); // container externo (centralizado)
  const stripRef = useRef<HTMLDivElement>(null); // faixa interna que anima horizontalmente
  const positionRef = useRef(0);

  const faceWidth = 200 + 16; // largura da face + margin
  const containerWidth = 400; // largura da moldura

  useEffect(() => {
    let animationFrameId: number;

    const step = () => {
      if (!spinning) return;

      positionRef.current -= 2.2;

      if (Math.abs(positionRef.current) >= entries.length * faceWidth) {
        positionRef.current = 0;
      }

      if (stripRef.current) {
        stripRef.current.style.transform = `translateX(${positionRef.current}px)`;
      }

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [spinning, entries.length]);

  const handleStop = () => {
    setSpinning(false);

    const winnerIndex =
      Math.abs(Math.round(positionRef.current / faceWidth)) % entries.length;

    setWinner(entries[winnerIndex]);

    // Offset para centralizar o QR code vencedor na moldura
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
  };

  const handleStart = () => {
    setWinner(null);
    setSpinning(true);
  };

  return (
    <>
      <div className="relative w-[400px] h-[400px] mx-auto overflow-hidden rounded-full bg-black my-12">
        {/* Moldura */}
        <div className="absolute inset-0 rounded-full border-[50px] border-red-700 shadow-[inset_-1px_-2px_0px_3px_rgba(150,0,0,1),inset_-1px_-2px_10px_10px_rgba(0,0,0,0.5),-2px_-2px_0px_3px_rgba(150,0,0,1),-4px_-4px_10px_10px_rgba(0,0,0,0.5)] z-10 pointer-events-none"></div>

        {/* Container centralizado */}
        <div
          ref={containerRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[320px] flex items-center"
          style={{
            overflow: "visible",
            width: containerWidth,
          }}
        >
          {/* Faixa horizontal que será movida só na horizontal */}
          <div
            ref={stripRef}
            className="flex h-full"
            style={{
              willChange: "transform",
            }}
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

      {/* Botões */}
      {spinning ? (
        <button
          onClick={handleStop}
          className="mt-12 bg-red-600 text-white px-4 py-2 rounded"
        >
          Parar Sorteio
        </button>
      ) : (
        <button
          onClick={handleStart}
          className="mt-12 bg-green-600 text-white px-4 py-2 rounded"
        >
          Iniciar Sorteio
        </button>
      )}
    </>
  );
}
