import express from "express";
import { RaffleEntryModel } from "../models/RaffleEntry";

const router = express.Router();

// Variável global para guardar o token do vencedor desbloqueado
let unlockedWinnerToken: string | null = null;

// Rota para o anfitrião liberar o vencedor (exemplo)
router.post("/unlock-winner", (req, res) => {
  const deviceId = req.headers["device-id"] as string;
  if (deviceId !== process.env.HOST_DEVICE_ID) {
    res.status(403).json({ message: "Dispositivo não autorizado" });
    return;
  }

  const { token } = req.body;
  if (!token) {
    res.status(400).json({ message: "Token é obrigatório" });
    return;
  }

  unlockedWinnerToken = token;
  res.json({ success: true, message: "Vencedor desbloqueado." });
  return;
});

// Rota para o sorteio consultar o vencedor desbloqueado
router.get("/winner", async (req, res) => {
  if (!unlockedWinnerToken) {
    res.status(404).json({ message: "Nenhum vencedor liberado" });
    return;
  }

  try {
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
    return;
  } catch (error) {
    console.error("Erro ao buscar vencedor:", error);
    res.status(500).json({ message: "Erro interno no servidor" });
    return;
  }
});

export default router;
