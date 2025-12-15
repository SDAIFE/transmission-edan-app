# 📋 API - Circonscriptions Prêtes à Être Publiées

## 🎯 Vue d'ensemble

Cette API permet de récupérer la liste des circonscriptions dont **toutes les CELs ont été importées** mais qui **ne sont pas encore publiées**. Cette route est particulièrement utile pour identifier les circonscriptions qui peuvent être publiées immédiatement.

## 🔗 Endpoint

```
GET /api/v1/legislatives/upload/ready-to-publish
```

## 🔐 Authentification

- **Type** : Bearer Token (JWT)
- **Rôles autorisés** : `SADMIN`, `ADMIN`, `USER`
- **Header requis** : `Authorization: Bearer <token>`

## 📊 Filtrage par Rôle

### USER
- Retourne uniquement les circonscriptions **assignées à l'utilisateur**
- Si l'utilisateur n'a aucune circonscription assignée, retourne une liste vide

### ADMIN / SADMIN
- Retourne **toutes les circonscriptions** qui répondent aux critères

## ✅ Critères de Sélection

Une circonscription est incluse dans la réponse si :
1. ✅ **Toutes ses CELs ont au moins un import réussi** (`STATUT_IMPORT = 'SUCCESS'`)
2. ✅ **La circonscription n'est pas encore publiée** (`STAT_PUB != '1'`)
3. ✅ **La circonscription est accessible selon le rôle** (USER = assignées uniquement)

## 📥 Réponse

### Structure de la Réponse

```typescript
{
  "circonscriptions": [
    {
      "codeCirconscription": "004",
      "libelleCirconscription": "ANANGUIE, CECHI ET RUBINO",
      "totalCels": 10,
      "importedCels": 10,
      "pendingCels": 0,
      "lastImportDate": "2025-12-14T10:30:00Z"
    },
    {
      "codeCirconscription": "005",
      "libelleCirconscription": "AUTRE CIRCONSCRIPTION",
      "totalCels": 15,
      "importedCels": 15,
      "pendingCels": 0,
      "lastImportDate": "2025-12-14T09:15:00Z"
    }
  ],
  "total": 2
}
```

### Exemple de Réponse Réelle

```json
{
  "circonscriptions": [
    {
      "codeCirconscription": "004",
      "libelleCirconscription": "ANANGUIE, CECHI ET RUBINO",
      "totalCels": 10,
      "importedCels": 10,
      "pendingCels": 0,
      "lastImportDate": "2025-12-14T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

### Cas d'Erreur

#### 401 - Non Autorisé
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### 403 - Accès Interdit
```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

## 📝 Propriétés de la Réponse

### `circonscriptions` (Array)
Liste des circonscriptions prêtes à être publiées.

#### `codeCirconscription` (string)
- **Description** : Code unique de la circonscription (COD_CE)
- **Exemple** : `"004"`

#### `libelleCirconscription` (string | null)
- **Description** : Libellé/nom de la circonscription
- **Exemple** : `"ANANGUIE, CECHI ET RUBINO"`
- **Peut être null** si le libellé n'est pas défini

#### `totalCels` (number)
- **Description** : Nombre total de CELs dans la circonscription
- **Exemple** : `10`

#### `importedCels` (number)
- **Description** : Nombre de CELs ayant au moins un import réussi
- **Exemple** : `10`
- **Note** : Pour être dans cette liste, `importedCels` doit être égal à `totalCels`

#### `pendingCels` (number)
- **Description** : Nombre de CELs en attente d'import
- **Exemple** : `0`
- **Note** : Pour être dans cette liste, `pendingCels` doit être égal à `0`

#### `lastImportDate` (Date | null)
- **Description** : Date du dernier import réussi parmi toutes les CELs de la circonscription
- **Format** : ISO 8601 (UTC)
- **Exemple** : `"2025-12-14T10:30:00.000Z"`
- **Peut être null** si aucun import n'a de date

### `total` (number)
- **Description** : Nombre total de circonscriptions prêtes à être publiées
- **Exemple** : `5`

## 💡 Cas d'Usage Frontend

### 1. Affichage d'une Liste de Circonscriptions Prêtes à Publier

```typescript
// Exemple avec React/TypeScript
const fetchReadyToPublishCirconscriptions = async () => {
  try {
    const response = await fetch('/api/v1/legislatives/upload/ready-to-publish', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des circonscriptions');
    }

    const data: ReadyToPublishCirconscriptionsResponseDto = await response.json();
    
    console.log(`${data.total} circonscription(s) prête(s) à être publiée(s)`);
    return data.circonscriptions;
  } catch (error) {
    console.error('Erreur:', error);
    return [];
  }
};
```

### 2. Badge/Notification pour les Administrateurs

