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
    <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-surface border-l border-border h-full p-8 flex flex-col justify-between shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <h2 className="text-xl font-black text-foreground">
              {editingTable ? "Editar" : "Nueva"}{" "}
              <span className="text-primary">Mesa</span>
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground cursor-pointer">
              <X />
            </button>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">
              Número de Mesa
            </label>
            <input
              required
              type="number"
              min="1"
              className="w-full p-4 bg-background border border-border rounded-2xl text-foreground text-lg font-bold focus:outline-none focus:border-primary"
              placeholder="Ej: 5"
              value={tableNumberInput}
              onChange={(e) => setTableNumberInput(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all shadow-lg shadow-primary/10">
            {editingTable ? "Actualizar Mesa" : "Guardar Mesa"}
          </button>
        </form>
      </div>
    </div>
  );
}
