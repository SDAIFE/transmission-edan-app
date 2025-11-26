'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const reconnectSchema = z.object({
  password: z.string().min(1, 'Le mot de passe est requis'),
});

type ReconnectFormData = z.infer<typeof reconnectSchema>;

interface SessionExpiredModalEnhancedProps {
  isOpen: boolean;
  onReconnect?: () => void;
  userEmail?: string;
  savedData?: any; // Données du formulaire sauvegardées
}

/**
 * Modal de session expirée avec reconnexion rapide
 * 
 * Fonctionnalités :
 * - Reconnexion sans quitter la page
 * - Email pré-rempli
 * - Restauration des données du formulaire
 * - UX optimale
 */
export function SessionExpiredModalEnhanced({
  isOpen,
  onReconnect,
  userEmail,
  savedData
}: SessionExpiredModalEnhancedProps) {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReconnectFormData>({
    resolver: zodResolver(reconnectSchema),
  });

  const onSubmit = async (data: ReconnectFormData) => {
    if (!userEmail) {
      setError('Email utilisateur manquant');
      return;
    }

    try {
      setIsReconnecting(true);
      setError(null);

      // Reconnexion avec l'email sauvegardé
      await login({
        email: userEmail,
        password: data.password,
      });

      toast.success('Reconnexion réussie !');
      
      // Callback de reconnexion (restaurer les données)
      if (onReconnect) {
        onReconnect();
      }

    } catch (error: any) {
      console.error('❌ Erreur de reconnexion:', error);
      setError(error.message || 'Erreur de reconnexion');
    } finally {
      setIsReconnecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {/* Pas de fermeture manuelle */}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Session expirée
          </DialogTitle>
          <DialogDescription>
            Votre session a expiré après une période d'inactivité. Reconnectez-vous pour continuer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email (lecture seule) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={userEmail || ''}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Mot de passe */}
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="Entrez votre mot de passe"
              {...register('password')}
              disabled={isReconnecting}
              autoFocus
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Message d'info si données sauvegardées */}
          {savedData && (
            <Alert>
              <RefreshCw className="h-4 w-4" />
              <AlertDescription>
                Vos données de formulaire seront restaurées après reconnexion.
              </AlertDescription>
            </Alert>
          )}

          {/* Erreur */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Boutons */}
          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={isReconnecting}
            >
              {isReconnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se reconnecter
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.href = '/auth/login'}
              disabled={isReconnecting}
            >
              Page de connexion
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

