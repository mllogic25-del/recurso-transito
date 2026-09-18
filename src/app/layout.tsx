import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoRecurso - Sistema de Recursos de Trânsito",
  description: "Geração rápida e fundamentada de recursos de multas, defesas prévias e recursos JARI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col antialiased text-slate-800">
        {children}
      </body>
    </html>
  );
}
