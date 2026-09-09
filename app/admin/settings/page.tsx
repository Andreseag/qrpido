// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Building2,
//   Users,
//   Settings,
//   AlertTriangle,
//   RefreshCw,
//   UserPlus,
//   Trash2,
//   X,
// } from "lucide-react";
// import { supabase } from "../../lib/supabase";
// import { RoleGuard } from "@/app/components/Auth/RoleGuard/RoleGuard";

// interface Member {
//   user_id: string;
//   role: string;
//   full_name: string;
// }

// export default function AdminSettingsPage() {
//   const [user, setUser] = useState<any>(null);
//   const [restaurantId, setRestaurantId] = useState<string | null>(null);
//   const [restaurantName, setRestaurantName] = useState("");
//   const [isOwner, setIsOwner] = useState(false);
//   const [members, setMembers] = useState<Member[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [saving, setSaving] = useState(false);

//   // Estados para creación de usuarios
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [newEmail, setNewEmail] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [newFullName, setNewFullName] = useState("");
//   const [newRole, setNewRole] = useState("mesero");
//   const [creating, setCreating] = useState(false);

//   const [configError, setConfigError] = useState<string | null>(null);
//   const [message, setMessage] = useState<{
//     type: "success" | "error";
//     text: string;
//   } | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     const initSettings = async () => {
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();

//       if (!session) {
//         router.push("/login");
//         return;
//       }
//       setUser(session.user);

//       const { data: memberData, error } = await supabase
//         .from("restaurant_members")
//         .select(
//           `
//           role,
//           restaurants (
//             id,
//             name
//           )
//         `,
//         )
//         .eq("user_id", session.user.id)
//         .maybeSingle();

//       if (error || !memberData || !memberData.restaurants) {
//         setConfigError(
//           "No se encontró un restaurante asociado a este usuario.",
//         );
//         setLoading(false);
//         return;
//       }

//       const rest = memberData.restaurants as any;
//       setRestaurantId(rest.id);
//       setRestaurantName(rest.name);

//       if (memberData.role === "owner") {
//         setIsOwner(true);
//       }

//       const { data: teamData, error: teamError } = await supabase
//         .from("restaurant_members")
//         .select("user_id, role, full_name")
//         .eq("restaurant_id", rest.id);

//       if (!teamError && teamData) {
//         setMembers(teamData);
//       }

//       setLoading(false);
//     };

//     initSettings();
//   }, [router]);

//   const handleUpdateRestaurant = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!restaurantId) return;
//     setSaving(true);
//     setMessage(null);

//     const { error } = await supabase
//       .from("restaurants")
//       .update({ name: restaurantName })
//       .eq("id", restaurantId);

//     setSaving(false);
//     if (error) {
//       setMessage({
//         type: "error",
//         text: "Hubo un error al actualizar el nombre del restaurante.",
//       });
//     } else {
//       setMessage({
//         type: "success",
//         text: "¡Restaurante actualizado con éxito!",
//       });
//     }
//   };

//   const handleRoleChange = async (userId: string, newRole: string) => {
//     if (!restaurantId) return;

//     const { data, error } = await supabase
//       .from("restaurant_members")
//       .update({ role: newRole })
//       .eq("restaurant_id", restaurantId)
//       .eq("user_id", userId)
//       .select(); // Fuerza a Supabase a retornar la fila afectada

//     if (error || !data || data.length === 0) {
//       console.error("Error o RLS bloqueó el update:", error);
//       setMessage({
//         type: "error",
//         text: "No se pudo actualizar. Las políticas RLS están bloqueando el cambio.",
//       });
//     } else {
//       setMembers(
//         members.map((m) =>
//           m.user_id === userId ? { ...m, role: newRole } : m,
//         ),
//       );
//       setMessage({ type: "success", text: "Rol actualizado correctamente." });
//     }
//   };

//   const handleRemoveMember = async (userId: string) => {
//     if (!confirm("¿Estás seguro de quitar a este usuario del restaurante?"))
//       return;
//     if (!restaurantId) return;

//     const { error } = await supabase
//       .from("restaurant_members")
//       .delete()
//       .eq("restaurant_id", restaurantId)
//       .eq("user_id", userId);

//     if (error) {
//       setMessage({ type: "error", text: "No se pudo eliminar al miembro." });
//     } else {
//       setMembers(members.filter((m) => m.user_id !== userId));
//       setMessage({ type: "success", text: "Miembro removido exitosamente." });
//     }
//   };

//   const handleCreateUser = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!restaurantId) return;
//     setCreating(true);
//     setMessage(null);

