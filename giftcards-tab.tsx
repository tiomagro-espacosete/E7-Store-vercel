"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

export function GiftCardsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [form, setForm] = useState({ productId: "", numero: "", validade: "", cvv: "", nome: "", cpf: "" });

  useEffect(() => {
    fetchProducts();
    fetchGiftCards();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    setProducts(await res.json());
  };

  const fetchGiftCards = async () => {
    const res = await fetch("/api/giftcards");
    setGiftCards(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(editing ? `/api/giftcards/${editing.id}` : "/api/giftcards", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success(editing ? "Gift card atualizado!" : "Gift card adicionado!");
      setShowModal(false);
      setEditing(null);
      setForm({ productId: "", numero: "", validade: "", cvv: "", nome: "", cpf: "" });
      fetchGiftCards();
      fetchProducts();
    } else {
      toast.error("Erro ao salvar gift card");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este gift card?")) return;
    const res = await fetch(`/api/giftcards/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Gift card removido!");
      fetchGiftCards();
      fetchProducts();
    }
  };

  const handleEdit = (gc: any) => {
    setEditing(gc);
    setForm({
      productId: gc.productId,
      numero: gc.numero,
      validade: gc.validade,
      cvv: gc.cvv,
      nome: gc.nome,
      cpf: gc.cpf,
    });
    setShowModal(true);
  };

  const filteredGiftCards = selectedProduct
    ? giftCards.filter((gc) => gc.productId === selectedProduct)
    : giftCards;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Gift Cards</h2>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ productId: "", numero: "", validade: "", cvv: "", nome: "", cpf: "" });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-5 h-5" /> Adicionar Gift Card
        </button>
      </div>

      <div className="mb-4">
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg"
        >
          <option value="">Todos os produtos</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filteredGiftCards.length === 0 ? (
          <p className="text-zinc-400 text-center py-8">Nenhum gift card cadastrado</p>
        ) : (
          filteredGiftCards.map((gc) => (
            <div key={gc.id} className="bg-zinc-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CreditCard className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-white font-medium">{gc.product?.name}</p>
                  <p className="text-zinc-400 text-sm">Número: {gc.numero}</p>
                  <p className="text-zinc-400 text-sm">Validade: {gc.validade} | CVV: {gc.cvv}</p>
                  <p className="text-zinc-400 text-sm">Nome: {gc.nome} | CPF: {gc.cpf}</p>
                  {gc.sold && <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Vendido</span>}
                </div>
              </div>
              <div className="flex gap-2">
                {!gc.sold ? (
                  <>
                    <button onClick={() => handleEdit(gc)} className="p-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg">
                      <Pencil className="w-4 h-4 text-white" />
                    </button>
                    <button onClick={() => handleDelete(gc.id)} className="p-2 bg-red-600 hover:bg-red-700 rounded-lg">
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleDelete(gc.id)} className="p-2 bg-zinc-700 hover:bg-red-600 rounded-lg" title="Remover vendido">
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editing ? "Editar Gift Card" : "Novo Gift Card"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editing && (
                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Produto</label>
                  <select
                    required
                    value={form.productId}
                    onChange={(e) => setForm({ ...form, productId: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg"
                  >
                    <option value="">Selecione um produto</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-zinc-400 text-sm mb-1">Número do Gift</label>
                <input
                  type="text"
                  required
                  value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg"
                  placeholder="0000 0000 0000 0000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Validade</label>
                  <input
                    type="text"
                    required
                    value={form.validade}
                    onChange={(e) => setForm({ ...form, validade: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg"
                    placeholder="MM/AA"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-1">CVV</label>
                  <input
                    type="text"
                    required
                    value={form.cvv}
                    onChange={(e) => setForm({ ...form, cvv: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg"
                    placeholder="000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 text-sm mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg"
                  placeholder="Nome no gift"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-sm mb-1">CPF</label>
                <input
                  type="text"
                  required
                  value={form.cpf}
                  onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg"
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-lg">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg">
                  {editing ? "Salvar" : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
