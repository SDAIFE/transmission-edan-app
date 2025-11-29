'use client';

/**
 * Exemple d'utilisation des listes simples de circonscriptions
 * 
 * Ce fichier montre différentes façons d'utiliser :
 * 1. Le hook useSimpleLists()
 * 2. Le composant CirconscriptionSelector
 * 3. L'API listsApi directement
 */

import { useState } from 'react';
import { useSimpleLists } from '@/hooks/useSimpleLists';
import { CirconscriptionSelector } from '@/components/ui/circonscription-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Exemple 1 : Utilisation du hook useSimpleLists()
 */
export function ExampleWithHook() {
  const { circonscriptions, cels, loading, error, refetch } = useSimpleLists();
  const [selectedCirconscription, setSelectedCirconscription] = useState<{
    codCe: string;
    libCe: string;
  } | null>(null);

  if (loading) {
    return <div>Chargement des listes...</div>;
  }

  if (error) {
    return (
      <div>
        <p className="text-red-600">Erreur: {error}</p>
        <Button onClick={refetch}>Réessayer</Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exemple avec useSimpleLists()</CardTitle>
        <CardDescription>
          Utilisation du hook personnalisé pour charger les circonscriptions et CELs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Sélectionner une circonscription</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedCirconscription?.codCe || ''}
            onChange={(e) => {
              const circ = circonscriptions.find(c => c.codCe === e.target.value);
              setSelectedCirconscription(circ || null);
            }}
          >
            <option value="">Sélectionner une circonscription</option>
            {circonscriptions.map((circ) => (
              <option key={circ.codCe} value={circ.codCe}>
                {circ.libCe}
              </option>
            ))}
          </select>
        </div>

        {selectedCirconscription && (
          <div className="p-3 bg-green-50 rounded">
            <p className="text-sm">
              <strong>Circonscription sélectionnée:</strong> {selectedCirconscription.libCe}
            </p>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>Total circonscriptions: {circonscriptions.length}</p>
          <p>Total CELs: {cels.length}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Exemple 2 : Utilisation du composant CirconscriptionSelector
 */
export function ExampleWithComponent() {
  const [selectedCirconscription, setSelectedCirconscription] = useState<{
    codCe: string;
    libCe: string;
  } | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exemple avec CirconscriptionSelector</CardTitle>
        <CardDescription>
          Utilisation du composant réutilisable pour la sélection de circonscription
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CirconscriptionSelector
          onCirconscriptionSelect={setSelectedCirconscription}
          selectedCirconscription={selectedCirconscription}
          placeholder="Choisir une circonscription..."
        />
      </CardContent>
    </Card>
  );
}

/**
 * Exemple 3 : Sélection multiple de circonscriptions
 */
export function ExampleMultipleSelection() {
  const [selectedCirconscriptions, setSelectedCirconscriptions] = useState<{
    codCe: string;
    libCe: string;
  }[]>([]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exemple avec sélection multiple</CardTitle>
        <CardDescription>
          Permet de sélectionner plusieurs circonscriptions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CirconscriptionSelector
          allowMultiple={true}
          onMultipleSelect={setSelectedCirconscriptions}
          selectedMultiple={selectedCirconscriptions}
          placeholder="Choisir une ou plusieurs circonscriptions..."
        />

        {selectedCirconscriptions.length > 0 && (
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-sm font-medium mb-2">
              Circonscriptions sélectionnées ({selectedCirconscriptions.length}):
            </p>
            <ul className="list-disc list-inside space-y-1">
              {selectedCirconscriptions.map((circ) => (
                <li key={circ.codCe} className="text-sm">
                  {circ.libCe} ({circ.codCe})
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Exemple 4 : Formulaire complet avec circonscription et CEL
 */
export function ExampleCompleteForm() {
  const { circonscriptions, cels, loading, error } = useSimpleLists();
  const [formData, setFormData] = useState({
    circonscription: '',
    cel: '',
  });

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-600">Erreur: {error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulaire complet</CardTitle>
        <CardDescription>
          Exemple de formulaire avec sélection de circonscription et CEL
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Circonscription *</label>
          <select
            className="w-full p-2 border rounded"
            value={formData.circonscription}
            onChange={(e) => setFormData({ ...formData, circonscription: e.target.value })}
          >
            <option value="">Sélectionner une circonscription</option>
            {circonscriptions.map((circ) => (
              <option key={circ.codCe} value={circ.codCe}>
                {circ.libCe}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Cellule Électorale Locale (CEL)</label>
          <select
            className="w-full p-2 border rounded"
            value={formData.cel}
            onChange={(e) => setFormData({ ...formData, cel: e.target.value })}
            disabled={!formData.circonscription}
          >
            <option value="">Sélectionner une CEL</option>
            {cels.map((cel) => (
              <option key={cel.codeCellule} value={cel.codeCellule}>
                {cel.libelleCellule}
              </option>
            ))}
          </select>
          {cels.length === 0 && (
            <p className="text-sm text-orange-600 mt-1">
              Aucune CEL disponible. Vérifiez vos assignations de circonscriptions.
            </p>
          )}
        </div>

        <Button 
          onClick={() => {
            console.log('Données du formulaire:', formData);
            alert(`Circonscription: ${formData.circonscription}\nCEL: ${formData.cel}`);
          }}
          disabled={!formData.circonscription}
        >
          Soumettre
        </Button>
      </CardContent>
    </Card>
  );
}

