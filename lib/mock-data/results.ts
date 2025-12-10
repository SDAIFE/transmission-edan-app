// Types et utilitaires pour les résultats électoraux
// Ce fichier ne contient plus de données mock - utilisez les APIs réelles

import type {
  Candidate,
  // ElectionResults, // ❌ NON UTILISÉ
  // Region, // ❌ NON UTILISÉ
  // Departement, // ❌ NON UTILISÉ (était Department avec erreur)
  // LieuVote, // ❌ NON UTILISÉ
  BureauVote,
  VoteResult,
} from "@/types/results";

// Fonction utilitaire pour calculer les totaux d'un ensemble de bureaux
export const calculateTotals = (bureaux: BureauVote[]) => {
  const totals = bureaux.reduce((acc, bureau) => ({
    inscrits: acc.inscrits + bureau.inscrits,
    inscritsHommes: acc.inscritsHommes + bureau.inscritsHommes,
    inscritsFemmes: acc.inscritsFemmes + bureau.inscritsFemmes,
    votants: acc.votants + bureau.votants,
    votantsHommes: acc.votantsHommes + bureau.votantsHommes,
    votantsFemmes: acc.votantsFemmes + bureau.votantsFemmes,
    exprimes: acc.exprimes + bureau.exprimes,
    blancs: acc.blancs + bureau.blancs,
    nuls: acc.nuls + bureau.nuls,
  }), {
    inscrits: 0,
    inscritsHommes: 0,
    inscritsFemmes: 0,
    votants: 0,
    votantsHommes: 0,
    votantsFemmes: 0,
    exprimes: 0,
    blancs: 0,
    nuls: 0,
  });

  const tauxParticipation =
    totals.inscrits > 0
      ? Number(((totals.votants / totals.inscrits) * 100).toFixed(2))
      : 0;

  // Agréger les résultats par candidat
  const candidateVotes = new Map<string, number>();
  bureaux.forEach(bureau => {
    bureau.results.forEach(result => {
      candidateVotes.set(
        result.candidateId,
        (candidateVotes.get(result.candidateId) || 0) + result.votes
      );
    });
  });

  const results: VoteResult[] = Array.from(candidateVotes.entries()).map(
    ([candidateId, votes]) => ({
      candidateId,
      votes,
      percentage:
        totals.exprimes > 0
          ? Number(((votes / totals.exprimes) * 100).toFixed(2))
          : 0,
    })
  );

  return { ...totals, tauxParticipation, results };
};

// Fonction utilitaire pour générer des résultats (utilisée par les APIs)
export const generateResults = (inscrits: number, tauxParticipation: number): {
  votants: number;
  votantsHommes: number;
  votantsFemmes: number;
  exprimes: number;
  blancs: number;
  nuls: number;
  results: VoteResult[];
} => {
  const votants = Math.floor((inscrits * tauxParticipation) / 100);

  // Valeurs fixes basées sur l'ID pour éviter Math.random()
  const seed = inscrits + tauxParticipation;
  const blancs = Math.floor(votants * (0.02 + (seed % 20) / 1000)); // 2-4% de blancs
  const nuls = Math.floor(votants * (0.01 + (seed % 15) / 1000)); // 1-2.5% de nuls
  const exprimes = votants - blancs - nuls;

  // Répartition par genre (environ 52% femmes, 48% hommes)
  const votantsHommes = Math.floor(votants * (0.48 + (seed % 10) / 1000));
  const votantsFemmes = votants - votantsHommes;

  // Pour les résultats, vous devrez passer les candidats en paramètre
  // Cette fonction est maintenant générique
  const results: VoteResult[] = []; // À remplir par l'API

  return {
    votants,
    votantsHommes,
    votantsFemmes,
    exprimes,
    blancs,
    nuls,
    results,
  };
};

// Fonction utilitaire pour générer des bureaux de vote (utilisée par les APIs)
export const generateBureaux = (lieuId: string, count: number, candidates: Candidate[]): BureauVote[] => {
  return Array.from({ length: count }, (_, i) => {
    // Valeurs fixes basées sur l'ID du lieu et l'index
    const seed = lieuId.charCodeAt(0) + i;
    const inscrits = Math.floor((seed % 400) + 100); // 100-500 inscrits
    const tauxParticipation = (seed % 30) + 60; // 60-90% participation

    // Répartition par genre pour les inscrits (environ 52% femmes, 48% hommes)
    const inscritsHommes = Math.floor(inscrits * (0.48 + (seed % 10) / 1000));
    const inscritsFemmes = inscrits - inscritsHommes;

    const { votants, votantsHommes, votantsFemmes, exprimes, blancs, nuls } = generateResults(inscrits, tauxParticipation);

    // Générer les résultats pour chaque candidat
    const results: VoteResult[] = candidates.map((candidate, _index) => {
      const equalPercentage = 100 / candidates.length;
      const votes = Math.floor((exprimes * equalPercentage) / 100);
      return {
        candidateId: candidate.id,
        votes,
        percentage: equalPercentage,
      };
    });

    return {
      id: `bureau-${lieuId}-${i + 1}`,
      numero: `BV${String(i + 1).padStart(3, "0")}`,
      nom: `Bureau de vote ${i + 1}`,
      lieuVoteId: lieuId,
      inscrits,
      inscritsHommes,
      inscritsFemmes,
      votants,
      votantsHommes,
      votantsFemmes,
      exprimes,
      blancs,
      nuls,
      tauxParticipation: Number(tauxParticipation.toFixed(2)),
      results,
    };
  });
};