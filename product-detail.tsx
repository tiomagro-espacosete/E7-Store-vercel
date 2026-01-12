"use client";

import Image from "next/image";
import { Gift, ShoppingCart, ArrowLeft } from "lucide-react";
import { useCart } from "./cart-context";
import toast from "react-hot-toast";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

interface GiftCardPreview {
  numero: string;
}

interface Props {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    stock: number;
    giftCards?: GiftCardPreview[];
  };
}

export function ProductDetail({ product }: Props) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    if ((product?.stock ?? 0) < quantity) {
      toast.error("Estoque insuficiente");
      return;
    }
    addItem({
      productId: product?.id ?? "",
      name: product?.name ?? "",
      price: product?.price ?? 0,
      imageUrl: product?.imageUrl ?? null,
      quantity,
    });
    toast.success("Adicionado ao carrinho!");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8">
        <ArrowLeft className="w-5 h-5" /> Voltar
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 rounded-xl overflow-hidden shadow-xl"
      >
        <div className="aspect-video relative bg-zinc-800">
          {product?.imageUrl ? (
            <Image src={product.imageUrl} alt={product?.name ?? ""} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Gift className="w-24 h-24 text-red-500/50" />
            </div>
          )}
        </div>
        <div className="p-8">
          <h1 className="text-3xl font-bold text-white mb-4">{product?.name ?? ""}</h1>
          <p className="text-zinc-400 mb-6">{product?.description ?? ""}</p>
          <div className="flex items-center gap-6 mb-6">
            <span className="text-4xl font-bold text-red-500">R$ {(product?.price ?? 0)?.toFixed?.(2)}</span>
            <span className="text-zinc-500">{product?.stock ?? 0} em estoque</span>
          </div>
          {product?.giftCards && product.giftCards.length > 0 && (
            <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
              <p className="text-zinc-400 text-sm mb-2">Gift Cards disponíveis (prévia):</p>
              <div className="space-y-1">
                {product.giftCards.slice(0, 3).map((gc, idx) => (
                  <p key={idx} className="text-white font-mono">
                    {gc.numero.substring(0, 6)}** **** ****
                  </p>
                ))}
                {product.giftCards.length > 3 && (
                  <p className="text-zinc-500 text-sm">+{product.giftCards.length - 3} mais...</p>
                )}
              </div>
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-zinc-800 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-xl hover:bg-zinc-700 rounded-l-lg"
              >
                -
              </button>
              <span className="px-4 py-2 text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product?.stock ?? 1, quantity + 1))}
                className="px-4 py-2 text-xl hover:bg-zinc-700 rounded-r-lg"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={(product?.stock ?? 0) < 1}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-zinc-600 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition"
            >
              <ShoppingCart className="w-5 h-5" /> Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
