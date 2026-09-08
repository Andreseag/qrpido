import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { restaurantId, phone, content } = await req.json();

    if (!restaurantId || !phone || !content) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 },
      );
    }

    // 1. Guardar primero en Supabase
    const { error: dbError } = await supabase.from("messages").insert([
      {
        restaurant_id: restaurantId,
        phone: phone,
        sender_name: "Restaurante",
        content: content,
        direction: "outgoing",
        created_at: new Date().toISOString(),
      },
    ]);

    if (dbError) throw dbError;

    // 2. Enviar el mensaje a través de Evolution API
    // (Asegúrate de tener estas variables en tu .env.local)
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const evolutionKey = process.env.EVOLUTION_API_KEY;
    const instanceName = process.env.EVOLUTION_INSTANCE_NAME; // Nombre de la instancia del restaurante en Evolution

    if (evolutionUrl && evolutionKey && instanceName) {
      const response = await fetch(
        `${evolutionUrl}/message/sendText/${instanceName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: evolutionKey,
          },
          body: JSON.stringify({
            number: phone,
            options: {
              delay: 1200,
              presence: "composing",
            },
            textMessage: {
              text: content,
            },
          }),
        },
      );

      if (!response.ok) {
        console.error("Error al enviar mensaje por Evolution API");
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error en ruta de envío:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
