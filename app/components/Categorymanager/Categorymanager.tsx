"use client";
import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { MenuCategory } from "@/app/admin/menu/types";

interface CategoryManagerProps {
  categories: MenuCategory[];
  onCreate: (name: string) => Promise<boolean> | boolean;
  onRename: (id: string, name: string) => Promise<boolean> | boolean;
  onDelete: (id: string) => Promise<boolean> | boolean;
  onMove: (id: string, direction: "up" | "down") => void;
}

export function CategoryManager({
  categories,
  onCreate,
  onRename,
  onDelete,
  onMove,
}: CategoryManagerProps) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const success = await onCreate(newName);
    if (success) setNewName("");
  };

  const startEdit = (cat: MenuCategory) => {
    setEditingId(cat.id);
    setEditingValue(cat.name);
  };

  const confirmEdit = async () => {
    if (!editingId) return;
    await onRename(editingId, editingValue);
    setEditingId(null);
  };

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 space-y-4">
      <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
        Categorías del Menú
      </h2>

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          placeholder="Ej: Entradas, Bebidas, Postres..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 p-3 bg-background border border-border rounded-xl text-foreground text-xs outline-none focus:border-primary"
        />
        <button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> Agregar
        </button>
      </form>

      {categories.length === 0 ? (
        <p className="text-xs text-muted-foreground italic text-center py-6">
          Aún no tienes categorías. Crea la primera arriba — por ejemplo
          "Entradas" o "Platos Fuertes".
        </p>
      ) : (
        <div className="space-y-2">
          {categories.map((cat, index) => (
            <div
              key={cat.id}
              className="flex items-center gap-2 bg-background border border-border rounded-xl p-2.5">
              <div className="flex flex-col">
                <button
                  disabled={index === 0}
                  onClick={() => onMove(cat.id, "up")}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-20 cursor-pointer">
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={index === categories.length - 1}
                  onClick={() => onMove(cat.id, "down")}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-20 cursor-pointer">
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {editingId === cat.id ? (
                <input
                  autoFocus
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && confirmEdit()}
                  className="flex-1 p-2 bg-surface border border-primary rounded-lg text-foreground text-xs outline-none"
                />
              ) : (
                <span className="flex-1 text-xs font-bold text-foreground">
                  {cat.name}
                </span>
              )}

              <div className="flex items-center gap-1">
                {editingId === cat.id ? (
                  <>
                    <button
                      onClick={confirmEdit}
                      className="p-1.5 text-success hover:bg-success/10 rounded-lg cursor-pointer">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 text-muted-foreground hover:bg-border/60 rounded-lg cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-border/60 rounded-lg cursor-pointer">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(cat.id)}
                      className="p-1.5 text-danger hover:bg-danger/10 rounded-lg cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-[10px] text-muted-foreground">
        Los productos se asignan a una categoría desde el formulario de cada
        plato en Inventario.
      </p>
    </div>
  );
}
