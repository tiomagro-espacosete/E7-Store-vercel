"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Clock, CheckCircle, XCircle, Truck, Check, CreditCard, ChevronDown, ChevronUp, Volume2, VolumeX } from "lucide-react";
import toast from "react-hot-toast";

// Função para tocar bipe
const playBeep = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 880;
    oscillator.type = "sine";
    gainNode.gain.value = 0.5;
    
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, 200);
  } catch (e) {
    console.log("Erro ao tocar bipe:", e);
  }
};

// Função para tocar sirene (3 segundos)
const playSirene = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = "sawtooth";
    gainNode.gain.value = 0.4;
    
    // Efeito de sirene - oscila entre frequências
    const startTime = audioContext.currentTime;
    const duration = 3; // 3 segundos
    
    // Criar efeito de sirene subindo e descendo
    for (let i = 0; i < 6; i++) {
      oscillator.frequency.setValueAtTime(600, startTime + (i * 0.5));
      oscillator.frequency.linearRampToValueAtTime(1200, startTime + (i * 0.5) + 0.25);
      oscillator.frequency.linearRampToValueAtTime(600, startTime + (i * 0.5) + 0.5);
    }
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
    
    setTimeout(() => {
      audioContext.close();
    }, (duration + 0.1) * 1000);
  } catch (e) {
    console.log("Erro ao tocar sirene:", e);
  }
};

// Função para tocar notificação de venda
const playVendaNotification = () => {
  if (typeof window === "undefined") return;
  
  // Cancelar falas anteriores
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance("Mais uma venda na tela!");
  utterance.lang = "pt-BR";
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  
  // Tocar bipe primeiro
  playBeep();
  
  // Depois falar
  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
    
    // Tocar sirene após a fala (estimando 2 segundos para a fala)
    utterance.onend = () => {
      setTimeout(() => {
        playSirene();
      }, 200);
    };
  }, 300);
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Pendente", color: "text-yellow-500", bg: "bg-yellow-500/20" },
  AWAITING_CONFIRMATION: { label: "Aguardando Confirmação", color: "text-blue-500", bg: "bg-blue-500/20" },
  CONFIRMED: { label: "Confirmado", color: "text-green-500", bg: "bg-green-500/20" },
  DELIVERED: { label: "Entregue", color: "text-green-400", bg: "bg-green-400/20" },
  CANCELLED: { label: "Cancelado", color: "text-red-500", bg: "bg-red-500/20" },
};

