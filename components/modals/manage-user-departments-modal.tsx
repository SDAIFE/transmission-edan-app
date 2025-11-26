'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, MapPin, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { usersApi, type AssignDepartmentsData } from '@/lib/api';

// Départements disponibles (mockés)
const departements = [
  { id: '1', code: '01', libelle: 'Abidjan', region: 'Lagunes' },
  { id: '2', code: '02', libelle: 'Yamoussoukro', region: 'Yamoussoukro' },
  { id: '3', code: '03', libelle: 'Bouaké', region: 'Vallée du Bandama' },
  { id: '4', code: '04', libelle: 'San-Pédro', region: 'Bas-Sassandra' },
  { id: '5', code: '05', libelle: 'Korhogo', region: 'Poro' },
  { id: '6', code: '06', libelle: 'Man', region: 'Tonkpi' },
  { id: '7', code: '07', libelle: 'Gagnoa', region: 'Gôh' },
  { id: '8', code: '08', libelle: 'Divo', region: 'Lôh-Djiboua' },
];

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    code: string;
  };
  departements: {
    id: string;
    codeDepartement: string;
    libelleDepartement: string;
  }[];
}

interface ManageUserDepartmentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

export function ManageUserDepartmentsModal({ 
  open, 
  onOpenChange, 
  user, 
  onSuccess 
}: ManageUserDepartmentsModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedDepartements, setSelectedDepartements] = useState<string[]>([]);

  // Charger les départements assignés quand la modale s'ouvre
  useEffect(() => {
    if (user && open) {
      setSelectedDepartements(user.departements.map(d => d.codeDepartement));
    }
  }, [user, open]);

  const handleDepartementToggle = (departementCode: string) => {
    setSelectedDepartements(prev => 
      prev.includes(departementCode)
        ? prev.filter(code => code !== departementCode)
        : [...prev, departementCode]
    );
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const data: AssignDepartmentsData = {
        departementCodes: selectedDepartements,
      };
      
      await usersApi.assignDepartments(user.id, data);
      
      toast.success('Départements mis à jour avec succès');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      console.error('Erreur lors de la mise à jour:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour des départements';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedDepartements([]);
    onOpenChange(false);
  };

  if (!user) return null;

  const selectedDepartementsData = selectedDepartements.map(code => 
    departements.find(d => d.code === code)
  ).filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Gérer les départements
          </DialogTitle>
          <DialogDescription>
            Assigner ou retirer des départements pour {user.firstName} {user.lastName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de l'utilisateur */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserCheck className="h-4 w-4" />
                Utilisateur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Rôle: {user.role.code}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Liste des départements disponibles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Départements disponibles</CardTitle>
                <CardDescription>
                  Sélectionnez les départements à assigner
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {departements.map((dept) => (
                    <div key={dept.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dept-${dept.id}`}
                        checked={selectedDepartements.includes(dept.code)}
                        onCheckedChange={() => handleDepartementToggle(dept.code)}
                      />
                      <Label htmlFor={`dept-${dept.id}`} className="text-sm flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{dept.libelle}</div>
                            <div className="text-muted-foreground">
                              {dept.region} - {dept.code}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {dept.code}
                          </Badge>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Départements sélectionnés */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Départements assignés</CardTitle>
                <CardDescription>
                  {selectedDepartements.length} département{selectedDepartements.length > 1 ? 's' : ''} sélectionné{selectedDepartements.length > 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDepartementsData.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDepartementsData.map((dept) => (
                      <div key={dept?.code} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{dept?.libelle}</p>
                          <p className="text-sm text-muted-foreground">
                            {dept?.region} - {dept?.code}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDepartementToggle(dept?.code || '')}
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun département sélectionné</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Résumé des changements */}
          {selectedDepartementsData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Résumé des changements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedDepartementsData.map((dept) => (
                    <Badge key={dept?.code} variant="secondary" className="text-sm">
                      {dept?.libelle} ({dept?.code})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button 
            type="button" 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {loading ? 'Sauvegarde...' : 'Sauvegarder les changements'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
