"use client";

import { useState, useEffect } from "react";
import { Plus, Gift, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

export function VouchersTab() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [value, setValue] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    const res = await fetch("/api/vouchers");
    if (res.ok) setVouchers(await res.json());
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/vouchers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: parseFloat(value), quantity }),
    });
    if (res.ok) {
      toast.success(`${quantity} voucher(s) gerado(s)!`);
      setShowModal(false);
      setValue("");
      setQuantity(1);
      fetchVouchers();
    } else {
      toast.error("Erro ao gerar vouchers");
    }
    setLoading(false);
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("C\u00f3digo copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Vouchers / Gift Cards Resgat\u00e1veis</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-5 h-5" /> Gerar Vouchers
        </button>
      </div>

      <div className="grid gap-3">
        {vouchers.length === 0 ? (
          <p className="text-zinc-400 text-center py-8">Nenhum voucher gerado ainda</p>
        ) : (
          vouchers.map((v) => (
            <div key={v.id} className="bg-zinc-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Gift className={`w-8 h-8 ${v.redeemed ? "text-zinc-500" : "text-red-500"}`} />
                <div>
                  <p className="text-white font-mono text-lg">{v.code}</p>
                  <p className="text-zinc-400 text-sm">Valor: R$ {v.value.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {v.redeemed ? (
                  <div className="text-right">
                    <span className="text-xs bg-zinc-600 text-zinc-300 px-3 py-1 rounded">Resgatado</span>
                    {v.redeemedByName && (
                      <p className="text-xs text-zinc-400 mt-1">por: {v.redeemedByName}</p>
                    )}
                  </div>
                ) : (
                  <>
                    <span className="text-xs bg-green-600 text-white px-3 py-1 rounded">Dispon\u00edvel</span>
                    <button
                      onClick={() => copyCode(v.code, v.id)}
                      className="p-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg"
                    >
                      {copiedId === v.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-white" />}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Gerar Vouchers</h3>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-sm mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg"
                  placeholder="100.00"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-sm mb-1">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-lg">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-zinc-600 text-white py-2 rounded-lg">
                  {loading ? "Gerando..." : "Gerar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
