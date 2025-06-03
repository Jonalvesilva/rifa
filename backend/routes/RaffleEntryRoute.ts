import express from "express";
import QRCode from "qrcode";
import { RaffleEntryModel } from "../models/RaffleEntry";
import { generateToken } from "../utils/token";
import { InvitationModel } from "../models/Invitation";
import dotenv from "dotenv";
import { Request, Response } from "express";

dotenv.config();

const MAX_RAFFLE_NUMBERS = process.env.MAX_RAFFLE_NUMBERS!;

const router = express.Router();

router.post(
  "/choose-number",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { number, inviteId } = req.body;

      if (!number || !inviteId) {
        res.status(400).json({ message: "Número e convite são obrigatórios." });
        return;
      }

      if (number < 1 || number > MAX_RAFFLE_NUMBERS) {
        res.status(400).json({
          message: `Número deve ser entre 1 e ${MAX_RAFFLE_NUMBERS}.`,
        });
        return;
      }

      const invitation = await InvitationModel.findOne({ inviteId });
      if (!invitation) {
        res.status(404).json({ message: "Convite não encontrado." });
        return;
      }

      if (invitation.used) {
        res.status(409).json({ message: "Este convite já foi usado." });
        return;
      }

      const exists = await RaffleEntryModel.findOne({ number });
      if (exists) {
        res.status(409).json({ message: "Número já escolhido." });
        return;
      }

      const qrcodeToken = generateToken();

      const entry = new RaffleEntryModel({
        number,
        chosenBy: invitation.invitedName, // Nome do convidado do convite
        qrcodeToken,
      });

      await entry.save();

      invitation.used = true;
      await invitation.save();

      const qrCodeData = await QRCode.toDataURL(qrcodeToken);

      res.json({
        message: "Número escolhido com sucesso!",
        qrcodeToken,
        qrCodeData,
        chosenBy: invitation.invitedName,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro interno no servidor." });
    }
  }
);

router.get("/numbers", async (req, res) => {
  const chosenNumbers = await RaffleEntryModel.find({}, { number: 1, _id: 0 });
  const chosenSet = new Set(chosenNumbers.map((item) => item.number));

  const availableNumbers = [];
  for (let i = 1; i <= +MAX_RAFFLE_NUMBERS; i++) {
    if (!chosenSet.has(i)) {
      availableNumbers.push(i);
    }
  }

  res.json({ availableNumbers });
  return;
});

router.get("/sorteio", async (req, res) => {
  try {
    const entries = await RaffleEntryModel.find();

    if (!entries || entries.length === 0) {
      res
        .status(404)
        .json({ message: "Nenhum participante encontrado para o sorteio." });
      return;
    }

    res.json(entries);
    return;
  } catch (error) {
    console.error("Erro ao buscar participantes:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
    return;
  }
});

router.get("/:number", async (req, res) => {
  const number = +req.params.number;
  const getNumber = await RaffleEntryModel.findOne({ number: number });

  res.json(getNumber);
  return;
});

export default router;
