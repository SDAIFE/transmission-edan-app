"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Save, MapPin, UserCheck, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import {
  usersApi,
  listsApi,
  type AssignCirconscriptionsData,
  type SimpleCirconscription,
  type User,
} from "@/lib/api";

interface ManageUserCirconscriptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

export function ManageUserCirconscriptionsModal({
  open,
  onOpenChange,
  user,
  onSuccess,
}: ManageUserCirconscriptionsModalProps) {
  const [loading, setLoading] = useState(false);
  const [listsLoading, setListsLoading] = useState(false);
  const [selectedCirconscriptions, setSelectedCirconscriptions] = useState<
    string[]
  >([]);
  const [circonscriptions, setCirconscriptions] = useState<
    SimpleCirconscription[]
  >([]);
  const [searchAvailable, setSearchAvailable] = useState(""); // ✅ NOUVEAU : Recherche dans les circonscriptions disponibles
  const [searchAssigned, setSearchAssigned] = useState(""); // ✅ NOUVEAU : Recherche dans les circonscriptions assignées

  // Charger les circonscriptions disponibles
  useEffect(() => {
    if (open) {
      loadCirconscriptions();
    }
  }, [open]);

  // Charger les circonscriptions assignées quand la modale s'ouvre
  useEffect(() => {
    if (user && open) {
      // Si l'utilisateur a des circonscriptions, les charger
      // ✅ CORRECTION : Normaliser COD_CE (backend) vers codCe (SimpleCirconscription)
      const userCirconscriptions = user.circonscriptions || [];
      setSelectedCirconscriptions(userCirconscriptions.map((c) => c.COD_CE));
    }
  }, [user, open]);

  // ✅ NOUVEAU : Réinitialiser les recherches à la fermeture
  useEffect(() => {
    if (!open) {
      setSearchAvailable("");
      setSearchAssigned("");
    }
  }, [open]);

  const loadCirconscriptions = async () => {
    try {
      setListsLoading(true);
      const circList = await listsApi.getCirconscriptionsList();
      setCirconscriptions(circList);
    } catch (error: unknown) {
      console.error("Erreur lors du chargement des circonscriptions:", error);
      toast.error("Erreur lors du chargement des circonscriptions");
    } finally {
      setListsLoading(false);
    }
  };

  const handleCirconscriptionToggle = (circonscriptionCode: string) => {
    setSelectedCirconscriptions((prev) =>
      prev.includes(circonscriptionCode)
        ? prev.filter((code) => code !== circonscriptionCode)
        : [...prev, circonscriptionCode]
    );
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const data: AssignCirconscriptionsData = {
        circonscriptionCodes: selectedCirconscriptions,
      };

      await usersApi.assignCirconscriptions(user.id, data);

      toast.success(
        "Circonscriptions mises à jour avec succès. Les CELs seront automatiquement recalculées."
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      console.error("Erreur lors de la mise à jour:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour des circonscriptions";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedCirconscriptions([]);
    onOpenChange(false);
  };

  if (!user) return null;

  // ✅ CORRECTION : Normaliser les codes (COD_CE → codCe) pour la correspondance
  const selectedCirconscriptionsData = selectedCirconscriptions
    .map((code) => {
      // Chercher d'abord par codCe exact
      let found = circonscriptions.find((c) => c.codCe === code);
      // Si pas trouvé, chercher par COD_CE (format backend)
      if (!found) {
        found = circonscriptions.find(
          (c) =>
            c.codCe.toUpperCase() === code || c.codCe === code.toUpperCase()
        );
      }
      return found;
    })
    .filter(Boolean) as SimpleCirconscription[];

  // ✅ NOUVEAU : Filtrer les circonscriptions disponibles selon la recherche
  const filteredAvailableCirconscriptions = circonscriptions.filter((circ) => {
    if (!searchAvailable) return true;
    const searchLower = searchAvailable.toLowerCase();
    return (
      circ.libCe?.toLowerCase().includes(searchLower) ||
      circ.codCe?.toLowerCase().includes(searchLower)
    );
  });

  // ✅ NOUVEAU : Filtrer les circonscriptions assignées selon la recherche
  const filteredAssignedCirconscriptions = selectedCirconscriptionsData.filter(
    (circ) => {
      if (!searchAssigned) return true;
      const searchLower = searchAssigned.toLowerCase();
      return (
        circ.libCe?.toLowerCase().includes(searchLower) ||
        circ.codCe?.toLowerCase().includes(searchLower)
      );
    }
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Gérer les circonscriptions
          </DialogTitle>
          <DialogDescription>
            Assigner ou retirer des circonscriptions pour {user.firstName}{" "}
            {user.lastName}. Les CELs seront automatiquement recalculées par le
            système.
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
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Rôle: {user.role.code}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Liste des circonscriptions disponibles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Circonscriptions disponibles
                </CardTitle>
                <CardDescription>
                  Sélectionnez les circonscriptions à assigner
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* ✅ NOUVEAU : Zone de recherche */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par nom ou code..."
                      value={searchAvailable}
                      onChange={(e) => setSearchAvailable(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {listsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredAvailableCirconscriptions.length > 0 ? (
                      filteredAvailableCirconscriptions.map((circ) => (
                        <div
                          key={circ.codCe}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`circ-${circ.codCe}`}
                            checked={selectedCirconscriptions.includes(
                              circ.codCe
                            )}
                            onCheckedChange={() =>
                              handleCirconscriptionToggle(circ.codCe)
                            }
                          />
                          <Label
                            htmlFor={`circ-${circ.codCe}`}
                            className="text-sm flex-1 cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{circ.libCe}</div>
                                <div className="text-muted-foreground">
                                  Code: {circ.codCe}
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {circ.codCe}
                              </Badge>
                            </div>
                          </Label>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>
                          {searchAvailable
                            ? "Aucune circonscription ne correspond à votre recherche"
                            : "Aucune circonscription disponible"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Circonscriptions sélectionnées */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Circonscriptions assignées
                </CardTitle>
                <CardDescription>
                  {selectedCirconscriptions.length} circonscription
                  {selectedCirconscriptions.length > 1 ? "s" : ""} sélectionnée
                  {selectedCirconscriptions.length > 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* ✅ NOUVEAU : Zone de recherche */}
                {selectedCirconscriptionsData.length > 0 && (
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher par nom ou code..."
                        value={searchAssigned}
                        onChange={(e) => setSearchAssigned(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                )}

                {filteredAssignedCirconscriptions.length > 0 ? (
                  <div className="space-y-2">
                    {filteredAssignedCirconscriptions.map((circ) => (
                      <div
                        key={circ.codCe}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{circ.libCe}</p>
                          <p className="text-sm text-muted-foreground">
                            Code: {circ.codCe}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCirconscriptionToggle(circ.codCe)
                          }
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>
                      {searchAssigned
                        ? "Aucune circonscription assignée ne correspond à votre recherche"
                        : "Aucune circonscription sélectionnée"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Résumé des changements */}
          {selectedCirconscriptionsData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Résumé des changements
                </CardTitle>
                <CardDescription>
                  Les CELs seront automatiquement recalculées après la
                  sauvegarde.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedCirconscriptionsData.map((circ) => (
                    <Badge
                      key={circ.codCe}
                      variant="secondary"
                      className="text-sm"
                    >
                      {circ.libCe} ({circ.codCe})
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
            disabled={loading || listsLoading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {loading ? "Sauvegarde..." : "Sauvegarder les changements"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
