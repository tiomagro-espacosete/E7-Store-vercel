"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, LogOut, Settings, Wallet, Gift } from "lucide-react";
import { useCart } from "./cart-context";
import { useState, useEffect } from "react";

export function Header() {
  const { data: session, status } = useSession() ?? {};
  const { cart } = useCart();
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (session?.user && !isAdmin) {
      fetch("/api/user/balance")
        .then((r) => r.json())
        .then((data) => setBalance(data.balance ?? 0))
        .catch(() => {});
    }
  }, [session, isAdmin]);

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-red-900/30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.jpeg" alt="Logo" width={40} height={40} className="rounded" />
          <span className="text-base md:text-xl font-bold text-white hidden sm:inline">ESPAÇO <span className="text-red-500">SETE</span> STORE</span>
          <span className="text-base font-bold text-white sm:hidden">E<span className="text-red-500">7</span>S</span>
        </Link>
        <nav className="flex items-center gap-2 md:gap-4">
          <Link href="/carrinho" className="relative p-2 hover:bg-red-500/20 rounded-lg transition">
            <ShoppingCart className="w-6 h-6" />
            {(cart?.items?.length ?? 0) > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cart.items.length}
              </span>
            )}
          </Link>
          {session?.user ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="p-2 hover:bg-red-500/20 rounded-lg transition">
                  <Settings className="w-6 h-6" />
                </Link>
              )}
              {!isAdmin && (
                <>
                  <Link href="/resgatar" className="p-2 hover:bg-red-500/20 rounded-lg transition" title="Resgatar Gift Card">
                    <Gift className="w-5 h-5 md:w-6 md:h-6" />
                  </Link>
                  <div className="flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded-lg">
                    <Wallet className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 font-medium text-xs md:text-sm">R$ {balance.toFixed(2)}</span>
                  </div>
                </>
              )}
              <Link href="/meus-pedidos" className="p-2 hover:bg-red-500/20 rounded-lg transition">
                <User className="w-6 h-6" />
              </Link>
              <button onClick={() => signOut()} className="p-2 hover:bg-red-500/20 rounded-lg transition">
                <LogOut className="w-6 h-6" />
              </button>
            </>
          ) : (
            <Link href="/login" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
