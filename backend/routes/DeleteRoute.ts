import express from "express";
import { RaffleEntryModel } from "../models/RaffleEntry";
import { InvitationModel } from "../models/Invitation";

const router = express.Router();

router.delete("/", async (req, res) => {
  try {
    // 1. Deleta todos os sorteios
    const raffleResult = await RaffleEntryModel.deleteMany({});

    // 2. Reseta todos os convites usados
    const inviteResult = await InvitationModel.updateMany(
      { used: true },
      { $set: { used: false } }
    );

    res.status(200).json({
      message: "Sorteios apagados e convites resetados.",
      deletedRaffles: raffleResult.deletedCount,
      resetInvites: inviteResult.modifiedCount,
    });
  } catch (error) {
    console.error("Erro ao reiniciar sorteio:", error);
    res.status(500).json({ error: "Erro ao reiniciar sorteio." });
  }
});

export default router;
