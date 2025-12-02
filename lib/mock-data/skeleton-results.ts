/**
 * Données skeleton pour les résultats électoraux
 * 
 * Ce fichier contient une structure de données complète mais vide (valeurs à zéro)
 * utilisée pour le développement et les tests. Toutes les valeurs numériques sont
 * initialisées à 0 pour représenter un état "en attente de résultats".
 * 
 * Structure:
 * - Candidats avec leurs partis et résultats (tous à zéro)
 * - Totaux nationaux (inscrits, votants, exprimes, etc.)
 * - Statistiques de traitement des bureaux
 * - Hiérarchie géographique: Régions > Départements > Lieux de vote > Bureaux
 */
import type { ElectionResults } from '@/types/results';

// Données skeleton avec des valeurs neutres (toutes à zéro)
export const skeletonElectionResults: ElectionResults = {
  id: 'election-2025',
  nom: 'Élection Législatives 2025 - Premier Tour',
  date: '2025-10-25',
  type: 'legislative', // Corrigé: était 'presidential' mais le nom indique 'Législatives'
  tour: 1,
  status: 'preliminaires',
  lastUpdate: new Date().toISOString(),

  candidates: [
    {
      id: 'cand-skeleton-1',
      firstName: 'Candidat',
      lastName: '1',
      fullName: 'Candidat 1',
      numero: 1,
      photo: '/images/candidates/placeholder.jpg', // Image placeholder pour le skeleton
      party: {
        id: 'party-skeleton-1',
        name: 'Parti Politique 1',
        sigle: 'PP1',
        logo: '/images/candidates/logo-placeholder.jpg', // Logo placeholder pour le skeleton
        color: '#FF6B35'
      },
      results: {
        votes: 0,
        percentage: 0,
        rank: 1,
        isWinner: false,
        isTied: false
      },
      statistics: {
        totalExprimes: 0,
        voteShare: 0,
        trend: 'stable'
      }
    },
    {
      id: 'cand-skeleton-2',
      firstName: 'Candidat',
      lastName: '2',
      fullName: 'Candidat 2',
      numero: 2,
      photo: '/images/candidates/placeholder.jpg', // Image placeholder pour le skeleton
      party: {
        id: 'party-skeleton-2',
        name: 'Parti Politique 2',
        sigle: 'PP2',
        logo: '/images/candidates/logo-placeholder.png', // Logo placeholder pour le skeleton
        color: '#DC2626'
      },
      results: {
        votes: 0,
        percentage: 0,
        rank: 2,
        isWinner: false,
        isTied: false
      },
      statistics: {
        totalExprimes: 0,
        voteShare: 0,
        trend: 'stable'
      }
    },
    {
      id: 'cand-skeleton-3',
      firstName: 'Candidat',
      lastName: '3',
      fullName: 'Candidat 3',
      numero: 3,
      photo: '/images/candidates/placeholder.jpg', // Image placeholder pour le skeleton
      party: {
        id: 'party-skeleton-3',
        name: 'Parti Politique 3',
        sigle: 'PP3',
        logo: '/images/candidates/logo-placeholder.jpg', // Logo placeholder pour le skeleton
        color: '#1E40AF'
      },
      results: {
        votes: 0,
        percentage: 0,
        rank: 3,
        isWinner: false,
        isTied: false
      },
      statistics: {
        totalExprimes: 0,
        voteShare: 0,
        trend: 'stable'
      }
    }
  ],

  totals: {
    inscrits: 0,
    inscritsHommes: 0,
    inscritsFemmes: 0,
    votants: 0,
    votantsHommes: 0,
    votantsFemmes: 0,
    exprimes: 0,
    blancs: 0,
    nuls: 0,
    tauxParticipation: 0,
    results: [
      {
        candidateId: 'cand-skeleton-1',
        votes: 0,
        percentage: 0
      },
      {
        candidateId: 'cand-skeleton-2',
        votes: 0,
        percentage: 0
      },
      {
        candidateId: 'cand-skeleton-3',
        votes: 0,
        percentage: 0
      }
    ]
  },

  statistics: {
    bureauTraites: 0,
    bureauTotal: 0,
    pourcentageTraite: 0,
    tendances: [
      {
        candidateId: 'cand-skeleton-1',
        trend: 'stable',
        variation: 0
      },
      {
        candidateId: 'cand-skeleton-2',
        trend: 'stable',
        variation: 0
      },
      {
        candidateId: 'cand-skeleton-3',
        trend: 'stable',
        variation: 0
      }
    ]
  },

  regions: [
    {
      id: 'region-skeleton-1',
      nom: 'Région 1',
      departements: [
        {
          id: 'dept-skeleton-1',
          code: '01',
          nom: 'Département 1',
          regionId: 'region-skeleton-1',
          totals: {
            inscrits: 0,
            inscritsHommes: 0,
            inscritsFemmes: 0,
            votants: 0,
            votantsHommes: 0,
            votantsFemmes: 0,
            exprimes: 0,
            blancs: 0,
            nuls: 0,
            tauxParticipation: 0,
            results: []
          },
          lieuxVote: [
            {
              id: 'lieu-skeleton-1',
              nom: 'Lieu de vote 1',
              adresse: 'Adresse du lieu',
              departementId: 'dept-skeleton-1',
              totals: {
                inscrits: 0,
                inscritsHommes: 0,
                inscritsFemmes: 0,
                votants: 0,
                votantsHommes: 0,
                votantsFemmes: 0,
                exprimes: 0,
                blancs: 0,
                nuls: 0,
                tauxParticipation: 0,
                results: []
              },
              bureaux: [
                {
                  id: 'bureau-skeleton-1',
                  numero: 'BV001',
                  nom: 'Bureau de vote 1',
                  lieuVoteId: 'lieu-skeleton-1',
                  inscrits: 0,
                  inscritsHommes: 0,
                  inscritsFemmes: 0,
                  votants: 0,
                  votantsHommes: 0,
                  votantsFemmes: 0,
                  exprimes: 0,
                  blancs: 0,
                  nuls: 0,
                  tauxParticipation: 0,
                  results: []
                }
              ]
            }
          ]
        }
      ],
      totals: {
        inscrits: 0,
        inscritsHommes: 0,
        inscritsFemmes: 0,
        votants: 0,
        votantsHommes: 0,
        votantsFemmes: 0,
        exprimes: 0,
        blancs: 0,
        nuls: 0,
        tauxParticipation: 0,
        results: []
      }
    }
  ],

  departementsPublies: [
    'Département 1',
    'Département 2',
    'Département 3',
    'Département 4',
    'Département 5'
  ]
};