```typescript
// Afficher un badge avec le nombre de circonscriptions prêtes
const ReadyToPublishBadge = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchReadyToPublishCirconscriptions()
      .then(data => setCount(data.total))
      .catch(() => setCount(0));
  }, []);

  if (count === 0) return null;

  return (
    <Badge count={count}>
      <Button>Circonscriptions prêtes à publier</Button>
    </Badge>
  );
};
```

### 3. Tableau de Bord avec Actions Rapides

```typescript
// Afficher une liste avec bouton "Publier" pour chaque circonscription
const ReadyToPublishTable = () => {
  const [circonscriptions, setCirconscriptions] = useState([]);

  useEffect(() => {
    fetchReadyToPublishCirconscriptions()
      .then(setCirconscriptions);
  }, []);

  const handlePublish = async (codeCirconscription: string) => {
    // Appeler l'API de publication
    await publishCirconscription(codeCirconscription);
    // Rafraîchir la liste
    const updated = await fetchReadyToPublishCirconscriptions();
    setCirconscriptions(updated.circonscriptions);
  };

  return (
    <Table>
      <thead>
        <tr>
          <th>Code</th>
          <th>Libellé</th>
          <th>Total CELs</th>
          <th>Importées</th>
          <th>Dernier Import</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {circonscriptions.map(circ => (
          <tr key={circ.codeCirconscription}>
            <td>{circ.codeCirconscription}</td>
            <td>{circ.libelleCirconscription || 'N/A'}</td>
            <td>{circ.totalCels}</td>
            <td>{circ.importedCels}</td>
            <td>{circ.lastImportDate ? new Date(circ.lastImportDate).toLocaleString() : 'N/A'}</td>
            <td>
              <Button onClick={() => handlePublish(circ.codeCirconscription)}>
                Publier
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
```

### 4. Polling pour Mise à Jour en Temps Réel

```typescript
// Rafraîchir automatiquement la liste toutes les 30 secondes
const useReadyToPublishPolling = (interval = 30000) => {
  const [data, setData] = useState<ReadyToPublishCirconscriptionsResponseDto | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchReadyToPublishCirconscriptions();
        setData(result);
      } catch (error) {
        console.error('Erreur polling:', error);
      }
    };

    // Charger immédiatement
    fetchData();

    // Puis rafraîchir périodiquement
    const intervalId = setInterval(fetchData, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return data;
};
```

## 🔄 Relation avec l'API de Publication

Cette route est complémentaire à l'API de publication :

- **Cette route** : Identifie les circonscriptions **prêtes** à être publiées
- **API de publication** : `POST /api/v1/legislatives/publications/circonscriptions/:id/publish`

**Workflow recommandé** :
1. Utiliser cette route pour afficher les circonscriptions prêtes
2. Permettre à l'utilisateur de sélectionner une circonscription
3. Appeler l'API de publication pour publier la circonscription sélectionnée

## ⚠️ Notes Importantes

1. **Performance** : Cette route peut être coûteuse si beaucoup de circonscriptions et CELs existent. Considérez la mise en cache côté frontend.

2. **Données en Temps Réel** : Les données peuvent changer rapidement (nouveaux imports, publications). Considérez un polling ou WebSocket pour les mises à jour.

3. **Liste Vide** : Si `total === 0`, cela signifie soit :
   - Aucune circonscription ne répond aux critères
   - (Pour USER) Aucune circonscription assignée

4. **Validation** : Même si une circonscription apparaît dans cette liste, l'API de publication effectuera une validation supplémentaire avant de publier.

## 🔗 Routes Connexes

- `GET /api/v1/legislatives/upload/stats` - Statistiques générales des imports
- `GET /api/v1/legislatives/publications/circonscriptions` - Liste complète des circonscriptions avec statuts
- `POST /api/v1/legislatives/publications/circonscriptions/:id/publish` - Publier une circonscription

## 📚 TypeScript Types

Si vous utilisez TypeScript, vous pouvez définir les types suivants :

```typescript
interface ReadyToPublishCirconscription {
  codeCirconscription: string;
  libelleCirconscription: string | null;
  totalCels: number;
  importedCels: number;
  pendingCels: number;
  lastImportDate: Date | null;
}

interface ReadyToPublishCirconscriptionsResponse {
  circonscriptions: ReadyToPublishCirconscription[];
  total: number;
}
```

## 🐛 Dépannage

### La route retourne toujours une liste vide

**Vérifications** :
1. ✅ Vérifier que l'utilisateur a bien des circonscriptions assignées (pour USER)
2. ✅ Vérifier que les CELs ont bien des imports avec `STATUT_IMPORT = 'SUCCESS'`
3. ✅ Vérifier que les circonscriptions ne sont pas déjà publiées (`STAT_PUB != '1'`)

### Erreur 401 Unauthorized

- Vérifier que le token JWT est valide et inclus dans le header `Authorization`
- Vérifier que le token n'a pas expiré

### Erreur 403 Forbidden

- Vérifier que l'utilisateur a bien l'un des rôles requis : `SADMIN`, `ADMIN`, ou `USER`
