# Implémentation - Modal "Circonscriptions Publiées" pour MANAGER, ADMIN et SADMIN

**Date** : 2025-01-27  
**Contexte** : Ajout d'une fonctionnalité permettant aux utilisateurs avec les rôles MANAGER, ADMIN et SADMIN de consulter les circonscriptions publiées depuis la page de supervision.

---

## 📋 Objectif

Permettre aux utilisateurs avec le rôle **MANAGER** d'accéder à un modal depuis la page de supervision qui affiche le tableau des circonscriptions publiées qui leur sont rattachées.

---

## 🎯 Fonctionnalités attendues

1. **Bouton visible pour MANAGER, ADMIN et SADMIN** dans la page de supervision
2. **Modal** qui s'ouvre au clic sur le bouton
3. **Tableau des circonscriptions publiées** réutilisant le composant `CirconscriptionsTable`
4. **Filtrage automatique selon le rôle** :
   - **MANAGER** : Uniquement les circonscriptions avec `publicationStatus === "1"` (publiées) **qui lui sont assignées**
   - **ADMIN/SADMIN** : **Toutes** les circonscriptions avec `publicationStatus === "1"` (publiées)
5. **Fonctionnalités du tableau** :
   - Affichage des circonscriptions avec leurs métriques
   - Pagination
   - Actions :
     - **MANAGER** : Voir détails uniquement (pas de publication/annulation)
     - **ADMIN/SADMIN** : Voir détails + Publication/Annulation (comme dans la page publications)

---

## 📁 Fichiers concernés

### Fichiers à créer
- `components/legislatives-supervision/circonscriptions-publiees-modal.tsx` - Nouveau composant modal (nom générique car utilisé par plusieurs rôles)

### Fichiers à modifier
- `app/(protected)/legislatives-supervision/page.tsx` - Ajout du bouton pour MANAGER, ADMIN et SADMIN
- `components/legislatives-supervision/supervision-page-content.tsx` - Intégration du modal (optionnel, peut être dans la page)

---

## 🔧 Démarche d'implémentation

### Étape 1 : Créer le composant Modal

**Fichier** : `components/legislatives-supervision/circonscriptions-publiees-modal.tsx`

#### Structure du composant

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { CirconscriptionsTable } from "@/components/legislatives-publications/circonscriptions-table";
import { legislativesPublicationsApi } from "@/lib/api/legislatives-publications";
import type { Circonscription, CirconscriptionQuery } from "@/types/legislatives-publications";
import { useAuth } from "@/contexts/AuthContext";

