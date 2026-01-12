"use client";

import { useState, useEffect } from "react";
import { Save, Key } from "lucide-react";
import toast from "react-hot-toast";

export function SettingsTab() {
  const [pixKey, setPixKey] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/pix-config")
      .then((r) => r.json())
      .then((d) => setPixKey(d?.pixKey ?? ""));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pix-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pixKey }),
      });
      if (res.ok) toast.success("Chave Pix atualizada!");
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="bg-zinc-900 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Key className="w-5 h-5 text-red-500" /> Configurações de Pagamento
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Chave Pix</label>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => setPixKey(e?.target?.value ?? "")}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white"
              placeholder="Chave Pix (CPF, Email, Telefone ou Aleatória)"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
          >
            <Save className="w-5 h-5" /> {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
        <div className="mt-8 p-4 bg-zinc-800 rounded-lg">
          <p className="text-sm text-zinc-400 mb-2">Integração OpenPix (Futura)</p>
          <p className="text-xs text-zinc-500">
            Para integrar com OpenPix, configure a variável de ambiente OPENPIX_APP_ID no arquivo .env
          </p>
        </div>
      </div>
    </div>
  );
}
