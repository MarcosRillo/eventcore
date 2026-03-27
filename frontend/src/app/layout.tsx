import "./globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from 'next/headers';

import { AuthProvider } from '@/context/AuthContext';
import { SWRProvider } from '@/lib/swr';
import { ToastProvider } from '@/shared/context';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plataforma Calendario - Gestión de Eventos",
  description: "Sistema completo de gestión de calendario y eventos con multi-tenancy",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get('x-nonce') ?? '';
  void nonce; // nonce is read to make this layout dynamic (per-request CSP)
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SWRProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </SWRProvider>
      </body>
    </html>
  );
}