interface CirconscriptionsPublieesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CirconscriptionsPublieesModal({
  isOpen,
  onClose,
}: CirconscriptionsPublieesModalProps) {
  const { user } = useAuth();
  
  // Déterminer si l'utilisateur est MANAGER (pour le filtrage)
  const isManager = user?.role?.code === "MANAGER";
  const isAdmin = user?.role?.code === "ADMIN" || user?.role?.code === "SADMIN";
  const [circonscriptions, setCirconscriptions] = useState<Circonscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Charger les circonscriptions publiées du MANAGER
  const loadCirconscriptionsPubliees = useCallback(async (page = 1) => {
    if (!user) return;

    try {
      setLoading(true);

      // Construire les filtres : uniquement publiées (status = "1")
      const filters: CirconscriptionQuery = {
        page,
        limit: 10,
        publicationStatus: "1", // Uniquement les publiées
      };

      const response = await legislativesPublicationsApi.getCirconscriptions(filters);

      if (response) {
        // Le backend filtre automatiquement :
        // - MANAGER : selon les circonscriptions assignées
        // - ADMIN/SADMIN : toutes les circonscriptions publiées
        setCirconscriptions(response.circonscriptions);
        setTotalPages(response.totalPages);
        setCurrentPage(response.page);
        setTotal(response.total);
      }
    } catch (error: unknown) {
      console.error("Erreur lors du chargement des circonscriptions publiées:", error);
      toast.error("Erreur lors du chargement des circonscriptions");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Charger les données à l'ouverture du modal
  useEffect(() => {
    if (isOpen) {
      loadCirconscriptionsPubliees(1);
    }
  }, [isOpen, loadCirconscriptionsPubliees]);

  // Gestion de la pagination
  const handlePageChange = useCallback((page: number) => {
    loadCirconscriptionsPubliees(page);
  }, [loadCirconscriptionsPubliees]);

  // Gestion de la vue des détails (optionnel, peut ouvrir le modal de détails)
  const handleViewDetails = useCallback((codeCirconscription: string) => {
    // TODO: Implémenter l'ouverture du modal de détails si nécessaire
    console.log("Voir détails:", codeCirconscription);
  }, []);

  // Gestion de la publication (ADMIN/SADMIN uniquement)
  const handlePublish = useCallback(async (codeCirconscription: string) => {
    // TODO: Implémenter la logique de publication si nécessaire
    // Réutiliser la logique de legislatives-publications-page-content.tsx
    console.log("Publier:", codeCirconscription);
  }, []);

  // Gestion de l'annulation (ADMIN/SADMIN uniquement)
  const handleCancel = useCallback(async (codeCirconscription: string) => {
    // TODO: Implémenter la logique d'annulation si nécessaire
    // Réutiliser la logique de legislatives-publications-page-content.tsx
    console.log("Annuler:", codeCirconscription);
  }, []);

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Circonscriptions Publiées
          </DialogTitle>
          <DialogDescription>
            {isManager 
              ? "Liste des circonscriptions publiées qui vous sont assignées"
              : "Liste de toutes les circonscriptions publiées"}
          </DialogDescription>
        </DialogHeader>

        {loading && circonscriptions.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Chargement des circonscriptions...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <CirconscriptionsTable
              circonscriptions={circonscriptions}
              loading={loading}
              isUser={isManager} // MANAGER = isUser (pas d'actions), ADMIN/SADMIN = false (avec actions)
              onViewDetails={handleViewDetails}
              onPublish={isAdmin ? handlePublish : undefined} // ADMIN/SADMIN peuvent publier/annuler
              onCancel={isAdmin ? handleCancel : undefined}
              pagination={{
                page: currentPage,
                limit: 10,
                total,
                totalPages,
                onPageChange: handlePageChange,
              }}
            />

            <div className="flex items-center justify-end">
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Fermer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

#### Points importants :
- Utilise `legislativesPublicationsApi.getCirconscriptions()` avec le filtre `publicationStatus: "1"`
- Le backend filtre automatiquement selon les circonscriptions assignées au MANAGER
- `isUser={true}` désactive les actions de publication/annulation
- Gère la pagination
- Affiche un état de chargement

---

### Étape 2 : Ajouter le bouton dans la page de supervision

**Fichier** : `app/(protected)/legislatives-supervision/page.tsx`

#### Modifications à apporter

1. **Importer les composants nécessaires** :
```typescript
import { useState } from "react";
import { ManagerCirconscriptionsPublieesModal } from "@/components/legislatives-supervision/manager-circonscriptions-publiees-modal";
import { FileText } from "lucide-react";
```

2. **Ajouter l'état pour le modal** :
```typescript
const [isCirconscriptionsModalOpen, setIsCirconscriptionsModalOpen] = useState(false);
```

3. **Vérifier si l'utilisateur a accès (MANAGER, ADMIN ou SADMIN)** :
```typescript
const canAccessCirconscriptions = useMemo(() => {
  const role = currentUser?.role?.code;
  return role === "MANAGER" || role === "ADMIN" || role === "SADMIN";
}, [currentUser?.role?.code]);
```

4. **Ajouter le bouton dans le header** (après la ligne 85) :
```typescript
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold">
      Supervision des Résultats Législatifs
    </h1>
    <p className="text-muted-foreground mt-1">
      Tableau de bord de supervision et statistiques avancées
    </p>
  </div>
  {/* Bouton pour MANAGER, ADMIN et SADMIN */}
  {canAccessCirconscriptions && (
    <Button
      onClick={() => setIsCirconscriptionsModalOpen(true)}
      className="flex items-center gap-2"
    >
      <FileText className="h-4 w-4" />
      Circonscriptions Publiées
    </Button>
  )}
</div>
```

5. **Ajouter le modal à la fin du composant** (avant la fermeture de `MainLayout`) :
```typescript
{/* Modal des circonscriptions publiées */}
{canAccessCirconscriptions && (
  <CirconscriptionsPublieesModal
    isOpen={isCirconscriptionsModalOpen}
    onClose={() => setIsCirconscriptionsModalOpen(false)}
  />
)}
```

---

### Étape 3 : Vérifier l'API et les types

#### Vérifications nécessaires

1. **API `legislativesPublicationsApi.getCirconscriptions()`** :
   - ✅ Vérifier que le filtre `publicationStatus: "1"` fonctionne
   - ✅ Vérifier que le backend filtre automatiquement :
     - **MANAGER** : selon les circonscriptions assignées
     - **ADMIN/SADMIN** : toutes les circonscriptions (pas de filtre par assignation)
   - ✅ Vérifier que la pagination fonctionne correctement

2. **Types** :
   - ✅ Vérifier que `CirconscriptionQuery` accepte `publicationStatus`
   - ✅ Vérifier que `CirconscriptionsTableProps` est compatible

---

### Étape 4 : Tests et validation

#### Scénarios de test

1. **Test 1 : Affichage du bouton**
   - ✅ Se connecter en tant que MANAGER
   - ✅ Vérifier que le bouton "Circonscriptions Publiées" apparaît
   - ✅ Se connecter en tant que ADMIN
   - ✅ Vérifier que le bouton "Circonscriptions Publiées" apparaît
   - ✅ Se connecter en tant que SADMIN
   - ✅ Vérifier que le bouton "Circonscriptions Publiées" apparaît
   - ✅ Se connecter en tant que USER
   - ✅ Vérifier que le bouton n'apparaît pas

2. **Test 2 : Ouverture du modal**
   - ✅ Cliquer sur le bouton
   - ✅ Vérifier que le modal s'ouvre
   - ✅ Vérifier que le titre et la description sont corrects

3. **Test 3 : Chargement des données**
   - ✅ Vérifier que l'état de chargement s'affiche
   - ✅ Vérifier que seules les circonscriptions publiées sont affichées
   - ✅ **En tant que MANAGER** : Vérifier que seules les circonscriptions assignées sont affichées
   - ✅ **En tant que ADMIN/SADMIN** : Vérifier que toutes les circonscriptions publiées sont affichées

4. **Test 4 : Pagination**
   - ✅ Si plus de 10 circonscriptions, vérifier la pagination
   - ✅ Tester les boutons "Précédent" et "Suivant"
   - ✅ Vérifier que les données se rechargent correctement

5. **Test 5 : Actions**
   - ✅ Vérifier que le bouton "Voir détails" fonctionne (si implémenté)
   - ✅ **En tant que MANAGER** : Vérifier que les boutons "Publier" et "Annuler" ne sont pas visibles
   - ✅ **En tant que ADMIN/SADMIN** : Vérifier que les boutons "Publier" et "Annuler" sont visibles et fonctionnent

6. **Test 6 : Cas limites**
   - ✅ MANAGER sans circonscriptions assignées → Modal vide avec message approprié
   - ✅ MANAGER avec circonscriptions mais aucune publiée → Modal vide avec message approprié
   - ✅ ADMIN/SADMIN avec aucune circonscription publiée → Modal vide avec message approprié
   - ✅ Erreur API → Message d'erreur affiché

---

## 🔍 Points d'attention

### 1. Filtrage côté backend
Le backend doit automatiquement filtrer les circonscriptions selon le rôle :
- **MANAGER** : 
  - Les circonscriptions assignées (`user.circonscriptions`)
  - Le statut de publication (`publicationStatus === "1"`)
- **ADMIN/SADMIN** :
  - Toutes les circonscriptions (pas de filtre par assignation)
  - Le statut de publication (`publicationStatus === "1"`)

Si le backend ne filtre pas automatiquement, il faudra :
- Récupérer toutes les circonscriptions publiées
- Filtrer côté frontend selon `user.circonscriptions` pour les MANAGER uniquement

### 2. Réutilisation du composant CirconscriptionsTable
Le composant `CirconscriptionsTable` est déjà utilisé dans `legislatives-publications-page-content.tsx`. Il faut s'assurer que :
- Les props sont compatibles
- Le comportement avec `isUser={true}` (MANAGER) désactive bien les actions de publication/annulation
- Le comportement avec `isUser={false}` (ADMIN/SADMIN) active les actions de publication/annulation
- La pagination fonctionne correctement

### 3. Performance
- Mettre en cache les données si nécessaire
- Limiter le nombre de résultats par page (10 par défaut)
- Implémenter un debounce si des filtres sont ajoutés plus tard

### 4. Accessibilité
- S'assurer que le modal est accessible au clavier
- Ajouter des labels ARIA si nécessaire
- Tester avec un lecteur d'écran

---

## 📝 Checklist d'implémentation

### Phase 1 : Création du composant Modal
- [ ] Créer le fichier `circonscriptions-publiees-modal.tsx`
- [ ] Implémenter la structure de base du modal
- [ ] Implémenter le chargement des données
- [ ] Intégrer le composant `CirconscriptionsTable`
- [ ] Gérer la pagination
- [ ] Gérer les états de chargement et d'erreur
- [ ] Tester le composant isolément

### Phase 2 : Intégration dans la page
- [ ] Modifier `app/(protected)/legislatives-supervision/page.tsx`
- [ ] Ajouter l'état pour le modal
- [ ] Ajouter la vérification des rôles (MANAGER, ADMIN, SADMIN)
- [ ] Ajouter le bouton dans le header
- [ ] Ajouter le modal dans le JSX
- [ ] Tester l'intégration

### Phase 3 : Tests et validation
- [ ] Tester avec un utilisateur MANAGER (filtrage par assignation)
- [ ] Tester avec un utilisateur ADMIN (accès à toutes les circonscriptions)
- [ ] Tester avec un utilisateur SADMIN (accès à toutes les circonscriptions)
- [ ] Tester avec un utilisateur USER (pas d'accès)
- [ ] Tester la pagination
- [ ] Tester les cas limites
- [ ] Vérifier les performances
- [ ] Vérifier l'accessibilité

### Phase 4 : Documentation et finalisation
- [ ] Documenter le composant (JSDoc)
- [ ] Mettre à jour la documentation utilisateur si nécessaire
- [ ] Code review
- [ ] Merge

---

## 🚀 Améliorations futures possibles

1. **Filtres supplémentaires** :
   - Filtrer par région
   - Filtrer par date de publication
   - Recherche par nom de circonscription

2. **Export** :
   - Bouton pour exporter la liste en CSV/Excel

3. **Statistiques** :
   - Afficher le nombre total de circonscriptions publiées
   - Afficher le pourcentage de complétude

4. **Modal de détails** :
   - Intégrer le modal de détails existant pour voir les détails d'une circonscription

---

## 📚 Références

- Composant réutilisé : `components/legislatives-publications/circonscriptions-table.tsx`
- API utilisée : `lib/api/legislatives-publications.ts` → `getCirconscriptions()`
- Types : `types/legislatives-publications.ts`
- Page de référence : `components/legislatives-publications/legislatives-publications-page-content.tsx`

---

## ⚠️ Notes importantes

1. **Permissions** : Le bouton doit être visible pour MANAGER, ADMIN et SADMIN
2. **Filtrage** : Le backend doit gérer le filtrage automatique :
   - **MANAGER** : selon les circonscriptions assignées
   - **ADMIN/SADMIN** : toutes les circonscriptions (pas de filtre par assignation)
3. **Actions** : 
   - **MANAGER** : lecture seule (pas de publication/annulation)
   - **ADMIN/SADMIN** : actions complètes (publication/annulation)
4. **Performance** : Limiter le nombre de résultats par page pour éviter les problèmes de performance
5. **UX** : Afficher des messages clairs si aucune circonscription n'est trouvée

---

**Fin du document**

