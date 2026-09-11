import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QRPido | Sistema de Gestión y Pedidos para Restaurantes",
  description:
    "Optimiza la gestión de tu restaurante, administra menús digitales con códigos QR, controla múltiples sucursales y fideliza a tus clientes con campañas automatizadas.",
  keywords: [
    "restaurantes",
    "menú digital",
    "pedidos QR",
    "gestión de sucursales",
    "QRPido",
  ],
  authors: [{ name: "Castro Studio" }],
  openGraph: {
    title: "QRPido | Sistema de Gestión y Pedidos para Restaurantes",
    description:
      "La plataforma todo en uno para optimizar pedidos, menús y administración de restaurantes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
