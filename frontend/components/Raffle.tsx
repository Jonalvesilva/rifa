"use client";

import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import Tentacao from "./Tentacao";

export default function Raffle() {
  const [entries, setEntries] = useState<any[]>([]);
  const [winner, setWinner] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  console.log(
    winner,
    isRunning,
    setWinner,
    setIsRunning,
    currentIndex,
    setCurrentIndex,
    intervalId,
    setIntervalId
  );

  useEffect(() => {
    const fetchEntries = async () => {
      const res = await api.get("sorteio/");
      setEntries(res.data);
    };
    fetchEntries();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-4">
        🎉 Sorteio - Pião da Tentação 🎉
      </h1>

      <Tentacao entries={entries} />
    </div>
  );
}
