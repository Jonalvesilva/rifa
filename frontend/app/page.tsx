"use client";
import { errorToast, successToast } from "@/utils/toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/utils/api";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { GoldenTicketModal } from "@/components/GoldenTicket";
import { ImSpinner2 } from "react-icons/im";

export default function Home() {
  const numbers = [...Array(40)].map((_, index) => index + 1);
  const [notChooseNumbers, setNotChooseNumbers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [inviteId, setInviteId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTicketOpen, setTicketModalOpen] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNumbers = async () => {
      try {
        const res = await api.get(`/numbers`);

        setNotChooseNumbers(res.data.availableNumbers);
      } catch (error) {
        errorToast("Falha ao obter numeros escolhidos");
        console.error(error);
      }
    };

    fetchNumbers();
  }, []);

  const handleNumberClick = async (num: number) => {
    setModalOpen(true);
    setSelected(num);
  };

  const handleConfirm = async () => {
    if (!selected || !inviteId) {
      errorToast("Preencha o código do convite");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(`/choose-number`, {
        number: selected,
        inviteId,
      });
      successToast(
        `Número escolhido com sucesso! Boa sorte, ${response.data.chosenBy}!`
      );

      setModalOpen(false);
      setInviteId("");
      setSelected(null);
      setLoading(false);

      // Atualizar números após escolher
      const res = await api.get(`/numbers`);
      setNotChooseNumbers(res.data.availableNumbers);
    } catch (err: any) {
      errorToast(err.response?.data?.message || "Erro ao escolher número");
      setLoading(false);
    }
  };

  const handleNumberInfo = async (num: number) => {
    try {
      const res = await api.get(`/${num}`);
      setTicketData(res.data);
      setTicketModalOpen(true);
    } catch (error) {
      errorToast("Falha ao buscar informações");
      console.log(error);
    }
  };

  useEffect(() => {
    setInviteId("");
  }, [modalOpen]);

  return (
    <section className="bg-[url('/teste.jpg')] w-full bg-cover">
      <div className="w-full bg-black/80">
        <div className="min-h-screen max-w-xl mx-auto p-6 flex items-center justify-center flex-col ">
          <h1 className="text-2xl font-bold mb-4 text-white">
            Escolha seu Número
          </h1>

          <div className="grid grid-cols-5 gap-2 flex-1 w-full">
            {numbers.map((num) =>
              notChooseNumbers.includes(num) ? (
                <Card
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  className="cursor-pointer flex items-center justify-center bg-white shadow-sm shadow-gray-300 hover:bg-gray-100 p-2"
                >
                  <CardContent className="p-2 text-2xl">{num}</CardContent>
                </Card>
              ) : (
                <Card
                  key={num}
                  onClick={() => handleNumberInfo(num)}
                  className="flex items-center justify-center bg-gray-500 text-black/80 shadow-sm shadow-white font-bold p-2 cursor-pointer"
                >
                  <CardContent className="p-2 text-2xl text-white">
                    {num}
                  </CardContent>
                </Card>
              )
            )}
          </div>

          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Escolha - Numero {selected}</DialogTitle>
              </DialogHeader>

              <Input
                placeholder="Digite o código do convite"
                value={inviteId}
                onChange={(e) => setInviteId(e.target.value)}
                className="mb-4"
              />

              <DialogFooter>
                <Button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="md:w-[150px]"
                >
                  {loading ? (
                    <ImSpinner2 className="animate-spin text-white" size={20} />
                  ) : (
                    "Confirmar Número"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <GoldenTicketModal
            isOpen={modalTicketOpen}
            onClose={() => setTicketModalOpen(false)}
            data={ticketData!}
          />
        </div>
      </div>
    </section>
  );
}