//     try {
//       const res = await fetch("/api/create-restaurant-user", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           email: newEmail,
//           password: newPassword,
//           full_name: newFullName,
//           role: newRole,
//           restaurant_id: restaurantId,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Error al crear el usuario.");
//       }

//       setMessage({
//         type: "success",
//         text: "¡Usuario creado y asignado con éxito!",
//       });
//       setShowCreateModal(false);
//       setNewEmail("");
//       setNewPassword("");
//       setNewFullName("");
//       setNewRole("mesero");

//       // Refrescar lista de miembros
//       const { data: teamData, error: teamError } = await supabase
//         .from("restaurant_members")
//         .select("user_id, role, full_name")
//         .eq("restaurant_id", restaurantId);

//       if (!teamError && teamData) {
//         setMembers(teamData);
//       }
//     } catch (err: any) {
//       setMessage({
//         type: "error",
//         text: err.message || "Error al registrar usuario.",
//       });
//     } finally {
//       setCreating(false);
//     }
//   };

//   if (configError) {
//     return (
//       <div className="min-h-screen bg-slate-950 text-white flex">
//         <div className="flex-1 flex items-center justify-center p-6">
//           <div className="bg-red-950/40 border border-red-500/30 p-6 rounded-3xl max-w-md text-center">
//             <AlertTriangle className="text-red-500 w-12 h-12 mx-auto mb-3" />
//             <h2 className="text-lg font-black">Error de Configuración</h2>
//             <p className="text-slate-400 text-xs mt-1">{configError}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <RoleGuard allowedRoles={["owner"]}>
//       <div className="min-h-screen bg-slate-950 text-slate-100 flex relative">
//         <main className="flex-1 p-6 md:p-10 overflow-y-auto">
//           {/* Header */}
//           <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
//             <div className="flex items-center gap-3">
//               <div className="bg-amber-500/15 p-3 rounded-2xl border border-amber-500/30">
//                 <Settings className="text-amber-400 w-8 h-8" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
//                   Configuración del Local{" "}
//                   <span className="text-amber-400 font-medium text-xs px-2.5 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/20">
//                     Admin Panel
//                   </span>
//                 </h1>
//                 <p className="text-xs text-slate-400 font-medium">
//                   Administra la información general y los accesos de tu equipo
//                 </p>
//               </div>
//             </div>

//             {/* <div className="flex items-center gap-3">
//               <a
//                 href="/dashboard"
//                 className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 px-4 py-2.5 rounded-2xl border border-slate-800 transition">
//                 Volver al Dashboard
//               </a>
//             </div> */}
//           </header>

//           {loading ? (
//             <div className="flex flex-col items-center justify-center py-32">
//               <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mb-4" />
//               <p className="text-xs font-black uppercase tracking-widest text-slate-500">
//                 Cargando ajustes...
//               </p>
//             </div>
//           ) : (
//             <div className="max-w-4xl mx-auto space-y-8">
//               {/* Mensaje de alerta global */}
//               {message && (
//                 <div
//                   className={`p-4 rounded-2xl text-xs font-bold border ${
//                     message.type === "success"
//                       ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
//                       : "bg-rose-950/40 text-rose-300 border-rose-500/30"
//                   }`}>
//                   {message.text}
//                 </div>
//               )}

//               {!isOwner ? (
//                 <div className="bg-amber-950/40 border border-amber-500/30 p-6 rounded-3xl text-amber-200">
//                   <h3 className="font-bold text-base mb-1">
//                     Acceso Restringido
//                   </h3>
//                   <p className="text-xs text-amber-300/80">
//                     Solo los usuarios con rol de <strong>Owner</strong> pueden
//                     modificar los datos del restaurante y administrar los roles
//                     del personal.
//                   </p>
//                 </div>
//               ) : (
//                 <>
//                   {/* Sección: Datos del Restaurante */}
//                   <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
//                     <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
//                       <Building2 className="text-amber-400 w-5 h-5" />
//                       <h2 className="text-base font-bold text-white">
//                         Información General
//                       </h2>
//                     </div>
//                     <form
//                       onSubmit={handleUpdateRestaurant}
//                       className="space-y-4">
//                       <div>
//                         <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
//                           Nombre del Restaurante
//                         </label>
//                         <input
//                           type="text"
//                           value={restaurantName}
//                           onChange={(e) => setRestaurantName(e.target.value)}
//                           required
//                           className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition"
//                         />
//                       </div>
//                       <button
//                         type="submit"
//                         disabled={saving}
//                         className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl transition shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer">
//                         {saving ? "Guardando..." : "Guardar Cambios"}
//                       </button>
//                     </form>
//                   </div>

