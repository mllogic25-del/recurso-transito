import type { Metadata } from "next";
import "./globals.css";
import ReferralTracker from "@/components/ReferralTracker";

export const metadata: Metadata = {
  title: "AutoRecurso - Sistema de Recursos de Trânsito",
  description: "Geração rápida e fundamentada de recursos de multas, defesas prévias e recursos JARI.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col antialiased text-slate-800">
        <ReferralTracker />
        {children}
      </body>
    </html>
  );
}
