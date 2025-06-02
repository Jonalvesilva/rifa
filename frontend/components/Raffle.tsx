"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";
import Tentacao from "./Tentacao";

export default function Raffle() {
  const [entries, setEntries] = useState<any[]>([]);
  const [winner, setWinner] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      const res = await api.get("sorteio/");
      setEntries(res.data);
    };
    fetchEntries();
  }, []);

  const startSpin = () => {
    if (entries.length === 0) return;

    setIsRunning(true);
    setWinner(null);

    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % entries.length);
    }, 100); // Velocidade do giro: menor é mais rápido

    setIntervalId(id);
  };

  const stopSpin = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    setIsRunning(false);

    const selected = entries[currentIndex];
    setWinner(selected);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-4">
        🎉 Sorteio - Pião da Tentação 🎉
      </h1>

      <Tentacao entries={entries} />
    </div>
  );
}
