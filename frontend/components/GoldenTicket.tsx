"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GoldenTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    number: number;
    chosenBy: string;
    qrcodeToken: string;
    chosenAt: string;
  };
}

export const GoldenTicketModal: React.FC<GoldenTicketModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-yellow-100 border-yellow-600">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-yellow-700 text-center">
            Golden Ticket
          </DialogTitle>
        </DialogHeader>

        {data ? (
          <div className="text-center space-y-4">
            <h2 className="text-xl text-yellow-800 font-semibold">
              Número: <span className="font-bold">{data.number}</span>
            </h2>
            <p className="text-yellow-800">
              Escolhido por: {data.chosenBy || "Desconhecido"}
            </p>
            <p className="text-yellow-800">
              Escolhido em:{" "}
              {data.chosenAt
                ? new Date(data.chosenAt).toLocaleString("pt-BR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "Data não disponível"}
            </p>
            <p className="text-yellow-800 font-semibold italic">
              Boa sorte no sorteio!
            </p>
          </div>
        ) : (
          <p className="text-yellow-800">Carregando...</p>
        )}
      </DialogContent>
    </Dialog>
  );
};
