"use client";

import Image from "next/image";
import Link from "next/link";
import { Gift, Plus, Clock, Zap } from "lucide-react";
import { useCart } from "./cart-context";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

interface Props {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    stock: number;
  };
}

export function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const stock = product?.stock ?? 0;

  const handleAdd = () => {
    if (stock < 1) {
      toast.error("Produto esgotado");
      return;
    }
    addItem({
      productId: product?.id ?? "",
      name: product?.name ?? "",
      price: product?.price ?? 0,
      imageUrl: product?.imageUrl ?? null,
      quantity: 1,
    });
    toast.success("🎉 Adicionado ao carrinho!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl overflow-hidden shadow-lg hover:shadow-red-500/20 transition-all hover:scale-[1.02] relative"
    >
      {/* Badge disponível */}
      {stock > 0 && (
        <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-[10px] md:text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Zap className="w-3 h-3" />
          <span>Disponível</span>
        </div>
      )}

      <Link href={`/produto/${product?.id}`}>
        <div className="aspect-video relative bg-zinc-800">
          {product?.imageUrl ? (
            <Image src={product.imageUrl} alt={product?.name ?? ""} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Gift className="w-16 h-16 text-red-500/50" />
            </div>
          )}
          {/* Overlay com CTA */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
            <span className="text-white text-xs font-medium">Ver detalhes →</span>
          </div>
        </div>
      </Link>
      <div className="p-3 md:p-4">
        <h3 className="text-base md:text-lg font-semibold text-white line-clamp-1">{product?.name ?? ""}</h3>
        <p className="text-zinc-400 text-xs md:text-sm mt-1 line-clamp-2">{product?.description ?? ""}</p>
        
        {/* Benefícios rápidos */}
        <div className="flex items-center gap-2 mt-2 text-[10px] md:text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-green-500" />
            Entrega imediata
          </span>
        </div>

        <div className="mt-3 md:mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <span className={`text-xl md:text-2xl font-bold ${stock > 0 ? "text-green-500" : "text-zinc-500"}`}>
                R$ {(product?.price ?? 0)?.toFixed?.(2)}
              </span>
              {stock > 0 && (
                <p className="text-[10px] md:text-xs text-zinc-500">à vista no Pix</p>
              )}
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={stock < 1}
            className={`w-full py-2.5 md:py-3 rounded-lg flex items-center justify-center gap-2 text-sm md:text-base font-semibold transition-all ${
              stock < 1
                ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-500/25"
            }`}
          >
            {stock < 1 ? (
              "Esgotado"
            ) : (
              <>
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                COMPRAR AGORA
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
