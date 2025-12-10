# 📋 Explication du composant ImportFilters

## 🎯 Vue d'ensemble

Le composant `ImportFilters` gère les filtres pour la liste des imports. Il permet de filtrer par :
- **Circonscription** : Affiche uniquement les circonscriptions disponibles selon le rôle de l'utilisateur
- **CEL (Commission Électorale)** : Affiche les CELs disponibles, filtrées selon le rôle et la circonscription sélectionnée
- **Statut** : (Actuellement commenté) Permet de filtrer par statut d'import

## 🔄 Flux de données

### 1. Données en entrée (Props)

```typescript
{
  filters: ImportFiltersType,        // Filtres actuels (pour initialiser les états)
  onFiltersChange: Function,          // Callback appelé quand les filtres changent
  availableCels: Array,               // Liste des CELs disponibles (DÉJÀ filtrée par le parent)
  imports: Array                     // Liste des imports (pour extraire les circonscriptions)
}
```

### 2. État interne

- `selectedCels`: CELs sélectionnées (peut être multiple)
- `selectedStatus`: Statut sélectionné
- `selectedCirconscription`: Circonscription sélectionnée
- `baseCelsFiltered`: **SIMPLIFIÉ** - Utilise directement `availableCels` (déjà filtré par le parent)
- `availableCirconscriptions`: Liste des circonscriptions disponibles (calculée dynamiquement)

### 3. Calculs dérivés

#### `filteredCels` (useMemo)
Filtre les CELs selon :
1. `baseCelsFiltered` (qui est `availableCels` - déjà filtré par rôle)
2. La circonscription sélectionnée (si une circonscription est choisie)

#### `availableCirconscriptions` (useState + useEffect)
Calcule la liste des circonscriptions disponibles :
- **Pour USER** : Uniquement les circonscriptions des imports de ses CELs attribuées
- **Pour ADMIN/SADMIN** : Toutes les circonscriptions des imports

## ⚠️ Problème résolu : Données vides au premier chargement

### Cause du problème

Au premier chargement, `availableCels` et `imports` sont vides car :

1. **Ordre d'exécution** :
   ```
   UploadPageContent se monte
   → user peut être null (chargement depuis AuthContext)
   → loadData() est appelé de manière asynchrone
   → ImportFilters se monte avec availableCels = [] et imports = []
   → Les données arrivent APRÈS le premier rendu
   ```

2. **Timing asynchrone** :
   - `loadData()` fait des appels API (asynchrone)
   - `allCels` et `imports` sont vides au premier rendu
   - `availableCels` est calculé dans un `useEffect` qui attend `allCels`
   - `ImportFilters` reçoit des tableaux vides au premier rendu

### Solution implémentée

1. **Dans UploadPageContent** :
   - Attente que `user` soit disponible avant d'appeler `loadData()`
   - `availableCels` est calculé dans un `useEffect` qui se déclenche quand `user` et `allCels` sont disponibles

2. **Dans ImportFilters** :
   - **SIMPLIFICATION** : Suppression de la double filtration
   - `availableCels` est déjà filtré par le parent selon le rôle
   - Utilisation directe de `availableCels` comme `baseCelsFiltered`
   - `availableCirconscriptions` est calculé dans un `useEffect` qui se déclenche quand `imports` change

## 🔧 Corrections apportées

### 1. Ordre de déclaration
- ✅ `user` est maintenant déclaré AVANT les `useEffect` qui l'utilisent
- ✅ Évite l'erreur "Variable used before declaration"

### 2. Simplification de la logique
- ✅ Suppression de la double filtration des CELs
- ✅ `baseCelsFiltered` = `availableCels` directement (déjà filtré par le parent)
- ✅ Réduction de la complexité et des recalculs inutiles

### 3. Gestion des dépendances
- ✅ Clés de dépendance stables (`userCelCodesKey`, `importsKey`)
- ✅ `useEffect` correctement configurés pour se déclencher au bon moment

## 📊 Flux de mise à jour

```
1. User se connecte
   ↓
2. AuthContext charge user (asynchrone)
   ↓
3. UploadPageContent attend user
   ↓
4. loadData() est appelé (asynchrone)
   ↓
5. allCels et imports sont chargés
   ↓
6. availableCels est calculé (useEffect dans UploadPageContent)
   ↓
7. ImportFilters reçoit availableCels et imports mis à jour
   ↓
8. availableCirconscriptions est calculé (useEffect dans ImportFilters)
   ↓
9. filteredCels est recalculé (useMemo dans ImportFilters)
   ↓
10. L'interface se met à jour automatiquement
```

## 🎨 Fonctionnalités

### Filtrage par circonscription
- Affiche uniquement les circonscriptions disponibles selon le rôle
- Filtre automatiquement les CELs quand une circonscription est sélectionnée
- Désélectionne automatiquement les CELs qui ne sont plus dans la circonscription

### Filtrage par CEL
- Multi-sélection possible
- Filtre dynamique selon la circonscription sélectionnée
- Messages informatifs selon le rôle de l'utilisateur

### Application des filtres
- Debounce de 300ms pour éviter les appels répétés
- Reset automatique à la page 1 lors du filtrage
- Callback `onFiltersChange` appelé avec les nouveaux filtres

## 🔍 Points d'attention

1. **Données vides au premier rendu** : C'est normal, les données se chargeront automatiquement
2. **Double filtration** : Évitée en utilisant directement `availableCels` (déjà filtré)
3. **Dépendances** : Les clés de dépendance (`userCelCodesKey`, `importsKey`) permettent de détecter les changements même si les références d'objets ne changent pas

