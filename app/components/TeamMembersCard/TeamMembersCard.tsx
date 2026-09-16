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
    <div className="bg-surface border border-border p-4 sm:p-6 rounded-3xl shadow-xl space-y-4 sm:space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground tracking-tight">
              Equipo y Roles
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Controla el nivel de acceso de cada miembro dentro de la
              plataforma.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black uppercase tracking-wider px-4 py-3 sm:py-2.5 rounded-2xl transition-all shadow-lg shadow-primary/10 cursor-pointer active:scale-95">
          <UserPlus className="w-4 h-4 shrink-0" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Lista de Miembros */}
      <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden bg-background/20">
        {members.map((member) => (
          <div
            key={member.user_id}
            className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface/50 hover:bg-surface transition-all">
            {/* Info del usuario con Avatar de Iniciales */}
            <div className="min-w-0 flex-1 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-border/60 flex items-center justify-center font-bold text-foreground text-xs uppercase shrink-0 border border-border">
                {member.full_name ? member.full_name.charAt(0) : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                  Nombre / ID
                </span>
                <p className="text-xs sm:text-sm font-bold sm:font-mono text-foreground/90 truncate">
                  {member.full_name || member.user_id}
                </p>
              </div>
            </div>

            {/* Acciones: Selector de Rol y Botón Eliminar */}
            <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-border/40">
              <select
                value={member.role}
                onChange={(e) => onRoleChange(member.user_id, e.target.value)}
                className="flex-1 md:flex-initial bg-background border border-border text-foreground text-xs font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary transition cursor-pointer">
                <option value="owner">Propietario</option>
                <option value="admin">Administrador</option>
                <option value="cashier">Cajero</option>
                <option value="chef">Chef</option>
                <option value="mesero">Mesero</option>
              </select>

              <button
                onClick={() => onRemoveMember(member.user_id)}
                title="Quitar del restaurante"
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 p-2.5 rounded-xl transition cursor-pointer shrink-0 active:scale-95">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="p-8 text-center space-y-2">
            <Users className="w-8 h-8 text-muted-foreground/40 mx-auto" />
            <p className="text-xs text-muted-foreground font-medium">
              No se encontraron miembros asociados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
