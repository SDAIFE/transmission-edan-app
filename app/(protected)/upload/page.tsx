'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/main-layout';
import Link from 'next/link';

// Composants upload
import { UploadPageHeader } from '@/components/upload/upload-page-header';
import { UploadPageContent } from '@/components/upload/upload-page-content';

export default function UploadPage() {
  const { user: currentUser, isAuthenticated } = useAuth();
  
  // Vérifier les permissions
  const canUpload = currentUser?.role?.code === 'SADMIN' || currentUser?.role?.code === 'ADMIN' || currentUser?.role?.code === 'USER';

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

  if (!canUpload) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Accès non autorisé</CardTitle>
            <CardDescription className="text-center">
              Vous n&apos;avez pas les permissions pour uploader des fichiers
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
        <UploadPageHeader />
        {/* Contenu principal */}
        <UploadPageContent />
      </div>
    </MainLayout>
  );
}
