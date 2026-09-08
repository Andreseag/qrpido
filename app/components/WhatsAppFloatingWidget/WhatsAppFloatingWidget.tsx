"use client";
import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  X,
  Send,
  Phone,
  User,
  CheckCheck,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/app/lib/supabase";

interface Message {
  id: string;
  restaurant_id: number;
  phone: string;
  sender_name: string;
  content: string;
  direction: "incoming" | "outgoing";
  created_at: string;
}

interface ChatContact {
  phone: string;
  sender_name: string;
  lastMessage: string;
  lastTime: string;
}

export default function WhatsAppFloatingWidget({
  restaurantId,
}: {
  restaurantId: string | number | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar mensajes y escuchar en tiempo real
  useEffect(() => {
    if (!restaurantId) return;

    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data as Message[]);
        if (data.length > 0 && !selectedPhone) {
          const uniquePhones = Array.from(new Set(data.map((m) => m.phone)));
          setSelectedPhone(uniquePhones[0] as string);
        }
      }
      setLoading(false);
    };

    fetchMessages();

    // Supabase Realtime para nuevos mensajes instantáneos
    const channel = supabase
      .channel(`floating-chat-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);

          // Si el chat está cerrado, incrementamos la burbuja de notificación
          if (!isOpen && newMsg.direction === "incoming") {
            setUnreadCount((prev) => prev + 1);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, isOpen]);

  // Auto-scroll al final del chat activo
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedPhone, isOpen]);

  // Agrupar contactos
  const contactsMap = new Map<string, ChatContact>();
  messages.forEach((msg) => {
    contactsMap.set(msg.phone, {
      phone: msg.phone,
      sender_name: msg.sender_name || "Cliente WhatsApp",
      lastMessage: msg.content,
      lastTime: new Date(msg.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  });
  const contacts: ChatContact[] = Array.from(contactsMap.values()).reverse();

  const currentChatMessages = messages.filter((m) => m.phone === selectedPhone);
  const activeContact = contacts.find((c) => c.phone === selectedPhone);

  // Enviar mensaje
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedPhone || !restaurantId) return;

    const content = inputText.trim();
    setInputText("");

    try {
      await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          phone: selectedPhone,
          content,
        }),
      });
    } catch (error) {
      console.error("No se pudo enviar el mensaje", error);
      alert("Error al enviar el mensaje.");
    }
  };

  const handleOpenWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setUnreadCount(0); // Limpiar notificaciones al abrir
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Ventana Flotante de Chat */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[90vw] md:w-[420px] h-[550px] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header del Widget */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-black text-white text-xs uppercase tracking-wider">
                WhatsApp Central
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar mini de contactos */}
            <div className="w-36 md:w-44 border-r border-slate-800 bg-slate-900/40 overflow-y-auto divide-y divide-slate-800/40">
              {contacts.length === 0 ? (
                <p className="text-[10px] text-slate-500 text-center p-4">
                  Sin chats
                </p>
              ) : (
                contacts.map((c) => (
                  <button
                    key={c.phone}
                    onClick={() => setSelectedPhone(c.phone)}
                    className={`w-full text-left p-3 transition-colors cursor-pointer ${
                      selectedPhone === c.phone
                        ? "bg-amber-500/10 border-l-2 border-amber-500"
                        : "hover:bg-slate-800/30"
                    }`}>
                    <p className="font-bold text-slate-200 text-[11px] truncate">
                      {c.sender_name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {c.lastMessage}
                    </p>
                  </button>
                ))
              )}
            </div>

            {/* Área del Chat Activo */}
            <div className="flex-1 flex flex-col bg-slate-950">
              {selectedPhone && activeContact ? (
                <>
                  <div className="p-2.5 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-300 truncate">
                      {activeContact.sender_name}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5" /> +{selectedPhone}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {currentChatMessages.map((msg) => {
                      const isOutgoing = msg.direction === "outgoing";
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[85%] rounded-2xl px-3 py-2 text-[11px] ${
                              isOutgoing
                                ? "bg-amber-500 text-slate-950 rounded-br-none font-medium"
                                : "bg-slate-900 text-slate-100 border border-slate-800 rounded-bl-none"
                            }`}>
                            <p>{msg.content}</p>
                            <div
                              className={`text-[8px] mt-0.5 flex items-center justify-end gap-0.5 ${isOutgoing ? "text-slate-900/70" : "text-slate-500"}`}>
                              <span>
                                {new Date(msg.created_at).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                              {isOutgoing && (
                                <CheckCheck className="w-2.5 h-2.5" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <form
                    onSubmit={handleSendMessage}
                    className="p-2 border-t border-slate-800 bg-slate-900/50 flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Escribe..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-white outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-2 rounded-xl transition-colors cursor-pointer">
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-4 text-center">
                  <p className="text-[11px] text-slate-500">
                    Selecciona un chat
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Botón Flotante de Apertura */}
      <button
        onClick={handleOpenWidget}
        className="relative bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 cursor-pointer group"
        title="Abrir Chat de WhatsApp">
        <MessageSquare className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