export function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [giftCardsData, setGiftCardsData] = useState<Record<string, any[]>>({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastOrderIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/orders");
    const newOrders = await res.json();
    
    // Verificar novos pedidos para notificação
    if (!isFirstLoadRef.current && soundEnabled) {
      const newOrderIds = new Set(newOrders.map((o: any) => o.id));
      const pendingOrConfirmed = newOrders.filter((o: any) => 
        (o.status === "AWAITING_CONFIRMATION" || o.status === "CONFIRMED" || o.status === "DELIVERED") &&
        !lastOrderIdsRef.current.has(o.id)
      );
      
      if (pendingOrConfirmed.length > 0) {
        playVendaNotification();
      }
    }
    
    // Atualizar referência de IDs
    lastOrderIdsRef.current = new Set(newOrders.map((o: any) => o.id));
    isFirstLoadRef.current = false;
    
    setOrders(newOrders);
  }, [soundEnabled]);

  useEffect(() => {
    fetchOrders();
    
    // Polling a cada 10 segundos para verificar novos pedidos
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const toggleGiftCards = async (orderId: string) => {
    if (expandedOrders[orderId]) {
      setExpandedOrders((prev) => ({ ...prev, [orderId]: false }));
      return;
    }
    if (!giftCardsData[orderId]) {
      const res = await fetch(`/api/giftcards/customer?orderId=${orderId}`);
      const data = await res.json();
      setGiftCardsData((prev) => ({ ...prev, [orderId]: data }));
    }
    setExpandedOrders((prev) => ({ ...prev, [orderId]: true }));
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("Status atualizado!");
      fetchOrders();
    }
  };

  const filteredOrders = filter === "all" ? orders : orders?.filter?.((o) => o?.status === filter);

  return (
    <div>
      {/* Header com filtros e controle de som */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {["all", "PENDING", "AWAITING_CONFIRMATION", "CONFIRMED", "DELIVERED", "CANCELLED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === s ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400"
            }`}
          >
            {s === "all" ? "Todos" : statusConfig[s]?.label ?? s}
          </button>
        ))}
        </div>
        
        {/* Botões de controle de som */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              playVendaNotification();
              toast.success("Testando som...");
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 transition"
            title="Testar som"
          >
            🔊 <span className="hidden sm:inline">Testar</span>
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
              soundEnabled ? "bg-green-600 text-white" : "bg-zinc-700 text-zinc-400"
            }`}
            title={soundEnabled ? "Som ativado" : "Som desativado"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? "ON" : "OFF"}</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders?.map?.((order) => {
          const config = statusConfig[order?.status ?? ""] ?? statusConfig.PENDING;
          return (
            <div key={order?.id} className="bg-zinc-900 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white font-semibold">Pedido #{order?.id?.slice?.(0, 8) ?? ""}</p>
                  <p className="text-sm text-zinc-400">
                    {order?.user?.name ?? order?.user?.email ?? ""} - {new Date(order?.createdAt ?? Date.now()).toLocaleString("pt-BR")}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${config?.color ?? ""} ${config?.bg ?? ""}`}>
                  {config?.label ?? ""}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                {order?.items?.map?.((item: any) => (
                  <div key={item?.id} className="flex justify-between text-zinc-300">
                    <span>{item?.quantity}x {item?.product?.name ?? ""}</span>
                    <span>R$ {((item?.price ?? 0) * (item?.quantity ?? 0))?.toFixed?.(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-zinc-700 pt-4 flex items-center justify-between">
                <span className="text-xl font-bold text-red-500">R$ {(order?.total ?? 0)?.toFixed?.(2)}</span>
                <div className="flex gap-2">
                  {order?.status === "AWAITING_CONFIRMATION" && (
                    <button
                      onClick={() => updateStatus(order?.id, "CONFIRMED")}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Confirmar
                    </button>
                  )}
                  {order?.status === "CONFIRMED" && (
                    <button
                      onClick={() => updateStatus(order?.id, "DELIVERED")}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Truck className="w-4 h-4" /> Marcar Entregue
                    </button>
                  )}
                  {order?.status !== "CANCELLED" && order?.status !== "DELIVERED" && (
                    <button
                      onClick={() => updateStatus(order?.id, "CANCELLED")}
                      className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Cancelar
                    </button>
                  )}
                </div>
              </div>

              {(order?.status === "CONFIRMED" || order?.status === "DELIVERED") && (
                <div className="mt-4 border-t border-zinc-700 pt-4">
                  <button
                    onClick={() => toggleGiftCards(order?.id)}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 transition"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Ver Cartões Comprados</span>
                    {expandedOrders[order?.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedOrders[order?.id] && giftCardsData[order?.id] && (
                    <div className="mt-3 space-y-3">
                      {giftCardsData[order?.id]?.length === 0 ? (
                        <p className="text-zinc-500 text-sm">Nenhum cartão associado a este pedido</p>
                      ) : (
                        giftCardsData[order?.id]?.map((gc: any, idx: number) => (
                          <div key={idx} className="bg-zinc-800 rounded-lg p-3">
                            <p className="text-zinc-400 text-xs mb-2">{gc?.product?.name ?? "Produto"}</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div><span className="text-zinc-500">Número:</span> <span className="text-white font-mono">{gc?.numero}</span></div>
                              <div><span className="text-zinc-500">Validade:</span> <span className="text-white">{gc?.validade}</span></div>
                              <div><span className="text-zinc-500">CVV:</span> <span className="text-white">{gc?.cvv}</span></div>
                              <div><span className="text-zinc-500">Nome:</span> <span className="text-white">{gc?.nome}</span></div>
                              <div><span className="text-zinc-500">CPF:</span> <span className="text-white">{gc?.cpf}</span></div>
                              <div><span className="text-zinc-500">Entregue em:</span> <span className="text-green-400">{gc?.soldAt ? new Date(gc.soldAt).toLocaleString("pt-BR") : "-"}</span></div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
