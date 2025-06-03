import { Schema, model } from "mongoose";

interface IInvitation {
  inviteId: string; // Exemplo: "convite123"
  invitedName: string; // Nome do convidado (opcional)
  used: boolean;
  inParty: boolean;
}

const InvitationSchema = new Schema<IInvitation>({
  inviteId: { type: String, required: true, unique: true },
  invitedName: { type: String },
  used: { type: Boolean, default: false },
  inParty: { type: Boolean, default: false },
});

export const InvitationModel = model<IInvitation>(
  "Invitation",
  InvitationSchema
);
