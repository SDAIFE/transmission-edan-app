'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';
import { MapPin } from 'lucide-react';
import { listsApi, type SimpleCirconscription } from '@/lib/api/lists';

export interface CirconscriptionSelectorProps {
  onCirconscriptionSelect: (circonscription: SimpleCirconscription | null) => void;
  selectedCirconscription: SimpleCirconscription | null;
  placeholder?: string;
  disabled?: boolean;
  allowMultiple?: boolean;
  onMultipleSelect?: (circonscriptions: SimpleCirconscription[]) => void;
  selectedMultiple?: SimpleCirconscription[];
}

/**
 * Composant de sélection de circonscription
 * 
 * Caractéristiques :
 * - Sélection unique ou multiple
 * - Chargement automatique de la liste
 * - Gestion des erreurs
 * - Compatible avec MultiSelect
 */
export function CirconscriptionSelector({ 
  onCirconscriptionSelect, 
  selectedCirconscription, 
  placeholder = "Sélectionner une circonscription...",
  disabled = false,
  allowMultiple = false,
  onMultipleSelect,
  selectedMultiple = []
}: CirconscriptionSelectorProps) {
  const [circonscriptions, setCirconscriptions] = useState<SimpleCirconscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCirconscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const circonscriptionsList = await listsApi.getCirconscriptionsList();
      
      setCirconscriptions(circonscriptionsList);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [CirconscriptionSelector] Circonscriptions chargées:', {
          total: circonscriptionsList.length,
        });
      }
      
    } catch (err) {
      console.error('❌ [CirconscriptionSelector] Erreur lors du chargement des circonscriptions:', err);
      setError('Erreur lors du chargement des circonscriptions');
    } finally {
      setLoading(false);
    }
  };

  // Charger les circonscriptions au montage du composant
  useEffect(() => {
    loadCirconscriptions();
  }, []);

  // Convertir les circonscriptions en options pour MultiSelect
  const circonscriptionOptions: MultiSelectOption[] = circonscriptions.map(circ => ({
    value: circ.codCe,
    label: circ.libCe,
    description: circ.codCe,
  }));

  // Gérer la sélection (sélection unique par défaut)
  const handleCirconscriptionChange = (selected: string[]) => {
    if (allowMultiple && onMultipleSelect) {
      // Mode sélection multiple
      const selectedCirconscriptions = circonscriptions.filter(
        circ => selected.includes(circ.codCe)
      );
      onMultipleSelect(selectedCirconscriptions);
    } else {
      // Mode sélection unique
      if (selected.length > 0) {
        const selectedCode = selected[0];
        const selectedCirconscriptionData = circonscriptions.find(
          circ => circ.codCe === selectedCode
        );
        if (selectedCirconscriptionData) {
          onCirconscriptionSelect(selectedCirconscriptionData);
        }
      } else {
        onCirconscriptionSelect(null);
      }
    }
  };

  // Déterminer les valeurs sélectionnées
  const selectedValues = allowMultiple && selectedMultiple
    ? selectedMultiple.map(c => c.codCe)
    : selectedCirconscription
    ? [selectedCirconscription.codCe]
    : [];

  return (
    <div className="space-y-2">
      <Label htmlFor="circonscription-selector">
        <MapPin className="inline mr-2 h-4 w-4" />
        Circonscription {allowMultiple ? '(sélection multiple)' : '*'}
      </Label>
      
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-sm text-red-600">{error}</p>
          <button 
            onClick={loadCirconscriptions}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <>
          <MultiSelect
            options={circonscriptionOptions}
            selected={selectedValues}
            onChange={handleCirconscriptionChange}
            placeholder={placeholder}
            searchPlaceholder="Rechercher une circonscription..."
            emptyText="Aucune circonscription trouvée."
            maxDisplay={allowMultiple ? undefined : 1}
            disabled={disabled}
          />
          
          {/* Affichage des circonscriptions sélectionnées */}
          {allowMultiple && selectedMultiple && selectedMultiple.length > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-blue-600">
                📋 {selectedMultiple.length} circonscription{selectedMultiple.length > 1 ? 's' : ''} sélectionnée{selectedMultiple.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </>
      )}
      
      {!allowMultiple && selectedCirconscription && (
        <div className="text-sm text-green-600 flex justify-center items-center gap-1">
          Circonscription sélectionnée : <span className="font-medium">{selectedCirconscription.libCe}</span>
        </div>
      )}
    </div>
  );
}

