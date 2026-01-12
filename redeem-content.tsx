"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Gift, Wallet, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export function RedeemContent() {
  const { data: session, status } = useSession() ?? {};
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [redeemed, setRedeemed] = useState<{ value: number; newBalance: number } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/balance")
        .then((r) => r.json())
        .then((data) => setBalance(data.balance ?? 0))
        .catch(() => {});
    }
  }, [session]);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Digite o c\u00f3digo do gift card");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/vouchers/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok) {
        setRedeemed({ value: data.value, newBalance: data.newBalance });
        setBalance(data.newBalance);
        setCode("");
        toast.success(`Gift card de R$ ${data.value.toFixed(2)} resgatado!`);
      } else {
        toast.error(data.error || "Erro ao resgatar");
      }
    } catch {
      toast.error("Erro ao resgatar");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="max-w-md mx-auto px-4 py-20 text-center">Carregando...</div>;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 rounded-xl p-8"
      >
        <div className="text-center mb-8">
          <Gift className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Resgatar Gift Card</h1>
          <p className="text-zinc-400">Digite o c\u00f3digo do gift card para adicionar saldo \u00e0 sua conta</p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-green-500" />
            <span className="text-zinc-400">Seu saldo:</span>
          </div>
          <span className="text-2xl font-bold text-green-500">R$ {balance.toFixed(2)}</span>
        </div>

        {redeemed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-900/30 border border-green-600 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Gift card resgatado com sucesso!</span>
            </div>
            <p className="text-zinc-300 mt-2">+R$ {redeemed.value.toFixed(2)} adicionado ao seu saldo</p>
          </motion.div>
        )}

        <form onSubmit={handleRedeem} className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-sm mb-2">C\u00f3digo do Gift Card</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3 rounded-lg text-center font-mono text-lg tracking-wider focus:outline-none focus:border-red-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-600 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Resgatando..." : "Resgatar Gift Card"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
