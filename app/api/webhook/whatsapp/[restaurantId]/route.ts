import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ restaurantId: string }> },
) {
  try {
    const { restaurantId } = await params;
    const body = await req.json();

    // Extraer datos del payload de Evolution API
    const remoteJid = body?.data?.key?.remoteJid;
    if (!remoteJid || body?.data?.key?.fromMe) {
      return NextResponse.json({ status: "ignored" });
    }

    const senderPhone = remoteJid
      .replace("@s.whatsapp.net", "")
      .replace("@g.us", "");
    const messageText =
      body?.data?.message?.conversation ||
      body?.data?.message?.extendedTextMessage?.text ||
      "";
    const senderName = body?.data?.pushName || "Cliente WhatsApp";

    if (!messageText) return NextResponse.json({ ok: true });

    // Guardar el mensaje entrante en Supabase asociado al restaurante
    const { error } = await supabase.from("messages").insert([
      {
        restaurant_id: restaurantId,
        phone: senderPhone,
        sender_name: senderName,
        content: messageText,
        direction: "incoming",
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Guardado correctamente",
    });
  } catch (err: any) {
    console.error("Error en webhook de WhatsApp:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
