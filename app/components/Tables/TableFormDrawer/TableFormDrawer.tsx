"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Table } from "@/app/admin/tables/types";

interface TableFormDrawerProps {
  isOpen: boolean;
  editingTable: Table | null;
  onClose: () => void;
  onSave: (number: number) => Promise<boolean> | boolean;
  onInvalidNumber?: () => void;
}

export function TableFormDrawer({
  isOpen,
  editingTable,
  onClose,
  onSave,
  onInvalidNumber,
}: TableFormDrawerProps) {
  const [tableNumberInput, setTableNumberInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTableNumberInput(
        editingTable?.number ? editingTable.number.toString() : "",
      );
    }
  }, [isOpen, editingTable]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(tableNumberInput);
    if (isNaN(num)) {
      onInvalidNumber?.();
      return;
    }
    const success = await onSave(num);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-8 flex flex-col justify-between shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h2 className="text-xl font-black text-white">
              {editingTable ? "Editar" : "Nueva"}{" "}
              <span className="text-amber-400">Mesa</span>
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white cursor-pointer">
              <X />
            </button>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-400 block mb-2">
              Número de Mesa
            </label>
            <input
              required
              type="number"
              min="1"
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-lg font-bold focus:outline-none focus:border-amber-500"
              placeholder="Ej: 5"
              value={tableNumberInput}
              onChange={(e) => setTableNumberInput(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all">
            {editingTable ? "Actualizar Mesa" : "Guardar Mesa"}
          </button>
        </form>
      </div>
    </div>
  );
}
