"use client";
import { successToast, errorToast } from "@/utils/toast";
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

export default function Home() {
  const [numbers, setNumbers] = useState<number[]>(
    [...Array(40)].map((_, index) => index + 1)
  );
  const [notChooseNumbers, setNotChooseNumbers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [inviteId, setInviteId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTicketOpen, setTicketModalOpen] = useState(false);
  const [ticketData, setTicketData] = useState(null);

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
    // try {
    //   const res = await axios.get(`${API_URL}/number-info/${num}`);
    //   const { isTaken, chosenBy } = res.data;
    //   if (isTaken) {
    //     alert(`Número ${num} já foi escolhido por: ${chosenBy}`);
    //   } else {
    //     setSelected(num);
    //     setModalOpen(true);
    //   }
    // } catch (error) {
    //   console.error(error);
    //   alert("Erro ao verificar número");
    // }
  };

  const handleConfirm = async () => {
    if (!selected || !inviteId) {
      alert("Preencha o código do convite");
      return;
    }

    // try {
    //   await axios.post(`${API_URL}/choose-number`, { number: selected, inviteId });
    //   alert("Número escolhido com sucesso!");
    //   setModalOpen(false);
    //   setInviteId("");

    //   // Atualizar números após escolher
    //   const res = await axios.get(`${API_URL}/available-numbers`);
    //   setNumbers(res.data.numbers);
    // } catch (err: any) {
    //   alert(err.response?.data?.message || "Erro ao escolher número");
    // }
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
                  <CardContent className="p-2">{num}</CardContent>
                </Card>
              ) : (
                <Card
                  key={num}
                  onClick={() => handleNumberInfo(num)}
                  className="flex items-center justify-center bg-gray-300 text-black/80 shadow-sm shadow-white font-bold p-2 cursor-pointer"
                >
                  <CardContent className="p-2 text-sm">{num}</CardContent>
                </Card>
              )
            )}
          </div>

          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Escolha</DialogTitle>
              </DialogHeader>

              <Input
                placeholder="Digite o código do convite"
                value={inviteId}
                onChange={(e) => setInviteId(e.target.value)}
                className="mb-4"
              />

              <DialogFooter>
                <Button onClick={handleConfirm}>Confirmar Número</Button>
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
