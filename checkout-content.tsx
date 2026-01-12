"use client";

import { useCart } from "./cart-context";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { CheckCircle, Copy, Clock, ArrowLeft, Wallet, Shield, Zap, Lock } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const QRCodeSVG = dynamic(() => import("qrcode.react").then(m => m.QRCodeSVG), { ssr: false });

export function CheckoutContent() {
  const { cart, clearCart } = useCart();
  const { data: session, status } = useSession() ?? {};
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [useBalance, setUseBalance] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/checkout");
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

  const balanceToUse = useBalance ? Math.min(balance, cart?.total ?? 0) : 0;
  const remainingTotal = Math.max(0, (cart?.total ?? 0) - balanceToUse);

  const createOrder = async () => {
    if (!cart?.items?.length) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart.items, useBalance: balanceToUse }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Erro ao criar pedido");
      setOrder(data);
      clearCart();
      if (data.paidWithBalance) {
        toast.success("Pedido pago com saldo!");
        router.push("/meus-pedidos");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao criar pedido");
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async () => {
    if (!order?.id) return;
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "AWAITING_CONFIRMATION" }),
      });
      if (res.ok) {
        toast.success("Pagamento informado! Aguarde confirmação.");
        router.push("/meus-pedidos");
      }
    } catch {
      toast.error("Erro ao atualizar pedido");
    }
  };

  const copyPix = () => {
    navigator.clipboard.writeText(order?.pixCode ?? "");
    toast.success("Código Pix copiado!");
  };

  if (status === "loading") return <div className="max-w-4xl mx-auto px-4 py-20 text-center">Carregando...</div>;

  if (order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900 rounded-xl p-8 text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Pedido Criado!</h1>
          <p className="text-zinc-400 mb-8">Escaneie o QR Code ou copie o código Pix para pagar</p>
          
          <div className="bg-white p-4 rounded-xl inline-block mb-6">
            {order?.pixCode && <QRCodeSVG value={order.pixCode} size={200} />}
          </div>
          
          <div className="bg-zinc-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-zinc-400 mb-2">Código Pix Copia e Cola:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={order?.pixCode ?? ""}
                className="flex-1 bg-zinc-700 px-3 py-2 rounded text-sm text-zinc-300 truncate"
              />
              <button onClick={copyPix} className="bg-red-600 hover:bg-red-700 p-2 rounded">
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>

          <p className="text-3xl font-bold text-red-500 mb-6">R$ {(order?.total ?? 0)?.toFixed?.(2)}</p>

          <button
            onClick={markAsPaid}
            className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
          >
            <Clock className="w-5 h-5" /> Já Paguei
          </button>
        </motion.div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-zinc-400 mb-4">Seu carrinho está vazio</p>
        <Link href="/" className="text-red-500 hover:underline">Voltar para a loja</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-3 md:px-4 py-8 md:py-12">
      <Link href="/carrinho" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar ao carrinho
      </Link>
      
      <div className="bg-zinc-900 rounded-xl p-4 md:p-6">
        {/* Header com urgência */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-white">Finalizar Pedido</h1>
          <span className="text-[10px] md:text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
            <Zap className="w-3 h-3" /> Entrega Imediata
          </span>
        </div>
        
        {/* Itens */}
        <div className="space-y-2 mb-4">
          {cart.items.map?.((item) => (
            <div key={item?.productId} className="flex justify-between text-zinc-300 text-sm">
              <span>{item?.quantity}x {item?.name ?? ""}</span>
              <span>R$ {((item?.price ?? 0) * (item?.quantity ?? 0))?.toFixed?.(2)}</span>
            </div>
          ))}
        </div>
        
        {/* Saldo */}
        {balance > 0 && (
          <div className="bg-zinc-800 rounded-lg p-3 md:p-4 mb-4">
            <label className="flex items-center gap-2 md:gap-3 cursor-pointer flex-wrap">
              <input
                type="checkbox"
                checked={useBalance}
                onChange={(e) => setUseBalance(e.target.checked)}
                className="w-5 h-5 rounded accent-green-500"
              />
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                <span className="text-white text-sm">Usar saldo</span>
              </div>
              <span className="ml-auto text-green-500 font-medium text-sm">R$ {balance.toFixed(2)}</span>
            </label>
            {useBalance && (
              <p className="text-zinc-400 text-xs mt-2">
                Será usado R$ {balanceToUse.toFixed(2)} do seu saldo
              </p>
            )}
          </div>
        )}

        {/* Totais */}
        <div className="border-t border-zinc-700 pt-4 mb-4">
          <div className="flex justify-between text-zinc-400 mb-2 text-sm">
            <span>Subtotal:</span>
            <span>R$ {(cart?.total ?? 0)?.toFixed?.(2)}</span>
          </div>
          {useBalance && balanceToUse > 0 && (
            <div className="flex justify-between text-green-500 mb-2 text-sm">
              <span>Saldo utilizado:</span>
              <span>- R$ {balanceToUse.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg md:text-xl">
            <span className="text-zinc-400">Total:</span>
            <span className="font-bold text-red-500">R$ {remainingTotal.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Botão CTA */}
        <button
          onClick={createOrder}
          disabled={loading}
          className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-zinc-600 disabled:to-zinc-600 py-3 md:py-4 rounded-lg font-bold text-sm md:text-base transition-all shadow-lg shadow-red-500/25 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {loading ? "Processando..." : remainingTotal === 0 ? "✅ FINALIZAR COM SALDO" : "⚡ GERAR QR CODE PIX"}
        </button>
        
        {/* Garantias */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-[10px] md:text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-green-500" />
              Pagamento Seguro
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-500" />
              Entrega Instantânea
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-blue-500" />
              Dados Verificados
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
