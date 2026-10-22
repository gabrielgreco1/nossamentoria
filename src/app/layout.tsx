import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sora"
});

export const metadata: Metadata = {
  title: "NossaMentoria",
  description: "Plataforma privada de mentoria para planos, aulas, materiais e progresso.",
  icons: {
    icon: "/brand/nossamentoria-symbol-v1.png",
    apple: "/brand/nossamentoria-symbol-v1.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${sora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
