"use client";
import { api } from "@/utils/api";
import { useState } from "react";
import { ImSpinner2 } from "react-icons/im";
import { successToast, errorToast } from "@/utils/toast";

export default function Delete() {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await api.delete("/raffles");
      console.log("✅ Sorteios e convites resetados:", res.data);
      successToast("Sorteios e convites resetados");
      setLoading(false);
    } catch (err) {
      console.error("❌ Erro ao resetar sorteio:", err);
      errorToast("Erro ao resetar sorteio");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-green-700 w-full my-4 py-2 text-white max-w-md flex items-center justify-center"
      disabled={loading}
    >
      {loading ? (
        <ImSpinner2 className="animate-spin text-white" size={20} />
      ) : (
        "Deletar Sorteio"
      )}
    </button>
  );
}
