"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Package, ShoppingBag, Settings, CreditCard, Gift, Users } from "lucide-react";
import { ProductsTab } from "./products-tab";
import { OrdersTab } from "./orders-tab";
import { SettingsTab } from "./settings-tab";
import { GiftCardsTab } from "./giftcards-tab";
import { VouchersTab } from "./vouchers-tab";

export function AdminContent() {
  const { data: session, status } = useSession() ?? {};
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("products");
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    fetch("/api/user/count")
      .then((r) => r.json())
      .then((data) => setMemberCount(data.count ?? 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading") return <div className="max-w-6xl mx-auto px-4 py-20 text-center">Carregando...</div>;
  if ((session?.user as any)?.role !== "ADMIN") return null;

  const tabs = [
    { id: "products", label: "Produtos", icon: Package },
    { id: "giftcards", label: "Gift Cards", icon: CreditCard },
    { id: "vouchers", label: "Gerar Vouchers", icon: Gift },
    { id: "orders", label: "Pedidos", icon: ShoppingBag },
    { id: "settings", label: "Configurações", icon: Settings },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Painel Admin</h1>
        <div className="mt-4 md:mt-0 flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-lg">
          <Users className="w-5 h-5 text-red-500" />
          <span className="text-white font-medium">{memberCount}</span>
          <span className="text-zinc-400">membros cadastrados</span>
        </div>
      </div>
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab.id
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              <Icon className="w-5 h-5" /> {tab.label}
            </button>
          );
        })}
      </div>
      {activeTab === "products" && <ProductsTab />}
      {activeTab === "giftcards" && <GiftCardsTab />}
      {activeTab === "vouchers" && <VouchersTab />}
      {activeTab === "orders" && <OrdersTab />}
      {activeTab === "settings" && <SettingsTab />}
    </div>
  );
}
