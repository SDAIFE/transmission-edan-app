# TODO - Implémentations à démarrer - Supervision Législatives

**Date de création** : 2025-01-27  
**Basé sur** : Analyse du prompt (`ANALYSE_PROMPT_SUPERVISION_LEGISLATIVES.md`)

---

## 🔴 Priorité 1 - Critiques (À faire en premier)

### 1. Vérifier la structure des données `regions`
**Fichier concerné** : `types/legislatives-supervision.ts`, `components/legislatives-supervision/supervision-dashboard.tsx`

**Action** :
- [ ] Vérifier avec le backend la structure exacte des données `regions`
- [ ] Confirmer si les champs suivants sont disponibles :
  - `nombreCirconscriptionsPubliees`
  - `nombreCels`
  - `nombreCelsImportes`
- [ ] Ou si seul `celsEnAttente` est disponible

**Impact** : Détermine si les types et l'affichage doivent être modifiés

---

### 2. Clarifier les permissions USER
**Fichier concerné** : `lib/api/legislatives-supervision.ts`, documentation

**Action** :
- [ ] Vérifier avec le backend si les USER peuvent accéder au tableau de bord
- [ ] Si oui, avec filtrage sur leurs circonscriptions assignées
- [ ] Mettre à jour les commentaires dans le code
- [ ] Mettre à jour la documentation si nécessaire

**Impact** : Incohérence entre prompt et code actuel

---

## 🟡 Priorité 2 - Importantes (À faire ensuite)

### 3. Mettre à jour les types et l'affichage des régions
**Fichier concerné** : `types/legislatives-supervision.ts`, `components/legislatives-supervision/supervision-dashboard.tsx`

**Action** :
- [ ] Mettre à jour l'interface `RegionSupervision` selon la réponse du backend
- [ ] Ajouter les colonnes manquantes dans le tableau des régions :
  - Colonne "Circonscriptions Publiées" (si disponible)
  - Colonne "Total CELs" (si disponible)
  - Colonne "CELs Importées" (si disponible)
- [ ] Mettre à jour la colonne "CELs en Attente" si nécessaire

**Dépend de** : Tâche #1

---

### 4. Implémenter le tri des alertes par priorité
**Fichier concerné** : `components/legislatives-supervision/supervision-dashboard.tsx`

**Action** :
- [ ] Trier les alertes par priorité : HAUTE > MOYENNE > BASSE
- [ ] Appliquer le tri avant l'affichage dans le tableau
- [ ] Tester avec différentes combinaisons d'alertes

**Code à modifier** : Lignes 135-197 (tableau des alertes)

---

### 5. Ajouter des filtres par type d'alerte
**Fichier concerné** : `components/legislatives-supervision/supervision-dashboard.tsx`

**Action** :
- [ ] Ajouter des boutons/filtres pour : ANOMALIE, RETARD, ERREUR
- [ ] Implémenter la logique de filtrage
- [ ] Afficher le nombre d'alertes par type
- [ ] Permettre la sélection multiple de filtres

**Code à modifier** : Section alertes (lignes 354-372)

---

### 6. Vérifier et ajouter l'affichage des listes
**Fichier concerné** : `components/legislatives-supervision/supervision-circonscription-details-modal.tsx`

**Action** :
- [ ] Vérifier si les données peuvent contenir `listes` au lieu de `candidats`
- [ ] Créer un tableau pour les listes (similaire à celui des candidats)
- [ ] Afficher conditionnellement : candidats OU listes
- [ ] Colonnes pour les listes : Intitulé, Score, Pourcentage, Nombre Élus, Classement

**Code à modifier** : Lignes 354-370 (actuellement seulement candidats)

---

## 🟢 Priorité 3 - Améliorations (À faire après)

### 7. Installer une bibliothèque de graphiques
**Fichier concerné** : `package.json`, configuration

**Action** :
- [ ] Choisir une bibliothèque (Recharts recommandé pour React)
- [ ] Installer : `npm install recharts` ou `npm install chart.js react-chartjs-2`
- [ ] Configurer les imports nécessaires

**Recommandation** : Recharts (plus simple pour React/Next.js)

---

### 8. Créer un graphique pour l'évolution des publications
**Fichier concerné** : `components/legislatives-supervision/supervision-stats.tsx`

**Action** :
- [ ] Créer un composant `EvolutionPublicationsChart`
- [ ] Utiliser un graphique en ligne (Line Chart)
- [ ] Afficher les dates en abscisse
- [ ] Afficher le nombre de publications en ordonnée
- [ ] Ajouter des tooltips avec les valeurs exactes
- [ ] Remplacer la liste actuelle (lignes 151-163)

**Données** : `data.tendances.evolutionPublication`

---

### 9. Créer un graphique pour l'évolution des imports
**Fichier concerné** : `components/legislatives-supervision/supervision-stats.tsx`

**Action** :
- [ ] Créer un composant `EvolutionImportsChart`
- [ ] Utiliser un graphique en ligne (Line Chart)
- [ ] Afficher les dates en abscisse
- [ ] Afficher le nombre d'imports en ordonnée
- [ ] Ajouter des tooltips avec les valeurs exactes
- [ ] Remplacer la liste actuelle (lignes 174-186)

