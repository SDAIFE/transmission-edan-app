# Typage et Exemples - Route GET /api/v1/legislatives/upload/cel/:codeCellule/data

## Route

```
GET /api/v1/legislatives/upload/cel/:codeCellule/data
```

## Typage TypeScript

```typescript
interface CelMetricsDto {
  inscrits: {
    total: number;
    hommes: number;
    femmes: number;
  };
  votants: {
    total: number;
    hommes: number;
    femmes: number;
  };
  tauxParticipation: number;
  suffrageExprime: number;
  bulletinsBlancs: number;
  bulletinsNuls: number;
}

interface CelDataItemDto {
  id: number;
  codeCellule: string;
  ordre: number;
  referenceLieuVote: string; // 12 chiffres
  libelleLieuVote: string;
  numeroBureauVote: string;
  populationHommes: number;
  populationFemmes: number;
  populationTotale: number;
  votantsHommes: number;
  votantsFemmes: number;
  totalVotants: number;
  tauxParticipation: number;
  bulletinsNuls: number;
  suffrageExprime: number;
  bulletinsBlancs: number;
  statutSuppressionBv?: string | null;
  
  // Scores des candidats/listes (dynamiques selon le nombre de sièges)
  // Pour siège unique : clés = "NOM PRENOM" (ex: "DUPONT Jean")
  // Pour sièges multiples : clés = INT_LST_DOS (ex: "Liste Union pour le Progrès")
  [key: string]: any;
}

interface CelDataResponseDto {
  codeCellule: string;
  libelleCellule: string;
  codeCirconscription: string;
  libelleCirconscription?: string | null;
  totalBureaux: number;
  data: CelDataItemDto[];
  metrics: CelMetricsDto;
}
```

---

## Exemple 1 : Circonscription avec Siège Unique (NB_SIEGE = 1)

Dans ce cas, les scores utilisent les **noms et prénoms des candidats titulaires** (NAT_CAND = 'T', RANG_CAND = 1) comme clés.

### Exemple de réponse

```json
{
  "codeCellule": "S003",
  "libelleCellule": "CESP CECHI",
  "codeCirconscription": "004",
  "libelleCirconscription": "ANANGUIE, CECHI ET RUBINO",
  "totalBureaux": 3,
  "data": [
    {
      "id": 123,
      "codeCellule": "S003",
      "ordre": 1,
      "referenceLieuVote": "001006098001",
      "libelleLieuVote": "EPP 1 CECHI",
      "numeroBureauVote": "01",
      "populationHommes": 198,
      "populationFemmes": 202,
      "populationTotale": 400,
      "votantsHommes": 50,
      "votantsFemmes": 50,
      "totalVotants": 100,
      "tauxParticipation": 25.0,
      "bulletinsNuls": 2,
      "suffrageExprime": 95,
      "bulletinsBlancs": 3,
      "statutSuppressionBv": "OK",
      "DUPONT Jean": 45,
      "MARTIN Marie": 30,
      "KOUASSI Koffi": 20
    },
    {
      "id": 124,
      "codeCellule": "S003",
      "ordre": 2,
      "referenceLieuVote": "001006098001",
      "libelleLieuVote": "EPP 1 CECHI",
      "numeroBureauVote": "02",
      "populationHommes": 150,
      "populationFemmes": 150,
      "populationTotale": 300,
      "votantsHommes": 40,
      "votantsFemmes": 40,
      "totalVotants": 80,
      "tauxParticipation": 26.67,
      "bulletinsNuls": 1,
      "suffrageExprime": 75,
      "bulletinsBlancs": 4,
      "statutSuppressionBv": "OK",
      "DUPONT Jean": 35,
      "MARTIN Marie": 25,
      "KOUASSI Koffi": 15
    },
    {
      "id": 125,
      "codeCellule": "S003",
      "ordre": 3,
      "referenceLieuVote": "001006098002",
      "libelleLieuVote": "EPP 2 CECHI",
      "numeroBureauVote": "01",
      "populationHommes": 100,
      "populationFemmes": 100,
      "populationTotale": 200,
      "votantsHommes": 30,
      "votantsFemmes": 30,
      "totalVotants": 60,
      "tauxParticipation": 30.0,
      "bulletinsNuls": 0,
      "suffrageExprime": 58,
      "bulletinsBlancs": 2,
      "statutSuppressionBv": null,
      "DUPONT Jean": 30,
      "MARTIN Marie": 20,
      "KOUASSI Koffi": 8
    }
  ],
  "metrics": {
    "inscrits": {
      "total": 900,
      "hommes": 448,
      "femmes": 452
    },
    "votants": {
      "total": 240,
      "hommes": 120,
      "femmes": 120
    },
    "tauxParticipation": 26.67,
    "suffrageExprime": 228,
    "bulletinsBlancs": 9,
    "bulletinsNuls": 3
  }
}
```

