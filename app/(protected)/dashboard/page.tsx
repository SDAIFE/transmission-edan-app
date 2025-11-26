'use client';

import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/main-layout';
import ProtectedRoute from '@/components/auth/protected-route';
import { UserDashboardContent } from '@/components/dashboard/user-dashboard-content';
import { AdminDashboardContent } from '@/components/dashboard/admin-dashboard-content';
// import TokenDebug from '@/components/auth/token-debug';

function DashboardContent() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const userRole = user.role?.code;

  // Rendu conditionnel selon le rôle
  if (userRole === 'USER') {
    return (
      <MainLayout>
        <div className="space-y-6">
          <UserDashboardContent user={user} />
          {/* <TokenDebug /> */}
        </div>
      </MainLayout>
    );
  } else if (userRole === 'ADMIN' || userRole === 'SADMIN') {
    return (
      <MainLayout>
        <div className="space-y-6">
          <AdminDashboardContent user={user} />
          {/* <TokenDebug /> */}
        </div>
      </MainLayout>
    );
  }

  // Fallback pour les rôles non reconnus
  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Rôle non reconnu</h1>
          <p className="text-muted-foreground">
            Votre rôle ({userRole}) n&apos;est pas configuré pour le dashboard.
          </p>
        </div>
        {/* <TokenDebug /> */}
      </div>
    </MainLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
