'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Rediriger les non-Super Admins
    if (user?.role?.code !== 'SADMIN') {
      router.push('/dashboard');
      return;
    }
  }, [user, isAuthenticated, router]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo CEI */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold text-2xl">CEI</span>
          </div>
          <h1 className="text-2xl font-bold">Transmission des Résultats Électoraux en Côte d&apos;Ivoire (TRECIV-EXPERT) <br /> Présidentielle 2025</h1>
          <p className="text-muted-foreground">Commission Électorale Indépendante</p>
        </div>

        {/* Card d'accès restreint */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Accès Restreint
            </CardTitle>
            <CardDescription>
              La création de comptes est réservée aux Super Administrateurs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Pour créer un nouveau compte utilisateur, veuillez utiliser la section 
                <strong> Gestion des Utilisateurs</strong> dans le dashboard administratif.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/users">
                  Accéder à la gestion des utilisateurs
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/dashboard">
                  Retour au Dashboard
                </Link>
              </Button>
            </div>

            {/* Lien vers la connexion */}
            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la connexion
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>© 2025 Commission Électorale Indépendante - Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
}
