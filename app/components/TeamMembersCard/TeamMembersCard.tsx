"use client";
import { Member } from "@/app/admin/settings/types";
import { Users, UserPlus, Trash2 } from "lucide-react";

interface TeamMembersCardProps {
  members: Member[];
  onRoleChange: (userId: string, newRole: string) => void;
  onRemoveMember: (userId: string) => void;
  onOpenCreateModal: () => void;
}

export function TeamMembersCard({
  members,
  onRoleChange,
  onRemoveMember,
  onOpenCreateModal,
}: TeamMembersCardProps) {
  return (
    <div className="bg-surface border border-border p-6 rounded-3xl shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Users className="text-primary w-5 h-5" />
          <div>
            <h2 className="text-base font-bold text-foreground">
              Equipo y Roles
            </h2>
            <p className="text-xs text-muted-foreground">
              Controla el nivel de acceso de cada miembro dentro de la
              plataforma.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-2xl transition shadow-lg shadow-primary/10 cursor-pointer">
          <UserPlus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden">
        {members.map((member) => (
          <div
            key={member.user_id}
            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface/50 hover:bg-surface transition">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                Nombre / ID
              </span>
              <p className="text-xs font-mono text-foreground/90 truncate max-w-xs sm:max-w-md">
                {member.full_name || member.user_id}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={member.role}
                onChange={(e) => onRoleChange(member.user_id, e.target.value)}
                className="bg-background border border-border text-foreground text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-primary cursor-pointer">
                <option value="owner">Propietario</option>
                <option value="admin">Administrador</option>
                <option value="cashier">Cajero</option>
                <option value="chef">Chef</option>
                <option value="mesero">Mesero</option>
              </select>

              <button
                onClick={() => onRemoveMember(member.user_id)}
                title="Quitar del restaurante"
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 p-2.5 rounded-xl transition cursor-pointer">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {members.length === 0 && (
          <p className="p-6 text-center text-xs text-muted-foreground">
            No se encontraron miembros asociados.
          </p>
        )}
      </div>
    </div>
  );
}
