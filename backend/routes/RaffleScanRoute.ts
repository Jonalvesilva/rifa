import express from "express";
import { RaffleEntryModel } from "../models/RaffleEntry";

const router = express.Router();

// ✅ Libera o vencedor ao escanear o QR code
router.post("/unlock-winner", async (req, res) => {
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

  const updated = await RaffleEntryModel.findOneAndUpdate(
    { qrcodeToken: token },
    { $set: { unlocked: true, chosenAt: new Date() } },
    { new: true }
  );

  if (!updated) {
    res.status(404).json({ message: "Token não encontrado no banco" });
    return;
  }

  res.json({ success: true, message: "Vencedor desbloqueado" });
  return;
});

// ✅ Entrega o vencedor desbloqueado uma única vez
router.get("/winner", async (req, res) => {
  try {
    const entry = await RaffleEntryModel.findOne({ unlocked: true }).sort({
      chosenAt: -1,
    });

    if (!entry) {
      res.status(404).json({ message: "Nenhum vencedor desbloqueado" });
      return;
    }

    // Retorna os dados do vencedor
    res.json({
      number: entry.number,
      chosenBy: entry.chosenBy,
      chosenAt: entry.chosenAt,
      qrcodeToken: entry.qrcodeToken,
    });

    // Remove o campo `unlocked` para que ele não seja retornado de novo
    await RaffleEntryModel.updateOne(
      { _id: entry._id },
      { $unset: { unlocked: "" } }
    );
  } catch (error) {
    console.error("Erro ao buscar vencedor:", error);
    res.status(500).json({ message: "Erro interno no servidor" });
    return;
  }
});

export default router;
