"use client";

import { useState } from "react";
import { Search, CreditCard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

interface SearchResult {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string | null;
  binPreview: string;
}

export function BinSearch() {
  const [bin, setBin] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (bin.length < 6) {
      toast.error("Digite pelo menos 6 dígitos do BIN");
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search-bin?bin=${bin}`);
      if (res.ok) {
        setResults(await res.json());
      } else {
        toast.error("Erro na busca");
      }
    } catch {
      toast.error("Erro na busca");
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setBin("");
    setResults([]);
    setSearched(false);
  };

  return (
    <div className="mb-6 md:mb-8">
      <div className="bg-zinc-900 rounded-xl p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
          <Search className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
          Pesquisar por BIN
        </h3>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            type="text"
            value={bin}
            onChange={(e) => setBin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Digite os 6 primeiros dígitos..."
            className="flex-1 bg-zinc-800 border border-zinc-700 text-white px-3 md:px-4 py-2.5 md:py-3 rounded-lg focus:outline-none focus:border-red-500 text-sm md:text-base"
            maxLength={6}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              disabled={loading || bin.length < 6}
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 disabled:bg-zinc-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-medium text-sm md:text-base transition"
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>
            {searched && (
              <button
                onClick={clearSearch}
                className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-sm md:text-base transition"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {searched && (
          <div className="mt-4 md:mt-6">
            {results.length === 0 ? (
              <p className="text-zinc-400 text-center py-4 text-sm md:text-base">Nenhum cartão encontrado com esse BIN</p>
            ) : (
              <div className="space-y-2 md:space-y-3">
                <p className="text-zinc-400 text-xs md:text-sm">{results.length} resultado(s) encontrado(s)</p>
                {results.map((result, idx) => (
                  <Link
                    key={idx}
                    href={`/produto/${result.productId}`}
                    className="flex items-center gap-3 md:gap-4 bg-zinc-800 rounded-lg p-3 md:p-4 hover:bg-zinc-700 transition"
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 relative bg-zinc-700 rounded-lg overflow-hidden flex-shrink-0">
                      {result.productImage ? (
                        <Image src={result.productImage} alt={result.productName} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-red-500/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm md:text-base truncate">{result.productName}</p>
                      <p className="text-zinc-400 font-mono text-xs md:text-sm">{result.binPreview}</p>
                    </div>
                    <div className="text-green-500 font-bold text-sm md:text-lg whitespace-nowrap">
                      R$ {result.productPrice.toFixed(2)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
