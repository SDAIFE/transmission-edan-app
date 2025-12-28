# 📊 Guide Frontend - Données d'Agrégation des Circonscriptions

## 🎯 Vue d'ensemble

Ce guide explique comment utiliser les **nouvelles données agrégées** (bulletins nuls, suffrages exprimés, bulletins blancs) retournées par l'endpoint de données agrégées d'une circonscription.

**Date de mise à jour** : 2025-12-26

---

## 🔗 Endpoint concerné

```
GET /api/v1/legislatives/publications/circonscriptions/:codeCirconscription/data
```

**Base URL** : `http://localhost:3001` (développement) ou votre URL de production

---

## 🔐 Authentification

L'endpoint nécessite une authentification JWT avec les rôles **SADMIN**, **ADMIN** ou **USER**.

### Headers requis

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Note** : Les utilisateurs avec le rôle **USER** ne peuvent accéder qu'aux circonscriptions qui leur sont assignées.

---

## 📥 Structure de la réponse

### Format de réponse complet

```typescript
interface CirconscriptionAggregatedResponse {
  codeCirconscription: string;
  libelleCirconscription: string | null;
  inscrits: number;
  votants: number;
  participation: number;
  nombreBureaux: number;
  // ⭐ NOUVEAUX CHAMPS
  bulletinsNuls: number; // Nombre total de bulletins nuls
  suffragesExprimes: number; // Nombre total de suffrages exprimés
  bulletinsBlancs: number; // Nombre total de bulletins blancs
  candidats: CandidatScore[];
  cels: CelAggregated[];
}

interface CandidatScore {
  numeroDossier: string;
  nom: string;
  parti: string;
  score: number;
  pourcentage: number;
}

interface CelAggregated {
  codeCel: string;
  libelleCel: string | null;
  inscrits: number;
  votants: number;
  participation: number;
  nombreBureaux: number;
  // ⭐ NOUVEAUX CHAMPS (également disponibles au niveau CEL)
  bulletinsNuls: number; // Nombre de bulletins nuls dans la CEL
  suffragesExprimes: number; // Nombre de suffrages exprimés dans la CEL
  bulletinsBlancs: number; // Nombre de bulletins blancs dans la CEL
  candidats: CandidatScore[];
}
```

### Exemple de réponse JSON

```json
{
  "codeCirconscription": "004",
  "libelleCirconscription": "ANANGUIE, CECHI ET RUBINO",
  "inscrits": 50000,
  "votants": 35000,
  "participation": 70.0,
  "nombreBureaux": 250,
  "bulletinsNuls": 500,
  "suffragesExprimes": 30000,
  "bulletinsBlancs": 4500,
  "candidats": [
    {
      "numeroDossier": "U-02108",
      "nom": "JEAN DUPONT",
      "parti": "PDCI",
      "score": 12500,
      "pourcentage": 41.67
    }
  ],
  "cels": [
    {
      "codeCel": "S003",
      "libelleCel": "CESP CECHI",
      "inscrits": 5000,
      "votants": 3500,
      "participation": 70.0,
      "nombreBureaux": 25,
      "bulletinsNuls": 50,
      "suffragesExprimes": 3200,
      "bulletinsBlancs": 250,
      "candidats": [
        {
          "numeroDossier": "U-02108",
          "nom": "JEAN DUPONT",
          "parti": "PDCI",
          "score": 1500,
          "pourcentage": 46.88
        }
      ]
    }
  ]
}
```

---

## ⚠️ Points importants

### 1. Compatibilité avec l'ancienne version

Les nouveaux champs (`bulletinsNuls`, `suffragesExprimes`, `bulletinsBlancs`) sont **toujours présents** dans la réponse. Si votre code frontend existant ne les utilise pas, il continuera de fonctionner normalement.

### 2. Validation des données

Il est recommandé de vérifier la cohérence des données :

```typescript
function validateBulletinsData(
  data: CirconscriptionAggregatedResponse
): boolean {
  const totalBulletins =
    data.bulletinsNuls + data.bulletinsBlancs + data.suffragesExprimes;

  // Le total devrait être proche du nombre de votants
  // (tolérance de 1% pour les arrondis)
  const tolerance = data.votants * 0.01;
  const difference = Math.abs(totalBulletins - data.votants);

  if (difference > tolerance) {
    console.warn("Incohérence détectée dans les données de bulletins");
    return false;
  }

  return true;
}
```

### 3. Gestion des valeurs nulles

Les valeurs peuvent être `0` mais jamais `null` ou `undefined`. Cependant, pour plus de sécurité :

```typescript
const bulletinsNuls = data.bulletinsNuls ?? 0;
const suffragesExprimes = data.suffragesExprimes ?? 0;
const bulletinsBlancs = data.bulletinsBlancs ?? 0;
```

### 4. Formatage des nombres

Utilisez `toLocaleString()` pour formater les grands nombres :

```typescript
const formatted = data.bulletinsNuls.toLocaleString("fr-FR"); // "1 500"
```

---

## 📚 Ressources supplémentaires

- **Documentation Swagger** : `http://localhost:3001/api-docs` (endpoint `/legislatives/publications/circonscriptions/{codeCirconscription}/data`)
- **Guide d'authentification** : `docs/GUIDE_AUTHENTIFICATION.md`
- **Guide des métriques** : `docs/GUIDE_METRIQUES_FRONTEND.md`

---

## 🔄 Migration depuis l'ancienne version

Si vous utilisez déjà cet endpoint, voici les étapes pour intégrer les nouveaux champs :

1. **Mettre à jour les types TypeScript** (si applicable)
2. **Ajouter les nouveaux champs dans vos composants d'affichage**
3. **Tester avec des données réelles**
4. **Déployer progressivement**

Aucun changement n'est requis pour que l'application continue de fonctionner, mais vous pouvez maintenant afficher des statistiques plus détaillées.

---

**Dernière mise à jour** : 2025-12-26
