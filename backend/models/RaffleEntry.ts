import { Schema, model } from "mongoose";

interface IRaffleEntry {
  number: number;
  chosenBy: string;
  chosenAt: Date;
  qrcodeToken: string;
  unlocked: boolean;
}

const RaffleEntrySchema = new Schema<IRaffleEntry>({
  number: { type: Number, required: true, unique: true },
  chosenBy: { type: String, required: true },
  chosenAt: { type: Date, default: Date.now },
  qrcodeToken: { type: String, required: true, unique: true },
  unlocked: {
    type: Boolean,
    default: false,
  },
});

export const RaffleEntryModel = model<IRaffleEntry>(
  "RaffleEntry",
  RaffleEntrySchema
);
