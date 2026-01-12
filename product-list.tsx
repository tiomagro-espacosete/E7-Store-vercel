"use client";

import { ProductCard } from "./product-card";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  stock: number;
}

export function ProductList({ products }: { products: Product[] }) {
  if (!products?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">Nenhum produto disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {products?.map?.((product) => (
        <ProductCard key={product?.id} product={product} />
      ))}
    </div>
  );
}
