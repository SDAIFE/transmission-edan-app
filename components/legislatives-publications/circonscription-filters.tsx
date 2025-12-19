"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Search } from "lucide-react";
import type {
  CirconscriptionFiltersProps,
  PublicationStatus,
} from "@/types/legislatives-publications";

export function CirconscriptionFilters({
  filters,
  onFiltersChange,
  loading = false,
}: CirconscriptionFiltersProps) {
  const [selectedStatus, setSelectedStatus] = useState<
    PublicationStatus | "all" | "ready"
  >(filters.readyToPublish ? "ready" : filters.statPub || "all");
  const [searchText, setSearchText] = useState(filters.search || "");

  // Ref pour éviter les appels répétés
  const isInitialMount = useRef(true);
  const onFiltersChangeRef = useRef(onFiltersChange);

  useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange;
  }, [onFiltersChange]);

  // Appliquer les filtres avec debounce pour la recherche
  useEffect(() => {
    // Éviter l'appel au montage initial
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      const newFilters = {
        page: 1, // Reset à la première page lors du filtrage
        limit: filters.limit || 10,
        statPub:
          selectedStatus === "all" || selectedStatus === "ready"
            ? undefined
            : (selectedStatus as PublicationStatus),
        readyToPublish: selectedStatus === "ready" ? true : undefined,
        search: searchText.trim() || undefined,
      };

      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log(
          "🔍 [CirconscriptionFilters] Application des filtres:",
          newFilters
        );
      }

      onFiltersChangeRef.current?.(newFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [selectedStatus, searchText, filters.limit]);

  const clearFilters = () => {
    setSelectedStatus("all");
    setSearchText("");
    onFiltersChange({
      page: 1,
      limit: filters.limit || 10,
    });
  };

  const hasActiveFilters = selectedStatus !== "all" || searchText.trim() !== "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtres
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filtre par statut */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">Statut de publication</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) =>
                setSelectedStatus(value as PublicationStatus | "all" | "ready")
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="ready">En attente de publication</SelectItem>
                <SelectItem value="0">Non publié</SelectItem>
                <SelectItem value="1">Publié</SelectItem>
                <SelectItem value="C">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recherche */}
          <div className="space-y-2">
            <Label htmlFor="search-filter">Rechercher</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search-filter"
                placeholder="Code ou libellé de circonscription..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  Filtres actifs:
                </span>
                {selectedStatus !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Statut:{" "}
                    {selectedStatus === "ready"
                      ? "En attente de publication"
                      : selectedStatus === "0"
                      ? "Non publié"
                      : selectedStatus === "1"
                      ? "Publié"
                      : "Annulé"}
                  </Badge>
                )}
                {searchText.trim() && (
                  <Badge variant="secondary" className="text-xs">
                    Recherche: {searchText}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-1"
                disabled={loading}
              >
                <X className="h-3 w-3" />
                Effacer
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
