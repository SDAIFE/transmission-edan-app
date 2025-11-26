'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      // Si authentifié, rediriger vers le dashboard
      router.push('/dashboard');
    } else {
      // Si non authentifié, rediriger vers la page de connexion
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Affichage de chargement pendant la vérification
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="text-center">
        {/* Logo CEI */}
        <div className="flex justify-center mb-6">
          <Image 
            src="/images/logos/logocei2.webp" 
            alt="CEI" 
            width={80} 
            height={80}
            className="w-20 h-20"
          />
        </div>

        {/* Spinner de chargement */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        
        <h2 className="text-xl font-semibold text-muted-foreground">
          Chargement...
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Vérification de votre authentification
        </p>
              </div>
            </div>
  );
}