"use client";
import { useState } from "react";
import { MessageCircle, X, Send, ShoppingBag, Phone, User } from "lucide-react";

interface Message {
  id: string;
  sender: "client" | "restaurant";
  text: string;
  time: string;
}

interface ChatSession {
  chatId: string;
  customerName: string;
  customerPhone: string;
  messages: Message[];
  tempMessage: string;
}

export default function FloatingWhatsAppChat({
  onConvertToOrder,
}: {
  onConvertToOrder?: (clientData: { name: string; phone: string }) => void;
}) {
  const [activeChats, setActiveChats] = useState<ChatSession[]>([
    // Chat de ejemplo simulando uno entrante
    {
      chatId: "1",
      customerName: "Carlos Pérez",
      customerPhone: "+573101234567",
      messages: [
        {
          id: "m1",
          sender: "client",
          text: "Hola, ¿tienen hamburguesa artesanal disponible?",
          time: "10:15 AM",
        },
        {
          id: "m2",
          sender: "restaurant",
          text: "¡Hola Carlos! Sí, tenemos disponible la Doble Carne.",
          time: "10:16 AM",
        },
        {
          id: "m3",
          sender: "client",
          text: "Perfecto, mándame una a domicilio por favor.",
          time: "10:17 AM",
        },
      ],
      tempMessage: "",
    },
  ]);
  const [isOpenManager, setIsOpenManager] = useState(false);

  const openChat = (name: string, phone: string) => {
    const existing = activeChats.find((c) => c.customerPhone === phone);
    if (!existing) {
      const newChat: ChatSession = {
        chatId: Date.now().toString(),
        customerName: name,
        customerPhone: phone,
        messages: [
          {
            id: "m-init",
            sender: "client",
            text: "Hola, vengo de WhatsApp.",
            time: "Ahora",
          },
        ],
        tempMessage: "",
      };
      setActiveChats((prev) => [...prev.slice(-2), newChat]);
    }
  };

  const closeChat = (chatId: string) => {
    setActiveChats((prev) => prev.filter((c) => c.chatId !== chatId));
  };

  const sendMessage = (chatId: string) => {
    setActiveChats((prev) =>
      prev.map((chat) => {
        if (chat.chatId !== chatId || !chat.tempMessage.trim()) return chat;
        const newMsg: Message = {
          id: Date.now().toString(),
          sender: "restaurant",
          text: chat.tempMessage,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        return {
          ...chat,
          messages: [...chat.messages, newMsg],
          tempMessage: "",
        };
      }),
    );
  };

  return (
    <>
      {/* Botón Flotante de WhatsApp (Ubicado a la izquierda del botón de pedidos) */}
      <button
        onClick={() => setIsOpenManager(!isOpenManager)}
        className="fixed bottom-6 right-64 z-40 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-4 rounded-full shadow-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-emerald-500/40">
        <div className="relative">
          <MessageCircle className="w-6 h-6 stroke-[2.5]" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-950 animate-pulse"></span>
        </div>
        <span className="text-xs uppercase tracking-wider">WhatsApp</span>
      </button>

      {/* Contenedor de Chats Flotantes en Paralelo */}
      <div className="fixed bottom-0 right-96 z-50 flex items-end gap-4 pointer-events-none px-4">
        {activeChats.map((chat, index) => (
          <div
            key={chat.chatId}
            className="pointer-events-auto w-80 md:w-96 bg-slate-900 border border-slate-700/80 rounded-t-3xl shadow-2xl flex flex-col h-[480px] animate-in slide-in-from-bottom duration-200">
            {/* Cabecera del Chat */}
            <div className="bg-slate-950 px-4 py-3 rounded-t-3xl border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold text-xs">
                  {chat.customerName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-black text-white leading-tight">
                    {chat.customerName}
                  </h4>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Phone className="w-2.5 h-2.5" /> {chat.customerPhone}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Botón Asesino: Convertir Chat en Pedido */}
                <button
                  onClick={() => {
                    if (onConvertToOrder) {
                      onConvertToOrder({
                        name: chat.customerName,
                        phone: chat.customerPhone,
                      });
                    }
                    closeChat(chat.chatId);
                  }}
                  title="Convertir chat en pedido"
                  className="bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 p-1.5 rounded-lg border border-amber-500/30 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-black uppercase">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Pedido</span>
                </button>

                <button
                  onClick={() => closeChat(chat.chatId)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mensajes del Chat */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs bg-slate-950/30">
              {chat.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "restaurant" ? "items-end" : "items-start"
                  }`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl font-medium leading-relaxed ${
                      msg.sender === "restaurant"
                        ? "bg-amber-500 text-slate-950 rounded-tr-none"
                        : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60"
                    }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Input para Enviar Mensaje */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 rounded-b-3xl">
              <input
                type="text"
                placeholder="Escribe un mensaje a WhatsApp..."
                value={chat.tempMessage}
                onChange={(e) =>
                  setActiveChats((prev) =>
                    prev.map((c) =>
                      c.chatId === chat.chatId
                        ? { ...c, tempMessage: e.target.value }
                        : c,
                    ),
                  )
                }
                onKeyDown={(e) => e.key === "Enter" && sendMessage(chat.chatId)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-medium text-xs"
              />
              <button
                onClick={() => sendMessage(chat.chatId)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl transition-all cursor-pointer shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