### Notes pour siège unique

- Les clés des scores sont au format `"NOM PRENOM"` (ex: `"DUPONT Jean"`)
- Seuls les candidats titulaires de rang 1 (NAT_CAND = 'T', RANG_CAND = 1) sont inclus
- Les noms sont construits depuis `TBL_CANDIDAT.NOM_CAND` et `TBL_CANDIDAT.PREN_CAND`

---

## Exemple 2 : Circonscription avec Sièges Multiples (NB_SIEGE > 1)

Dans ce cas, les scores utilisent les **intitulés de liste** (INT_LST_DOS) depuis `TBL_DOSSIER_CANDIDATURE` comme clés.

### Exemple de réponse

```json
{
  "codeCellule": "S010",
  "libelleCellule": "CESP AUTRE",
  "codeCirconscription": "005",
  "libelleCirconscription": "CIRCONSCRIPTION MULTI-SIEGES",
  "totalBureaux": 5,
  "data": [
    {
      "id": 200,
      "codeCellule": "S010",
      "ordre": 1,
      "referenceLieuVote": "001006098010",
      "libelleLieuVote": "EPP CENTRE",
      "numeroBureauVote": "01",
      "populationHommes": 250,
      "populationFemmes": 250,
      "populationTotale": 500,
      "votantsHommes": 150,
      "votantsFemmes": 150,
      "totalVotants": 300,
      "tauxParticipation": 60.0,
      "bulletinsNuls": 5,
      "suffrageExprime": 290,
      "bulletinsBlancs": 5,
      "statutSuppressionBv": "OK",
      "Liste Union pour le Progrès": 120,
      "Liste Alternative Démocratique": 100,
      "Liste Indépendante": 50,
      "Liste Nouvelle Vision": 20
    },
    {
      "id": 201,
      "codeCellule": "S010",
      "ordre": 2,
      "referenceLieuVote": "001006098010",
      "libelleLieuVote": "EPP CENTRE",
      "numeroBureauVote": "02",
      "populationHommes": 200,
      "populationFemmes": 200,
      "populationTotale": 400,
      "votantsHommes": 120,
      "votantsFemmes": 120,
      "totalVotants": 240,
      "tauxParticipation": 60.0,
      "bulletinsNuls": 3,
      "suffrageExprime": 235,
      "bulletinsBlancs": 2,
      "statutSuppressionBv": "OK",
      "Liste Union pour le Progrès": 100,
      "Liste Alternative Démocratique": 80,
      "Liste Indépendante": 40,
      "Liste Nouvelle Vision": 15
    },
    {
      "id": 202,
      "codeCellule": "S010",
      "ordre": 3,
      "referenceLieuVote": "001006098011",
      "libelleLieuVote": "COLLEGE MODERNE",
      "numeroBureauVote": "01",
      "populationHommes": 180,
      "populationFemmes": 220,
      "populationTotale": 400,
      "votantsHommes": 100,
      "votantsFemmes": 120,
      "totalVotants": 220,
      "tauxParticipation": 55.0,
      "bulletinsNuls": 2,
      "suffrageExprime": 215,
      "bulletinsBlancs": 3,
      "statutSuppressionBv": null,
      "Liste Union pour le Progrès": 90,
      "Liste Alternative Démocratique": 75,
      "Liste Indépendante": 35,
      "Liste Nouvelle Vision": 15
    },
    {
      "id": 203,
      "codeCellule": "S010",
      "ordre": 4,
      "referenceLieuVote": "001006098011",
      "libelleLieuVote": "COLLEGE MODERNE",
      "numeroBureauVote": "02",
      "populationHommes": 150,
      "populationFemmes": 150,
      "populationTotale": 300,
      "votantsHommes": 80,
      "votantsFemmes": 80,
      "totalVotants": 160,
      "tauxParticipation": 53.33,
      "bulletinsNuls": 1,
      "suffrageExprime": 157,
      "bulletinsBlancs": 2,
      "statutSuppressionBv": "OK",
      "Liste Union pour le Progrès": 65,
      "Liste Alternative Démocratique": 55,
      "Liste Indépendante": 25,
      "Liste Nouvelle Vision": 12
    },
    {
      "id": 204,
      "codeCellule": "S010",
      "ordre": 5,
      "referenceLieuVote": "001006098012",
      "libelleLieuVote": "LYCEE TECHNIQUE",
      "numeroBureauVote": "01",
      "populationHommes": 120,
      "populationFemmes": 130,
      "populationTotale": 250,
      "votantsHommes": 70,
      "votantsFemmes": 70,
      "totalVotants": 140,
      "tauxParticipation": 56.0,
      "bulletinsNuls": 1,
      "suffrageExprime": 137,
      "bulletinsBlancs": 2,
      "statutSuppressionBv": null,
      "Liste Union pour le Progrès": 55,
      "Liste Alternative Démocratique": 45,
      "Liste Indépendante": 25,
      "Liste Nouvelle Vision": 12
    }
  ],
  "metrics": {
    "inscrits": {
      "total": 1850,
      "hommes": 900,
      "femmes": 950
    },
    "votants": {
      "total": 1060,
      "hommes": 520,
      "femmes": 540
    },
    "tauxParticipation": 57.3,
    "suffrageExprime": 1034,
    "bulletinsBlancs": 14,
    "bulletinsNuls": 12
  }
}
```