//                   {/* Sección: Gestión de Miembros y Roles */}
//                   <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
//                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
//                       <div className="flex items-center gap-2">
//                         <Users className="text-amber-400 w-5 h-5" />
//                         <div>
//                           <h2 className="text-base font-bold text-white">
//                             Equipo y Roles
//                           </h2>
//                           <p className="text-xs text-slate-400">
//                             Controla el nivel de acceso de cada miembro dentro
//                             de la plataforma.
//                           </p>
//                         </div>
//                       </div>
//                       <button
//                         onClick={() => setShowCreateModal(true)}
//                         className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-2xl transition shadow-lg shadow-amber-500/10 cursor-pointer">
//                         <UserPlus className="w-4 h-4" />
//                         Nuevo Usuario
//                       </button>
//                     </div>

//                     <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden">
//                       {members.map((member) => (
//                         <div
//                           key={member.user_id}
//                           className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/50 hover:bg-slate-800/30 transition">
//                           <div>
//                             <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
//                               Nombre / ID
//                             </span>
//                             <p className="text-xs font-mono text-slate-300 truncate max-w-xs sm:max-w-md">
//                               {member.full_name || member.user_id}
//                             </p>
//                           </div>
//                           <div className="flex items-center gap-3">
//                             <select
//                               value={member.role}
//                               onChange={(e) =>
//                                 handleRoleChange(member.user_id, e.target.value)
//                               }
//                               className="bg-slate-950 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer">
//                               <option value="owner">Propietario</option>
//                               <option value="admin">Administrador</option>
//                               <option value="cashier">Cajero</option>
//                               <option value="chef">Chef</option>
//                               <option value="mesero">Mesero</option>
//                             </select>

//                             <button
//                               onClick={() => handleRemoveMember(member.user_id)}
//                               title="Quitar del restaurante"
//                               className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/20 p-2.5 rounded-xl transition cursor-pointer">
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                         </div>
//                       ))}
//                       {members.length === 0 && (
//                         <p className="p-6 text-center text-xs text-slate-500">
//                           No se encontraron miembros asociados.
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </>
//               )}
//             </div>
//           )}
//         </main>

//         {/* Modal de Creación de Usuario */}
//         {showCreateModal && (
//           <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//             <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-6">
//               <div className="flex items-center justify-between border-b border-slate-800 pb-4">
//                 <div className="flex items-center gap-2">
//                   <UserPlus className="text-amber-400 w-5 h-5" />
//                   <h3 className="text-base font-bold text-white">
//                     Crear Nuevo Miembro
//                   </h3>
//                 </div>
//                 <button
//                   onClick={() => setShowCreateModal(false)}
//                   className="text-slate-400 hover:text-white transition cursor-pointer">
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>

//               <form onSubmit={handleCreateUser} className="space-y-4">
//                 <div>
//                   <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
//                     Nombre Completo
//                   </label>
//                   <input
//                     type="text"
//                     value={newFullName}
//                     onChange={(e) => setNewFullName(e.target.value)}
//                     required
//                     placeholder="Ej. Carlos Pérez"
//                     className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
//                     Correo Electrónico
//                   </label>
//                   <input
//                     type="email"
//                     value={newEmail}
//                     onChange={(e) => setNewEmail(e.target.value)}
//                     required
//                     placeholder="carlos@restaurant.com"
//                     className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
//                     Contraseña Temporal
//                   </label>
//                   <input
//                     type="password"
//                     value={newPassword}
//                     onChange={(e) => setNewPassword(e.target.value)}
//                     required
//                     minLength={6}
//                     placeholder="Mínimo 6 caracteres"
//                     className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
//                     Rol Inicial
//                   </label>
//                   <select
//                     value={newRole}
//                     onChange={(e) => setNewRole(e.target.value)}
//                     className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold rounded-2xl px-4 py-3 focus:outline-none focus:border-amber-500 cursor-pointer">
//                     <option value="admin">Administrador</option>
//                     <option value="cashier">Cajero</option>
//                     <option value="chef">Chef</option>
//                     <option value="mesero">Mesero</option>
//                   </select>
//                 </div>

//                 <div className="flex items-center justify-end gap-3 pt-2">
//                   <button
//                     type="button"
//                     onClick={() => setShowCreateModal(false)}
//                     className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer">
//                     Cancelar
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={creating}
//                     className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer">
//                     {creating ? "Creando..." : "Crear Usuario"}
//                   </button>
//                   a
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </RoleGuard>
//   );
// }

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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex relative">
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
