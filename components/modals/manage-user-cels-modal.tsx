'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Save } from 'lucide-react';
import { toast } from 'sonner';
import { usersApi, listsApi, type AssignCelsData, type SimpleCel, type User } from '@/lib/api';

interface ManageUserCelsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

export function ManageUserCelsModal({ open, onOpenChange, user, onSuccess }: ManageUserCelsModalProps) {
  const [loading, setLoading] = useState(false);
  const [cels, setCels] = useState<SimpleCel[]>([]);
  const [selectedCels, setSelectedCels] = useState<string[]>([]);
  const [listsLoading, setListsLoading] = useState(false);

  // Charger les CELs disponibles et les CELs actuelles de l'utilisateur
  useEffect(() => {
    if (open && user) {
      loadCels();
      setSelectedCels(user.cellules ? user.cellules.map(cel => cel.codeCellule) : []);
    }
  }, [open, user]);

  const loadCels = async () => {
    try {
      setListsLoading(true);
      const { cels: celsList } = await listsApi.getFormLists();
      setCels(celsList);
    } catch (error: unknown) {
      console.error('Erreur lors du chargement des CELs:', error);
      toast.error('Erreur lors du chargement des CELs');
    } finally {
      setListsLoading(false);
    }
  };

  const handleCelToggle = (celCode: string) => {
    setSelectedCels(prev => 
      prev.includes(celCode)
        ? prev.filter(code => code !== celCode)
        : [...prev, celCode]
    );
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const data: AssignCelsData = {
        celCodes: selectedCels,
      };

      await usersApi.assignCels(user.id, data);

      toast.success('CELs mises à jour avec succès');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      console.error('Erreur lors de la mise à jour:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour des CELs';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedCels([]);
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Gérer les CELs de {user.firstName} {user.lastName}
          </DialogTitle>
          <DialogDescription>
            Assigner ou retirer des CELs pour cet utilisateur.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* CELs disponibles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">CELs disponibles</h3>
            {listsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                {cels.map((cel) => (
                  <div key={cel.codeCellule} className="flex items-center space-x-3">
                    <Checkbox
                      id={`cel-${cel.codeCellule}`}
                      checked={selectedCels.includes(cel.codeCellule)}
                      onCheckedChange={() => handleCelToggle(cel.codeCellule)}
                    />
                    <Label htmlFor={`cel-${cel.codeCellule}`} className="text-sm flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{cel.libelleCellule}</div>
                          <div className="text-muted-foreground">
                            Code: {cel.codeCellule}
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CELs sélectionnées */}
          {selectedCels.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">CELs sélectionnées</h3>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {selectedCels.map((code) => {
                    const cel = cels.find(c => c.codeCellule === code);
                    return cel ? (
                      <Badge key={code} variant="secondary" className="text-sm">
                        {cel.libelleCellule} ({cel.codeCellule})
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={loading || listsLoading}>
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {loading ? 'Mise à jour...' : 'Sauvegarder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