### Notes pour sièges multiples

- Les clés des scores sont les **intitulés de liste** (INT_LST_DOS) depuis `TBL_DOSSIER_CANDIDATURE`
- Si `INT_LST_DOS` est null ou vide, le format `"Liste {NUM_DOS}"` est utilisé comme fallback
- Toutes les listes de la circonscription sont incluses

---

## Structure des données

### Champs fixes (toujours présents)

Tous les objets dans `data[]` contiennent toujours ces champs :

- `id` : ID du bureau de vote
- `codeCellule` : Code CEL
- `ordre` : Numéro d'ordre d'affichage
- `referenceLieuVote` : Référence du lieu de vote (12 chiffres)
- `libelleLieuVote` : Libellé du lieu de vote
- `numeroBureauVote` : Numéro du bureau de vote
- `populationHommes` : Population électorale hommes
- `populationFemmes` : Population électorale femmes
- `populationTotale` : Population électorale totale
- `votantsHommes` : Nombre de votants hommes
- `votantsFemmes` : Nombre de votants femmes
- `totalVotants` : Total des votants
- `tauxParticipation` : Taux de participation (pourcentage)
- `bulletinsNuls` : Nombre de bulletins nuls
- `suffrageExprime` : Suffrage exprimé
- `bulletinsBlancs` : Nombre de bulletins blancs
- `statutSuppressionBv` : Statut de suppression (OK, NOK, ou null)

### Champs dynamiques (scores)

Les scores sont ajoutés comme propriétés dynamiques avec des clés qui varient selon le nombre de sièges :

**Siège unique** :
```typescript
{
  "DUPONT Jean": 45,      // Nom + Prénom du candidat titulaire
  "MARTIN Marie": 30,
  "KOUASSI Koffi": 20
}
```

**Sièges multiples** :
```typescript
{
  "Liste Union pour le Progrès": 120,        // INT_LST_DOS
  "Liste Alternative Démocratique": 100,
  "Liste Indépendante": 50,
  "Liste Nouvelle Vision": 20
}
```

---

## Utilisation TypeScript

