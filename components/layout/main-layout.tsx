"use client";

import { QueryProvider } from "@/lib/hooks/use-query";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { useSidebar } from "@/store/ui";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  // ✅ CORRECTION : useSidebar() retourne { isOpen, toggle, setOpen }
  const { isOpen: sidebarOpen } = useSidebar();

  return (
    <QueryProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <Header />

        <div className="flex">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          {/* ✅ Le header est sticky (pas fixed), donc il prend l'espace dans le flux normal */}
          <main
            className={`flex-1 transition-all duration-300 ${
              sidebarOpen ? "ml-64" : "ml-16"
            }`}
          >
            <div className="p-6">{children}</div>
          </main>
        </div>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "hsl(var(--background))",
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--border))",
            },
          }}
        />
      </div>
    </QueryProvider>
  );
}
