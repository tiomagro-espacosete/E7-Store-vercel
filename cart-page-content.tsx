"use client";

import { useCart } from "./cart-context";
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function CartPageContent() {
  const { cart, removeItem, updateQuantity } = useCart();

  if (!cart?.items?.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-20 h-20 mx-auto text-zinc-600 mb-6" />
        <h1 className="text-2xl font-bold text-white mb-4">Seu carrinho está vazio</h1>
        <Link href="/" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg">
          <ArrowLeft className="w-5 h-5" /> Continuar Comprando
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Carrinho de Compras</h1>
      <div className="space-y-4 mb-8">
        {cart.items.map?.((item) => (
          <motion.div
            key={item?.productId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-zinc-900 rounded-xl p-4 flex items-center gap-4"
          >
            <div className="w-20 h-20 relative bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
              {item?.imageUrl ? (
                <Image src={item.imageUrl} alt={item?.name ?? ""} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{item?.name ?? ""}</h3>
              <p className="text-red-500 font-bold">R$ {(item?.price ?? 0)?.toFixed?.(2)}</p>
            </div>
            <div className="flex items-center bg-zinc-800 rounded-lg">
              <button
                onClick={() => updateQuantity(item?.productId ?? "", (item?.quantity ?? 1) - 1)}
                className="px-3 py-1 hover:bg-zinc-700 rounded-l-lg"
              >
                -
              </button>
              <span className="px-3">{item?.quantity ?? 0}</span>
              <button
                onClick={() => updateQuantity(item?.productId ?? "", (item?.quantity ?? 0) + 1)}
                className="px-3 py-1 hover:bg-zinc-700 rounded-r-lg"
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeItem(item?.productId ?? "")}
              className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </motion.div>
        ))}
      </div>
      <div className="bg-zinc-900 rounded-xl p-6">
        <div className="flex items-center justify-between text-xl mb-6">
          <span className="text-zinc-400">Total:</span>
          <span className="text-3xl font-bold text-red-500">R$ {(cart?.total ?? 0)?.toFixed?.(2)}</span>
        </div>
        <Link
          href="/checkout"
          className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-lg flex items-center justify-center gap-2 font-semibold text-lg transition"
        >
          Finalizar Compra <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