### Type complet

```typescript
type CelDataResponse = {
  codeCellule: string;
  libelleCellule: string;
  codeCirconscription: string;
  libelleCirconscription: string | null;
  totalBureaux: number;
  data: Array<{
    id: number;
    codeCellule: string;
    ordre: number;
    referenceLieuVote: string;
    libelleLieuVote: string;
    numeroBureauVote: string;
    populationHommes: number;
    populationFemmes: number;
    populationTotale: number;
    votantsHommes: number;
    votantsFemmes: number;
    totalVotants: number;
    tauxParticipation: number;
    bulletinsNuls: number;
    suffrageExprime: number;
    bulletinsBlancs: number;
    statutSuppressionBv?: string | null;
    // Scores dynamiques (selon siège unique ou multiple)
    [candidatOrListe: string]: number | string | null | undefined;
  }>;
  metrics: {
    inscrits: {
      total: number;
      hommes: number;
      femmes: number;
    };
    votants: {
      total: number;
      hommes: number;
      femmes: number;
    };
    tauxParticipation: number;
    suffrageExprime: number;
    bulletinsBlancs: number;
    bulletinsNuls: number;
  };
};
```

### Exemple d'utilisation

```typescript
// Récupération des données
const response = await fetch('/api/v1/legislatives/upload/cel/S003/data', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const data: CelDataResponse = await response.json();

// Accès aux données
console.log(`CEL: ${data.codeCellule} - ${data.libelleCellule}`);
console.log(`Circonscription: ${data.codeCirconscription} - ${data.libelleCirconscription}`);
console.log(`Total bureaux: ${data.totalBureaux}`);

// Parcourir les bureaux de vote
data.data.forEach((bureau) => {
  console.log(`Bureau ${bureau.numeroBureauVote}: ${bureau.totalVotants} votants`);
  
  // Accéder aux scores (clés dynamiques)
  // Pour siège unique : noms/prénoms
  // Pour sièges multiples : intitulés de liste
  Object.keys(bureau).forEach((key) => {
    // Ignorer les champs fixes
    if (!['id', 'codeCellule', 'ordre', 'referenceLieuVote', 'libelleLieuVote', 
          'numeroBureauVote', 'populationHommes', 'populationFemmes', 
          'populationTotale', 'votantsHommes', 'votantsFemmes', 'totalVotants',
          'tauxParticipation', 'bulletinsNuls', 'suffrageExprime', 
          'bulletinsBlancs', 'statutSuppressionBv'].includes(key)) {
      const score = bureau[key];
      if (typeof score === 'number') {
        console.log(`  ${key}: ${score} voix`);
      }
    }
  });
});

// Accéder aux métriques
console.log(`Taux de participation global: ${data.metrics.tauxParticipation}%`);
console.log(`Suffrage exprimé total: ${data.metrics.suffrageExprime}`);
```

### Détection du type (siège unique vs sièges multiples)

Pour déterminer si on est en présence d'un siège unique ou de sièges multiples, vous pouvez :

1. **Vérifier les clés des scores** :
   - Si les clés ressemblent à des noms/prénoms (ex: "DUPONT Jean"), c'est un siège unique
   - Si les clés ressemblent à des intitulés de liste (ex: "Liste Union pour le Progrès"), ce sont des sièges multiples

2. **Vérifier le format** :
   ```typescript
   const isSiegeUnique = data.data.length > 0 && 
     Object.keys(data.data[0]).some(key => 
       /^[A-Z]+\s+[A-Z]/.test(key) // Format "NOM PRENOM"
     );
   ```

---

## Notes importantes

1. **Clés dynamiques** : Les scores utilisent des clés dynamiques qui varient selon le nombre de sièges
2. **Ordre des bureaux** : Les bureaux sont triés par `COD_LV` (asc) puis `NUMERO_BV` (asc)
3. **Filtrage** : Seuls les bureaux avec des résultats importés sont retournés
4. **Métriques** : Les métriques sont calculées en agrégeant tous les bureaux de la CEL
5. **Permissions** : Pour USER, seules les CELs des circonscriptions assignées sont accessibles

