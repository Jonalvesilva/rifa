import express from "express";
import { RaffleEntryModel } from "../models/RaffleEntry";

const router = express.Router();
let unlockedWinnerToken: any;

// API para o anfitrião liberar o vencedor
router.post("/unlock-winner", (req, res) => {
  const deviceId = req.headers["device-id"] as string;
  if (deviceId !== process.env.HOST_DEVICE_ID) {
    res.status(403).json({ message: "Dispositivo não autorizado" });
    return;
  }

  const { token } = req.body;
  // Verifique e guarde que o vencedor está liberado (ex: em memória, DB, cache)
  unlockedWinnerToken = token; // variável global (exemplo)
  res.json({ success: true });
});

// API para o sorteio checar vencedor liberado
router.get("/winner", async (req, res) => {
  if (!unlockedWinnerToken) {
    res.status(404).json({ message: "Nenhum vencedor liberado" });
    return;
  }
  const entry = await RaffleEntryModel.findOne({
    qrcodeToken: unlockedWinnerToken,
  });
  if (!entry) {
    res.status(404).json({ message: "Token inválido" });
    return;
  }
  res.json({
    number: entry.number,
    chosenBy: entry.chosenBy,
    chosenAt: entry.chosenAt,
  });
});

export default router;
