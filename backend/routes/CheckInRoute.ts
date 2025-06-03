// routes/checkIn.ts
import express from "express";
import { InvitationModel } from "../models/Invitation";

const router = express.Router();

router.post("/check-in", async (req, res) => {
  const { inviteId } = req.body;

  if (!inviteId) {
    res.status(400).json({ message: "inviteId é obrigatório." });
    return;
  }

  const invitation = await InvitationModel.findOne({ inviteId });

  if (!invitation) {
    res.status(404).json({ message: "Convite não encontrado." });
    return;
  }

  if (invitation.inParty) {
    res.status(409).json({
      message: `Convite já utilizado por ${
        invitation.invitedName || "convidado"
      }.`,
    });
    return;
  }

  // Marca como usado
  invitation.inParty = true;
  await invitation.save();

  res.status(200).json({
    success: true,
    message: `Bem-vindo(a), ${invitation.invitedName || "convidado"}!`,
    invitedName: invitation.invitedName,
  });
  return;
});

export default router;
