'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/main-layout';
import Link from 'next/link';

// Composants publications
import { PublicationsPageHeader } from '@/components/publications/publications-page-header';
import { PublicationsPageContentV2 as PublicationsPageContent } from '@/components/publications/publications-page-content-v2';

const PublicationsPage = memo(function PublicationsPage() {
  // Log pour tester avec le contexte simplifié
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('🔄 [PublicationsPage] RENDER');
  // }

  const { user: currentUser, isAuthenticated } = useAuth();
  
  // Stabiliser les variables calculées avec useMemo
  const canPublish = useMemo(() => {
    return currentUser?.role?.code === 'SADMIN' || currentUser?.role?.code === 'ADMIN';
  }, [currentUser?.role?.code]);
  
  const isUser = useMemo(() => {
    return currentUser?.role?.code === 'USER';
  }, [currentUser?.role?.code]);

  // Stabiliser les props passées aux composants enfants
  const headerProps = useMemo(() => ({ isUser }), [isUser]);
  const contentProps = useMemo(() => ({ isUser }), [isUser]);

  // Vérifications d'authentification et permissions
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Non connecté</CardTitle>
            <CardDescription className="text-center">
              Vous devez être connecté pour accéder à cette page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auth/login">Se connecter</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canPublish && !isUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Accès non autorisé</CardTitle>
            <CardDescription className="text-center">
              Vous n&apos;avez pas les permissions pour gérer les {isUser ? 'consolidations' : 'publications'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard">Retour au Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <PublicationsPageHeader {...headerProps} />

        {/* Contenu principal */}
        <PublicationsPageContent {...contentProps} />
      </div>
    </MainLayout>
  );
});

export default PublicationsPage;
