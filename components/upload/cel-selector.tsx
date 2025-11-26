'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';
import { MapPin } from 'lucide-react';
import { listsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { CelSelectorProps } from '@/types/upload';

export function CelSelector({ 
  onCelSelect, 
  selectedCel, 
  placeholder = "Sélectionner une CEL...",
  disabled = false 
}: CelSelectorProps) {
  const [cels, setCels] = useState<{ codeCellule: string; libelleCellule: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Récupérer l'utilisateur connecté
  const { user } = useAuth();

  const loadCels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { cels: celsList } = await listsApi.getFormLists();
      
      // Filtrer les CELs selon l'utilisateur
      let filteredCels = celsList;
      
      if (user?.role?.code === 'USER') {
        // Pour les utilisateurs USER, ne montrer que leurs CELs attribuées
        if (user.cellules && user.cellules.length > 0) {
          const userCelCodes = user.cellules.map(cel => cel.codeCellule);
          filteredCels = celsList.filter(cel => userCelCodes.includes(cel.codeCellule));
        } else {
          // Si l'utilisateur n'a pas de CELs attribuées, ne montrer aucune CEL
          filteredCels = [];
        }
      }
      // Pour ADMIN et SADMIN, montrer toutes les CELs
      
      setCels(filteredCels);
      //en developpement, logguer les CELs chargées
      if (process.env.NODE_ENV === 'development') {
      console.log('✅ [CelSelector] CELs chargées:', {
        total: celsList.length,
        filtered: filteredCels.length,
        userRole: user?.role?.code,
        userCels: user?.cellules?.length || 0
      });
      }
      
    } catch (err) {
      console.error('❌ [CelSelector] Erreur lors du chargement des CELs:', err);
      setError('Erreur lors du chargement des CELs');
    } finally {
      setLoading(false);
    }
  };

  // Charger les CELs au montage du composant et quand l'utilisateur change
  useEffect(() => {
    if (user) {
      loadCels();
    }
  }, [user]); // Supprimé loadCels des dépendances

  // Convertir les CELs en options pour MultiSelect
  const celOptions: MultiSelectOption[] = cels.map(cel => ({
    value: cel.codeCellule,
    label: cel.libelleCellule,
    description: cel.codeCellule,
  }));

  // Gérer la sélection (sélection unique)
  const handleCelChange = (selected: string[]) => {
    if (selected.length > 0) {
      // Prendre seulement la première sélection (sélection unique)
      const selectedCode = selected[0];
      const selectedCelData = cels.find(cel => cel.codeCellule === selectedCode);
      if (selectedCelData) {
        onCelSelect(selectedCelData);
      }
    } else {
      // Si aucune sélection, passer null
      onCelSelect(null);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="cel-selector">Commission Électorale Locale *</Label>
      
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-sm text-red-600">{error}</p>
          <button 
            onClick={loadCels}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <>
          <MultiSelect
            options={celOptions}
            selected={selectedCel ? [selectedCel.codeCellule] : []}
            onChange={handleCelChange}
            placeholder={placeholder}
            searchPlaceholder="Rechercher une CEL..."
            emptyText={user?.role?.code === 'USER' ? "Aucune CEL attribuée à votre compte." : "Aucune CEL trouvée."}
            maxDisplay={1}
            disabled={disabled}
          />
          
          {/* Message informatif pour les utilisateurs USER */}
          {user?.role?.code === 'USER' && (
            <div className="text-xs text-muted-foreground mt-1">
              {cels.length > 0 ? (
                <span className="text-blue-600">
                  📋 {cels.length} CEL{cels.length > 1 ? 's' : ''} attribuée{cels.length > 1 ? 's' : ''} à votre compte
                </span>
              ) : (
                <span className="text-orange-600">
                  ⚠️ Aucune CEL n&apos;est attribuée à votre compte. Contactez votre administrateur.
                </span>
              )}
            </div>
          )}
        </>
      )}
      
      {selectedCel && (
        <div className="text-2xl text-green-600 flex justify-center items-center gap-1">
          CEL sélectionnée : <span className="font-medium">{selectedCel.libelleCellule}</span>
        </div>
      )}
    </div>
  );
}
