"use client";
import { useState } from "react";
import { Settings, RefreshCw } from "lucide-react";
import { RoleGuard } from "@/app/components/Auth/RoleGuard/RoleGuard";
import { useAdminSettings } from "./hooks/useAdminSettings";
import { ConfigErrorScreen } from "../delivery/components/ConfigErrorScreen";
import { AlertMessage } from "@/app/components/AlertMessage/AlertMessage";
import { AccessRestrictedNotice } from "@/app/components/AccessRestrictedNotice/AccessRestrictedNotice";
import { RestaurantInfoForm } from "@/app/components/RestaurantInfoForm/RestaurantInfoForm";
import { TeamMembersCard } from "@/app/components/TeamMembersCard/TeamMembersCard";
import { CreateUserModal } from "@/app/components/CreateUserModal/CreateUserModal";

export default function AdminSettingsPage() {
  const {
    loading,
    configError,
    isOwner,
    restaurantName,
    setRestaurantName,
    saving,
    updateRestaurantName,
    members,
    changeMemberRole,
    removeMember,
    creating,
    createUser,
    message,
  } = useAdminSettings();

  const [showCreateModal, setShowCreateModal] = useState(false);

  if (configError) {
    return <ConfigErrorScreen message={configError} />;
  }

  return (
    <RoleGuard allowedRoles={["owner"]}>
      <div className="min-h-screen bg-background text-foreground flex relative">
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {/* Header */}
          <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/15 p-3 rounded-2xl border border-amber-500/30">
                <Settings className="text-amber-400 w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Configuración del Local{" "}
                  <span className="text-amber-400 font-medium text-xs px-2.5 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/20">
                    Admin Panel
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Administra la información general y los accesos de tu equipo
                </p>
              </div>
            </div>
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mb-4" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                Cargando ajustes...
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              <AlertMessage message={message} />

              {!isOwner ? (
                <AccessRestrictedNotice />
              ) : (
                <>
                  <RestaurantInfoForm
                    restaurantName={restaurantName}
                    onNameChange={setRestaurantName}
                    onSubmit={updateRestaurantName}
                    saving={saving}
                  />

                  <TeamMembersCard
                    members={members}
                    onRoleChange={changeMemberRole}
                    onRemoveMember={removeMember}
                    onOpenCreateModal={() => setShowCreateModal(true)}
                  />
                </>
              )}
            </div>
          )}
        </main>

        <CreateUserModal
          isOpen={showCreateModal}
          creating={creating}
          onClose={() => setShowCreateModal(false)}
          onCreate={createUser}
        />
      </div>
    </RoleGuard>
  );
}
