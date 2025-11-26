import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from '@/contexts/AuthContext';
import SessionMonitor from '@/components/auth/session-monitor';
import SessionExpiredHandler from '@/components/auth/session-expired-handler';
import SessionExpiredFallback from '@/components/auth/session-expired-fallback';
import InactivityDetector from '@/components/auth/inactivity-detector';
import { Toaster } from '@/components/ui/sonner';
import "./globals.css";
import "@/styles/leaflet.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Transmission EDAN - CEI",
  description: "Application de transmission des résultats  - Commission Électorale Indépendante",
  keywords: ["élections", "résultats", "CEI", "Côte d'Ivoire", "transmission"],
  authors: [{ name: "Commission Électorale Indépendante" }],
  creator: "CEI",
  publisher: "CEI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <SessionMonitor />
          <InactivityDetector />
          <SessionExpiredHandler />
          <SessionExpiredFallback />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