**Données** : `data.tendances.evolutionImports`

---

### 10. Créer un graphique pour les comparaisons régionales
**Fichier concerné** : `components/legislatives-supervision/supervision-stats.tsx` ou `supervision-dashboard.tsx`

**Action** :
- [ ] Créer un composant `RegionsComparisonChart`
- [ ] Utiliser un graphique en barres (Bar Chart)
- [ ] Afficher les régions en abscisse
- [ ] Afficher les métriques (taux de publication, nombre de circonscriptions, etc.)
- [ ] Permettre la sélection de la métrique à afficher
- [ ] Ajouter des tooltips

**Données** : `data.analyses.circonscriptionsParRegion` ou `data.regions`

---

### 11. Implémenter la mise en cache des données
**Fichier concerné** : `components/legislatives-supervision/supervision-page-content.tsx`

**Action** :
- [ ] Utiliser `useMemo` ou `React Query` pour la mise en cache
- [ ] Définir une durée de cache de 30-60 secondes
- [ ] Ne pas refaire d'appel API si les données sont en cache
- [ ] Invalider le cache lors du changement d'onglet

**Option 1** : `useMemo` avec dépendances  
**Option 2** : React Query (si déjà installé)  
**Option 3** : État local avec timestamp

---

### 12. Ajouter un bouton de rafraîchissement manuel
**Fichier concerné** : `components/legislatives-supervision/supervision-page-content.tsx`

**Action** :
- [ ] Ajouter un bouton "Rafraîchir" avec icône Refresh
- [ ] Placer le bouton à côté des onglets
- [ ] Forcer le rechargement des données au clic
- [ ] Afficher un indicateur de chargement pendant le rafraîchissement
- [ ] Invalider le cache lors du rafraîchissement

**Icône** : `RefreshCw` de lucide-react

---

### 13. Implémenter le rafraîchissement automatique
**Fichier concerné** : `components/legislatives-supervision/supervision-page-content.tsx`

**Action** :
- [ ] Utiliser `setInterval` pour rafraîchir toutes les 2-5 minutes
- [ ] Rafraîchir uniquement l'onglet actif
- [ ] Nettoyer l'intervalle lors du démontage du composant
- [ ] Optionnel : Permettre à l'utilisateur de désactiver le rafraîchissement automatique

**Intervalle recommandé** :
- Dashboard : 2 minutes
- Stats : 5 minutes

---

### 14. Ajouter une section pour les logs d'activité
**Fichier concerné** : `components/legislatives-supervision/supervision-circonscription-details-modal.tsx`

**Action** :
- [ ] Créer une section "Logs d'activité" dans le modal
- [ ] Afficher un tableau vide pour l'instant (structure préparée)
- [ ] Afficher un message "Aucun log disponible" si vide
- [ ] Préparer les colonnes : Date, Action, Utilisateur, Détails
- [ ] Activer l'affichage quand les données seront disponibles côté backend

**Données** : `data.logsActivite` (actuellement vide selon le prompt)

---

## 📋 Checklist globale

### Phase 1 - Vérifications (Priorité 1)
- [ ] Tâche #1 : Vérifier structure données régions
- [ ] Tâche #2 : Clarifier permissions USER

### Phase 2 - Corrections critiques (Priorité 2)
- [ ] Tâche #3 : Mettre à jour types et affichage régions
- [ ] Tâche #4 : Tri des alertes par priorité
- [ ] Tâche #5 : Filtres par type d'alerte
- [ ] Tâche #6 : Affichage des listes

### Phase 3 - Améliorations UX (Priorité 3)
- [ ] Tâche #7 : Installer bibliothèque graphiques
- [ ] Tâche #8 : Graphique évolution publications
- [ ] Tâche #9 : Graphique évolution imports
- [ ] Tâche #10 : Graphique comparaisons régionales
- [ ] Tâche #11 : Mise en cache
- [ ] Tâche #12 : Bouton rafraîchissement
- [ ] Tâche #13 : Rafraîchissement automatique
- [ ] Tâche #14 : Section logs d'activité

---

## 🎯 Estimation de temps

- **Priorité 1** : 1-2 heures (vérifications avec backend)
- **Priorité 2** : 4-6 heures (corrections)
- **Priorité 3** : 8-12 heures (améliorations)

**Total estimé** : 13-20 heures

---

## 📝 Notes

- Les tâches de Priorité 1 doivent être faites en premier car elles déterminent les modifications nécessaires
- Les graphiques peuvent être ajoutés progressivement (un par un)
- La mise en cache et le rafraîchissement peuvent être faits indépendamment
- Tester chaque fonctionnalité après implémentation

---

## 🔗 Références

- Analyse complète : `docs/ANALYSE_PROMPT_SUPERVISION_LEGISLATIVES.md`
- Prompt original : `docs/PROMPT_FRONTEND_SUPERVISION_LEGISLATIVES (1).md`
- Types : `types/legislatives-supervision.ts`
- Service API : `lib/api/legislatives-supervision.ts`

