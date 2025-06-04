// routes/unlockWinner.ts
import express from "express";
import { RaffleEntryModel } from "../models/RaffleEntry";
import { io } from "../index"; // Importa o io exportado do server.ts

const router = express.Router();

router.post("/unlock-winner", async (req, res) => {
  const deviceId = req.headers["device-id"];
  if (deviceId !== process.env.HOST_DEVICE_ID) {
    res.status(403).json({ message: "Dispositivo não autorizado" });
    return;
  }

  const { token } = req.body;
  const entry = await RaffleEntryModel.findOne({ qrcodeToken: token });
  if (!entry) {
    res.status(404).json({ message: "Token inválido" });
    return;
  }

  // Emitir evento para todos os clientes conectados
  io.emit("winner-unlocked", {
    number: entry.number,
    chosenBy: entry.chosenBy,
    chosenAt: entry.chosenAt,
  });

  res.json({ success: true });
  return;
});

export default router;
