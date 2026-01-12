"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Package, Clock, CheckCircle, XCircle, Truck, CreditCard, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Pendente", color: "text-yellow-500", icon: Clock },
  AWAITING_CONFIRMATION: { label: "Aguardando Confirmação", color: "text-blue-500", icon: Clock },
  CONFIRMED: { label: "Confirmado", color: "text-green-500", icon: CheckCircle },
  DELIVERED: { label: "Entregue", color: "text-green-400", icon: Truck },
  CANCELLED: { label: "Cancelado", color: "text-red-500", icon: XCircle },
};

export function OrdersContent() {
  const { data: session, status } = useSession() ?? {};
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [giftCardsVisible, setGiftCardsVisible] = useState<Record<string, boolean>>({});
  const [giftCardsData, setGiftCardsData] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/orders")
        .then((r) => r.json())
        .then(setOrders)
        .finally(() => setLoading(false));
    }
  }, [session]);

  const toggleGiftCards = async (orderId: string) => {
    if (giftCardsVisible[orderId]) {
      setGiftCardsVisible((prev) => ({ ...prev, [orderId]: false }));
      return;
    }
    
    if (!giftCardsData[orderId]) {
      try {
        const res = await fetch(`/api/giftcards/customer?orderId=${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setGiftCardsData((prev) => ({ ...prev, [orderId]: data }));
        } else {
          toast.error("Erro ao carregar gift cards");
          return;
        }
      } catch {
        toast.error("Erro ao carregar gift cards");
        return;
      }
    }
    setGiftCardsVisible((prev) => ({ ...prev, [orderId]: true }));
  };

  if (status === "loading" || loading) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center">Carregando...</div>;
  }

  if (!orders?.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Package className="w-20 h-20 mx-auto text-zinc-600 mb-6" />
        <p className="text-zinc-400">Você ainda não fez nenhum pedido.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Meus Pedidos</h1>
      <div className="space-y-4">
        {orders.map?.((order, index) => {
          const config = statusConfig[order?.status ?? ""] ?? statusConfig.PENDING;
          const Icon = config?.icon ?? Clock;
          return (
            <motion.div
              key={order?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-zinc-900 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-zinc-500">Pedido #{order?.id?.slice?.(0, 8) ?? ""}</p>
                  <p className="text-xs text-zinc-600">
                    {new Date(order?.createdAt ?? Date.now()).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className={`flex items-center gap-2 ${config?.color ?? ""}`}>
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{config?.label ?? ""}</span>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {order?.items?.map?.((item: any) => (
                  <div key={item?.id} className="flex justify-between text-zinc-300">
                    <span>{item?.quantity}x {item?.product?.name ?? ""}</span>
                    <span>R$ {((item?.price ?? 0) * (item?.quantity ?? 0))?.toFixed?.(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-zinc-700 pt-4 flex justify-between">
                <span className="text-zinc-400">Total:</span>
                <span className="text-xl font-bold text-red-500">R$ {(order?.total ?? 0)?.toFixed?.(2)}</span>
              </div>
              
              {(order?.status === "CONFIRMED" || order?.status === "DELIVERED") && (
                <div className="mt-4">
                  <button
                    onClick={() => toggleGiftCards(order.id)}
                    className="flex items-center gap-2 text-red-500 hover:text-red-400"
                  >
                    {giftCardsVisible[order.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {giftCardsVisible[order.id] ? "Ocultar Gift Cards" : "Ver Gift Cards"}
                  </button>
                  
                  {giftCardsVisible[order.id] && giftCardsData[order.id] && (
                    <div className="mt-4 space-y-3">
                      {giftCardsData[order.id].map((gc: any) => (
                        <div key={gc.id} className="bg-zinc-800 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="w-5 h-5 text-red-500" />
                            <span className="text-white font-medium">{gc.product?.name}</span>
                          </div>
                          <div className="space-y-3 text-sm">
                            <div className="bg-zinc-700/50 rounded p-2">
                              <span className="text-zinc-400 text-xs block mb-1">Número do Cartão</span>
                              <p className="text-white font-mono text-base break-all">{gc.numero}</p>
                            </div>
                            <div className="flex gap-3">
                              <div className="flex-1 bg-zinc-700/50 rounded p-2">
                                <span className="text-zinc-400 text-xs block mb-1">Validade</span>
                                <p className="text-white">{gc.validade}</p>
                              </div>
                              <div className="flex-1 bg-zinc-700/50 rounded p-2">
                                <span className="text-zinc-400 text-xs block mb-1">CVV</span>
                                <p className="text-white">{gc.cvv}</p>
                              </div>
                            </div>
                            <div className="bg-zinc-700/50 rounded p-2">
                              <span className="text-zinc-400 text-xs block mb-1">Nome no Cartão</span>
                              <p className="text-white break-all">{gc.nome}</p>
                            </div>
                            <div className="bg-zinc-700/50 rounded p-2">
                              <span className="text-zinc-400 text-xs block mb-1">CPF</span>
                              <p className="text-white">{gc.cpf}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {giftCardsData[order.id].length === 0 && (
                        <p className="text-zinc-500 text-sm">Nenhum gift card associado a este pedido.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
