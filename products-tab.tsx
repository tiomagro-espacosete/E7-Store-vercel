"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Upload, Gift } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

export function ProductsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "", imageUrl: "", imagePath: "" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    setProducts(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0,
      imageUrl: form.imageUrl,
      imagePath: form.imagePath,
    };
    const res = await fetch(editing ? `/api/products/${editing.id}` : "/api/products", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success(editing ? "Produto atualizado!" : "Produto criado!");
      setShowModal(false);
      setEditing(null);
      setForm({ name: "", description: "", price: "", stock: "", imageUrl: "", imagePath: "" });
      fetchProducts();
    } else {
      toast.error("Erro ao salvar produto");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este produto?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Produto removido!");
      fetchProducts();
    }
  };

  const handleEdit = (product: any) => {
    setEditing(product);
    setForm({
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: String(product?.price ?? ""),
      stock: String(product?.stock ?? ""),
      imageUrl: product?.imageUrl ?? "",
      imagePath: product?.imagePath ?? "",
    });
    setShowModal(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type }),
      });
      const { uploadUrl, cloud_storage_path, imageUrl } = await res.json();
      await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      setForm((f) => ({ ...f, imageUrl, imagePath: cloud_storage_path }));
      toast.success("Imagem enviada!");
    } catch {
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Produtos</h2>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ name: "", description: "", price: "", stock: "", imageUrl: "", imagePath: "" });
            setShowModal(true);
          }}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Novo Produto
        </button>
      </div>

      <div className="grid gap-4">
        {products?.map?.((product) => (
          <div key={product?.id} className="bg-zinc-900 rounded-xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden relative flex-shrink-0">
              {product?.imageUrl ? (
                <Image src={product.imageUrl} alt={product?.name ?? ""} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Gift className="w-8 h-8 text-zinc-600" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">{product?.name ?? ""}</h3>
              <p className="text-zinc-400 text-sm">
                R$ {(product?.price ?? 0)?.toFixed?.(2)} | Estoque: {product?.stock ?? 0}
              </p>
            </div>
            <button onClick={() => handleEdit(product)} className="p-2 hover:bg-zinc-800 rounded-lg">
              <Pencil className="w-5 h-5 text-zinc-400" />
            </button>
            <button onClick={() => handleDelete(product?.id)} className="p-2 hover:bg-red-500/20 rounded-lg">
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">
              {editing ? "Editar Produto" : "Novo Produto"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400 block mb-1">Nome</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e?.target?.value ?? "" }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 block mb-1">Descrição</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e?.target?.value ?? "" }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-zinc-400 block mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e?.target?.value ?? "" }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400 block mb-1">Estoque</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e?.target?.value ?? "" }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-zinc-400 block mb-1">Imagem</label>
                <div className="flex items-center gap-4">
                  {form.imageUrl && (
                    <div className="w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden relative">
                      <Image src={form.imageUrl} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                  <label className="flex-1 bg-zinc-800 border border-dashed border-zinc-600 rounded-lg px-4 py-3 flex items-center justify-center gap-2 cursor-pointer hover:border-red-500 transition">
                    <Upload className="w-5 h-5" />
                    {uploading ? "Enviando..." : "Upload"}
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 py-2 rounded-lg">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
