'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, TableColumnsType } from 'antd';
import { 
  X, 
  Building2, 
  Loader2,
  Download,
  FileText,
  Search,
  Upload,
  XCircle,
  AlertTriangle,
  CheckCircle,
  Hash,
  MapPin
} from 'lucide-react';
import { publicationsApi } from '@/lib/api/publications';
import type { PublishableEntity } from '@/types/publications';
import { uploadClient } from '@/lib/api/client';
import { ensureValidToken } from '@/lib/utils/session-helper';
import { normalizeEntityCode } from '@/lib/utils/commune-code';

// Types pour les données agrégées
interface CelAggregatedData {
  codeCellule: string;
  libelleCellule: string;
  populationHommes: number;
  populationFemmes: number;
  populationTotale: number;
  personnesAstreintes: number;
  votantsHommes: number;
  votantsFemmes: number;
  totalVotants: number;
  tauxParticipation: number;
  bulletinsNuls: number;
  suffrageExprime: number;
  bulletinsBlancs: number;
  score1: number;
  score2: number;
  score3: number;
  score4: number;
  score5: number;
  nombreBureaux: number;
}

interface EntityAggregatedData {
  inscrits: number;
  votants: number;
  participation: number;
  nombreBureaux: number;
  cels: CelAggregatedData[];
}

interface EntityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: PublishableEntity | null;
  onPublish?: (entity: PublishableEntity) => Promise<void>;
  onCancel?: (entity: PublishableEntity) => Promise<void>;
  isUser?: boolean;
}

// Styles CSS pour le tableau
const tableStyles = `
  .entity-results-table .ant-table-thead > tr > th {
    background-color: #6FDD6F !important;
    border: 1px solid #d1d5db !important;
    font-weight: bold !important;
    text-align: center !important;
    padding: 8px 4px !important;
    font-size: 11px !important;
  }
  
  .entity-results-table .ant-table-thead > tr:first-child > th {
    background-color: #F49F60 !important;
    font-weight: bold !important;
  }
  
  .entity-results-table .ant-table-tbody > tr > td {
    border: 1px solid #d1d5db !important;
    padding: 6px 4px !important;
    font-size: 11px !important;
  }
  
  .entity-results-table .ant-table-tbody > tr:nth-child(even) > td {
    background-color: #f9fafb !important;
  }
  
  .entity-results-table .ant-table-tbody > tr:hover > td {
    background-color: #f3f4f6 !important;
  }
  
  .entity-results-table .ant-table-tbody > tr[data-row-key="TOTAL"] {
    background-color: #22c55e !important;
  }
  
  .entity-results-table .ant-table-tbody > tr[data-row-key="TOTAL"] > td {
    background-color: #22c55e !important;
    color: white !important;
    font-weight: bold !important;
    border: 2px solid #16a34a !important;
  }
  
  .entity-results-table .ant-table-tbody > tr[data-row-key="TOTAL"]:hover > td {
    background-color: #16a34a !important;
  }
`;

export function EntityDetailsModal({ 
  isOpen, 
  onClose, 
  entity,
  onPublish,
  onCancel,
  isUser = false 
}: EntityDetailsModalProps) {
  const [entityAggregatedData, setEntityAggregatedData] = useState<EntityAggregatedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  
  // États pour les actions
  const [showPublishAlert, setShowPublishAlert] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });

  const loadEntityData = async () => {
    if (!entity) {
      console.warn('⚠️ [EntityDetailsModal] Pas d\'entity fournie');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // ✅ Normaliser le code (reconstruire si nécessaire pour les communes)
      const codeNormalise = normalizeEntityCode(entity);
      
      //Si developpement, afficher le code de l'entité
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 [EntityDetailsModal] Chargement des données pour:', {
          codeOriginal: entity.code,
          codeNormalise,
          type: entity.type,
          libelle: entity.libelle
        });
      }
      
      // Charger les données (getDepartmentData gère aussi les communes)
      const data = await publicationsApi.getDepartmentData(codeNormalise);
      if (process.env.NODE_ENV === 'development') {
        console.log('📥 [EntityDetailsModal] Données reçues:', data);
      }
      
      // ✅ CORRECTION : Support des communes (entities) et départements (departments)
      const entityData = data?.entities?.[0] || data?.departments?.[0];
      
      if (entityData) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [EntityDetailsModal] Données chargées:', {
            type: data?.entities ? 'entities (commune)' : 'departments',
            data: entityData
          });
        }
        setEntityAggregatedData(entityData);
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ [EntityDetailsModal] Aucune donnée trouvée dans la réponse:', data);
        }
        setError('Aucune donnée trouvée pour cette entité');
      }
    } catch (err: any) {
      console.error('❌ [EntityDetailsModal] Erreur lors du chargement:', err);
      console.error('❌ [EntityDetailsModal] Détails de l\'erreur:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    //en developpement
    if (process.env.NODE_ENV === 'development') {
    console.log('🔄 [EntityDetailsModal] useEffect déclenché:', { 
      isOpen, 
      hasEntity: !!entity,
      entityCode: entity?.code,
      entityLibelle: entity?.libelle 
    });
  }
    if (isOpen && entity) {
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [EntityDetailsModal] Conditions remplies, chargement des données...');
      }
      loadEntityData();
    } else {
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ [EntityDetailsModal] Conditions non remplies:', { 
          isOpen, 
          hasEntity: !!entity 
        });
      }
    }
  }, [isOpen, entity]);

  // Injecter les styles CSS
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = tableStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const formatNumber = (value: string | number): string => {
    const num = typeof value === 'string' ? parseInt(value) || 0 : value;
    return num.toLocaleString('fr-FR');
  };

  const formatPercentage = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) || 0 : value;
    return `${num.toFixed(2)}%`;
  };

  // Adaptation des termes selon le rôle
  const publishAction = isUser ? 'Consolider' : 'Publier';
  const publishActionLower = isUser ? 'consolider' : 'publier';
  const publishActionPast = isUser ? 'consolidé' : 'publié';
  const publishActionGerund = isUser ? 'consolidation' : 'publication';

  // Vérifier si une entité peut être publiée
  const canPublishEntity = () => {
    // Utiliser entityAggregatedData si disponible (données chargées depuis l'API), sinon entity (props)
    const dataSource = entityAggregatedData || entity;
    
    if (!dataSource) {
      return false;
    }
    
    // Vérifier le statut de publication (utiliser entity pour le statut car il peut être plus à jour)
    const publicationStatus = entity?.publicationStatus || (dataSource as any).publicationStatus;
    if (publicationStatus === 'PUBLISHED') {
      return false;
    }
    
    // ✅ EXCEPTION : Pour le département 999 (DIASPORA), permettre la publication si 18 CELs sont importées
    // (car 2 CELs n'ont pas de résultats)
    // Utiliser codeDepartement depuis entityAggregatedData ou code depuis entity
    const codeDept = (dataSource as any).codeDepartement || entity?.code || '';
    const codeEntity = String(codeDept).trim();
    const isDepartment = entity?.type === 'DEPARTMENT' || !entity?.type; // Si pas de type, considérer comme département
    const isDiaspora = isDepartment && (codeEntity === '999' || codeEntity === '999.0' || parseInt(codeEntity) === 999);
    
    if (isDiaspora) {
      // Utiliser importedCels depuis entityAggregatedData ou entity
      const importedCels = (dataSource as any).importedCels ?? entity?.importedCels ?? 0;
      const canPublish = importedCels >= 18;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [EntityDetailsModal] Département 999 (DIASPORA):', {
          codeEntity,
          codeDepartement: (dataSource as any).codeDepartement,
          entityCode: entity?.code,
          type: entity?.type,
          importedCels,
          pendingCels: (dataSource as any).pendingCels ?? entity?.pendingCels,
          totalCels: (dataSource as any).totalCels ?? entity?.totalCels,
          usingAggregatedData: !!entityAggregatedData,
          canPublish
        });
      }
      return canPublish;
    }
    
    // Pour les autres entités, exiger que toutes les CELs soient importées
    const pendingCels = (dataSource as any).pendingCels ?? entity?.pendingCels ?? 0;
    return pendingCels === 0;
  };

  // Vérifier si l'importation de fichier consolidé est disponible
  const canImportConsolidatedFile = () => {
    return entity && entity.pendingCels === 0;
  };

  // Gestion des actions
  const handlePublishClick = () => setShowPublishAlert(true);
  const handleCancelClick = () => setShowCancelAlert(true);
  const handleUploadClick = () => {
    setShowUploadDialog(true);
    setUploadMessage({ type: null, text: '' });
    setSelectedFile(null);
  };

  const handleCloseUploadDialog = () => {
    setShowUploadDialog(false);
    setUploadMessage({ type: null, text: '' });
    setSelectedFile(null);
  };

  const confirmPublish = async () => {
    if (entity && onPublish) {
      await onPublish(entity);
      setShowPublishAlert(false);
      onClose();
    }
  };

  const confirmCancel = async () => {
    if (entity && onCancel) {
      await onCancel(entity);
      setShowCancelAlert(false);
      onClose();
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !entity || uploadLoading) return;

    try {
      setUploadLoading(true);
      setUploadMessage({ type: null, text: '' });

      // ✅ SÉCURITÉ : Vérification proactive du token avant l'upload
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 [EntityDetailsModal] Vérification du token avant upload...');
      }
      const tokenStatus = await ensureValidToken();
      
      if (!tokenStatus.isValid || tokenStatus.needsLogin) {
        console.warn('⚠️ [EntityDetailsModal] Token invalide, redirection vers login');
        toast.error('Session expirée', {
          description: tokenStatus.message || 'Votre session a expiré. Veuillez vous reconnecter.',
        });
        
        // Redirection après un court délai
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 1500);
        return;
      }

      console.log('✅ [EntityDetailsModal] Token valide, envoi du fichier au backend');
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Le backend semble attendre seulement le fichier et une référence
      // La référence pourrait être l'ID de l'entité
      formData.append('reference', entity.id);

      // ✅ SÉCURITÉ : Upload direct au backend via uploadClient
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.log('📤 [EntityDetailsModal] Envoi au backend:', {
          endpoint: '/upload/consolidation',
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          reference: entity.id,
          entityType: entity.type,
        });
      }
      const response = await uploadClient.post('/upload/consolidation', formData);
      
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [EntityDetailsModal] Fichier uploadé avec succès:', response.data);
      }
      
      setUploadMessage({ 
        type: 'success', 
        text: `Fichier "${selectedFile.name}" uploadé avec succès pour ${entity.libelle}` 
      });

      toast.success('Fichier consolidé uploadé avec succès', {
        description: `Le fichier "${selectedFile.name}" a été uploadé pour ${entity.libelle}`,
        duration: 5000,
      });

      setTimeout(() => {
        setShowUploadDialog(false);
        setSelectedFile(null);
        setUploadMessage({ type: null, text: '' });
        onClose();
      }, 2000);
      
    } catch (error: any) {
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [EntityDetailsModal] Erreur lors de l\'upload:', error);
      }
      
      let errorMessage = 'Une erreur inattendue s\'est produite';
      
      // Gestion spécifique des erreurs
      if (error.response) {
        // Erreur serveur (4xx, 5xx)
        const status = error.response.status;
        const serverMessage = error.response.data?.message || error.response.data?.error;
        
        //en developpement
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ [EntityDetailsModal] Erreur serveur:', {
            status,
            message: serverMessage,
            data: error.response.data,
            fullResponse: error.response
          });
          
          // Log détaillé des erreurs de validation
          if (Array.isArray(serverMessage)) {
            console.error('❌ [EntityDetailsModal] Erreurs de validation détaillées:');
            serverMessage.forEach((error, index) => {
              console.error(`  ${index + 1}. ${error}`);
            });
          }
        }
        if (status === 400) {
          // Gestion spécifique des erreurs 400 (Bad Request)
          if (Array.isArray(serverMessage)) {
            errorMessage = serverMessage.join(', ');
          } else if (typeof serverMessage === 'string') {
            errorMessage = serverMessage;
          } else {
            errorMessage = 'Données invalides envoyées au serveur. Vérifiez les champs requis.';
          }
        } else if (status === 413) {
          errorMessage = 'Le fichier est trop volumineux (max 10MB)';
        } else if (status === 401) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 1500);
        } else if (status === 429) {
          errorMessage = 'Trop de requêtes. Veuillez réessayer dans quelques instants.';
        } else if (serverMessage) {
          errorMessage = serverMessage;
        } else {
          errorMessage = `Erreur serveur (${status})`;
        }
      } else if (error.request) {
        // Erreur réseau (pas de réponse)
        //en developpement
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ [EntityDetailsModal] Erreur réseau:', error.request);
        }
        errorMessage = 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
      } else if (error.message) {
        //en developpement
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ [EntityDetailsModal] Erreur message:', error.message);
        }
        errorMessage = error.message;
      }
      
      setUploadMessage({ 
        type: 'error', 
        text: `Erreur lors de l'upload: ${errorMessage}` 
      });

      toast.error('Erreur lors de l\'upload', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setUploadLoading(false);
    }
  };

  // Fonction pour calculer les totaux des CELs
  const calculateTotals = (data: CelAggregatedData[]): CelAggregatedData => {
    const totals = data.reduce((acc, item) => {
      acc.populationHommes += item.populationHommes || 0;
      acc.populationFemmes += item.populationFemmes || 0;
      acc.populationTotale += item.populationTotale || 0;
      acc.personnesAstreintes += item.personnesAstreintes || 0;
      acc.votantsHommes += item.votantsHommes || 0;
      acc.votantsFemmes += item.votantsFemmes || 0;
      acc.totalVotants += item.totalVotants || 0;
      acc.bulletinsNuls += item.bulletinsNuls || 0;
      acc.suffrageExprime += item.suffrageExprime || 0;
      acc.bulletinsBlancs += item.bulletinsBlancs || 0;
      acc.score1 += item.score1 || 0;
      acc.score2 += item.score2 || 0;
      acc.score3 += item.score3 || 0;
      acc.score4 += item.score4 || 0;
      acc.score5 += item.score5 || 0;
      acc.nombreBureaux += item.nombreBureaux || 0;
      
      return acc;
    }, {
      populationHommes: 0,
      populationFemmes: 0,
      populationTotale: 0,
      personnesAstreintes: 0,
      votantsHommes: 0,
      votantsFemmes: 0,
      totalVotants: 0,
      bulletinsNuls: 0,
      suffrageExprime: 0,
      bulletinsBlancs: 0,
      score1: 0,
      score2: 0,
      score3: 0,
      score4: 0,
      score5: 0,
      nombreBureaux: 0,
    });

    const tauxParticipation = totals.populationTotale > 0 
      ? ((totals.totalVotants / totals.populationTotale) * 100)
      : 0;

    return {
      codeCellule: 'TOTAL',
      libelleCellule: 'TOTAL GÉNÉRAL',
      ...totals,
      tauxParticipation,
    };
  };

  // Configuration des colonnes
  const columns: TableColumnsType<CelAggregatedData> = useMemo(() => [
    {
      title: 'ORD',
      dataIndex: 'codeCellule',
      key: 'codeCellule',
      width: 80,
      align: 'center',
      render: (value: string, record: CelAggregatedData) => (
        record.codeCellule === 'TOTAL' ? (
          <Badge variant="default" className="text-sm bg-green-600 font-bold">
            {value}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-sm">
            {value}
          </Badge>
        )
      ),
    },
    {
      title: 'COMMISSION LOCALE',
      dataIndex: 'libelleCellule',
      key: 'libelleCellule',
      width: 250,
      render: (value: string, record: CelAggregatedData) => (
        record.codeCellule === 'TOTAL' ? (
          <div className="font-bold text-sm text-white">
            {value}
          </div>
        ) : (
          <div className="font-medium text-sm">
            {value}
          </div>
        )
      ),
    },
    {
      title: 'NB BV',
      dataIndex: 'nombreBureaux',
      key: 'nombreBureaux',
      width: 80,
      align: 'center',
      render: (value: number, record: CelAggregatedData) => (
        record.codeCellule === 'TOTAL' ? (
          <Badge variant="default" className="text-sm bg-green-600 font-bold">
            {value}
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-sm">
            {value}
          </Badge>
        )
      ),
    },
    {
      title: 'POPULATION ELECTORALE',
      children: [
        {
          title: 'HOMMES',
          dataIndex: 'populationHommes',
          key: 'populationHommes',
          width: 100,
          align: 'center',
          render: (value: number, record: CelAggregatedData) => (
            <div className={`text-sm ${record.codeCellule === 'TOTAL' ? 'text-white font-bold' : ''}`}>
              {formatNumber(value)}
            </div>
          ),
        },
        {
          title: 'FEMMES',
          dataIndex: 'populationFemmes',
          key: 'populationFemmes',
          width: 100,
          align: 'center',
          render: (value: number, record: CelAggregatedData) => (
            <div className={`text-sm ${record.codeCellule === 'TOTAL' ? 'text-white font-bold' : ''}`}>
              {formatNumber(value)}
            </div>
          ),
        },
        {
          title: 'TOTAL',
          dataIndex: 'populationTotale',
          key: 'populationTotale',
          width: 100,
          align: 'center',
          render: (value: number, record: CelAggregatedData) => (
            <div className={`font-bold text-sm ${record.codeCellule === 'TOTAL' ? 'text-white' : ''}`}>
              {formatNumber(value)}
            </div>
          ),
        },
      ],
    },
    {
      title: 'PERS. ASTREINTE',
      dataIndex: 'personnesAstreintes',
      key: 'personnesAstreintes',
      width: 120,
      align: 'center',
      render: (value: number, record: CelAggregatedData) => (
        <div className={`text-sm ${record.codeCellule === 'TOTAL' ? 'text-white font-bold' : ''}`}>
          {formatNumber(value || 0)}
        </div>
      ),
    },
    {
      title: 'VOTANTS',
      children: [
        {
          title: 'HOMMES',
          dataIndex: 'votantsHommes',
          key: 'votantsHommes',
          width: 100,
          align: 'center',
          render: (value: number, record: CelAggregatedData) => (
            <div className={`text-sm ${record.codeCellule === 'TOTAL' ? 'text-white font-bold' : ''}`}>
              {formatNumber(value)}
            </div>
          ),
        },
        {
          title: 'FEMMES',
          dataIndex: 'votantsFemmes',
          key: 'votantsFemmes',
          width: 100,
          align: 'center',
          render: (value: number, record: CelAggregatedData) => (
            <div className={`text-sm ${record.codeCellule === 'TOTAL' ? 'text-white font-bold' : ''}`}>
              {formatNumber(value)}
            </div>
          ),
        },
        {
          title: 'TOTAL',
          dataIndex: 'totalVotants',
          key: 'totalVotants',
          width: 100,
          align: 'center',
          render: (value: number, record: CelAggregatedData) => (
            <div className={`font-bold text-sm ${record.codeCellule === 'TOTAL' ? 'text-white' : ''}`}>
              {formatNumber(value)}
            </div>
          ),
        },
      ],
    },
    {
      title: 'TAUX PARTICIPATION',
      dataIndex: 'tauxParticipation',
      key: 'tauxParticipation',
      width: 120,
      align: 'center',
      render: (value: number, record: CelAggregatedData) => (
        <div className={`text-sm font-medium ${record.codeCellule === 'TOTAL' ? 'text-white font-bold' : ''}`}>
          {formatPercentage(value)}
        </div>
      ),
    },
    {
      title: 'BULLETINS NULS',
      dataIndex: 'bulletinsNuls',
      key: 'bulletinsNuls',
      width: 100,
      align: 'center',
      render: (value: number, record: CelAggregatedData) => (
        <div className={`text-sm ${record.codeCellule === 'TOTAL' ? 'text-white font-bold' : ''}`}>
          {formatNumber(value)}
        </div>
      ),
    },
    {
      title: 'SUFFRAGES EXPRIMES',
      dataIndex: 'suffrageExprime',
      key: 'suffrageExprime',
      width: 120,
      align: 'center',
      render: (value: number, record: CelAggregatedData) => (
        <div className={`text-sm ${record.codeCellule === 'TOTAL' ? 'text-white font-bold' : ''}`}>
          <div className={`font-medium ${record.codeCellule === 'TOTAL' ? 'text-white' : ''}`}>
            {formatNumber(value)}
          </div>
          {record.codeCellule !== 'TOTAL' && record.bulletinsBlancs > 0 && (
            <div className="text-xs text-muted-foreground">
              Blancs: {formatNumber(record.bulletinsBlancs)}
            </div>
          )}
          {record.codeCellule !== 'TOTAL' && record.bulletinsNuls > 0 && (
            <div className="text-xs text-red-600">
              Nuls: {formatNumber(record.bulletinsNuls)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'BULLETINS BLANCS',
      dataIndex: 'bulletinsBlancs',
      key: 'bulletinsBlancs',
      width: 100,
      align: 'center',
      render: (value: number, record: CelAggregatedData) => (
        <div className={`text-sm ${record.codeCellule === 'TOTAL' ? 'text-white font-bold' : ''}`}>
          {formatNumber(value)}
        </div>
      ),
    },
    {
      title: 'RHDP',
      children: [
        {
          title: 'ALASSANE OUATTARA',
          dataIndex: 'score1',
          key: 'score1',
          width: 120,
          align: 'center',
          render: (value: number, record: CelAggregatedData) => (
            <div className={`text-sm font-medium ${record.codeCellule === 'TOTAL' ? 'text-white font-bold' : ''}`}>
              {value > 0 ? formatNumber(value) : '-'}
            </div>
          ),
        },
      ],
    },
    {
      title: 'MGC',
      children: [
        {
          title: 'EHIVET SIMONE épouse GBAGBO',
          dataIndex: 'score2',
          key: 'score2',
          width: 120,
          align: 'center',
          render: (value: number, record: CelAggregatedData) => (
            <div className={`text-sm font-medium ${record.codeCellule === 'TOTAL' ? 'text-white font-bold' : ''}`}>
              {value > 0 ? formatNumber(value) : '-'}
            </div>
          ),
        },
      ],
    },
    {
      title: 'GP-PAIX',
      children: [
        {
          title: 'LAGOU ADJOUA HENRIETTE',
          dataIndex: 'score3',
          key: 'score3',
          width: 120,
          align: 'center',
          render: (value: number, record: CelAggregatedData) => (
            <div className={`text-sm font-medium ${record.codeCellule === 'TOTAL' ? 'text-white font-bold' : ''}`}>
              {value > 0 ? formatNumber(value) : '-'}
            </div>
          ),
        },
      ],
    },
    {
      title: 'CODE',
      children: [
        {
          title: 'BILLON JEAN-LOUIS EUGENE',
          dataIndex: 'score4',
          key: 'score4',
          width: 120,
          align: 'center',
          render: (value: number, record: CelAggregatedData) => (
            <div className={`text-sm font-medium ${record.codeCellule === 'TOTAL' ? 'text-white font-bold' : ''}`}>
              {value > 0 ? formatNumber(value) : '-'}
            </div>
          ),
        },
      ],
    },
    {
      title: 'INDEPENDANT',
      children: [
        {
          title: 'DON-MELLO SENIN AHOUA JACOB',
          dataIndex: 'score5',
          key: 'score5',
          width: 120,
          align: 'center',
          render: (value: number, record: CelAggregatedData) => (
            <div className={`text-sm font-medium ${record.codeCellule === 'TOTAL' ? 'text-white font-bold' : ''}`}>
              {value > 0 ? formatNumber(value) : '-'}
            </div>
          ),
        },
      ],
    },
  ], []);

  // Données filtrées
  const filteredData = useMemo(() => {
    if (!entityAggregatedData?.cels) return [];
    
    let data = entityAggregatedData.cels;
    
    if (searchText) {
      data = data.filter(item => 
        item.codeCellule.toLowerCase().includes(searchText.toLowerCase()) ||
        item.libelleCellule.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    const totalsRow = calculateTotals(data);
    return [totalsRow, ...data];
  }, [entityAggregatedData?.cels, searchText]);

  if (!entity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-[95vw] h-[95vh] max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                {entity.type === 'DEPARTMENT' ? (
                  <Building2 className="h-6 w-6 text-green-600" />
                ) : (
                  <MapPin className="h-6 w-6 text-blue-600" />
                )}
                <span className="uppercase font-light">{entity.type === 'DEPARTMENT' ? 'Département' : 'Commune'} : </span>
                <span className="font-black text-green-600">{entity.libelle}</span>
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                <span className="inline-flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Hash className="h-4 w-4" />
                    Code: <span className="font-semibold text-green-600">{entity.code}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Statut: <span className="font-semibold text-green-600">{entity.publicationStatus}</span>
                  </span>
                </span>
              </DialogDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* Bouton fermer toujours visible */}
              <Button 
                variant="outline" 
                onClick={onClose} 
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Fermer
              </Button>
              
              {/* Autres boutons seulement si données chargées */}
              {entityAggregatedData && !loading && (
                <>
                  {(() => {
                    const canPublish = canPublishEntity();
                    const shouldShowButton = !isUser && canPublish && onPublish;
                    
                    if (process.env.NODE_ENV === 'development') {
                      console.log('🔍 [EntityDetailsModal] Conditions bouton Publier:', {
                        isUser,
                        canPublish,
                        hasOnPublish: !!onPublish,
                        hasEntityAggregatedData: !!entityAggregatedData,
                        shouldShowButton,
                        entity: entity ? {
                          code: entity.code,
                          type: entity.type,
                          status: entity.publicationStatus,
                          importedCels: entity.importedCels,
                          pendingCels: entity.pendingCels,
                          totalCels: entity.totalCels
                        } : null,
                        entityAggregatedData: entityAggregatedData ? {
                          codeDepartement: (entityAggregatedData as any).codeDepartement,
                          importedCels: (entityAggregatedData as any).importedCels,
                          pendingCels: (entityAggregatedData as any).pendingCels,
                          totalCels: (entityAggregatedData as any).totalCels
                        } : null
                      });
                    }
                    
                    return shouldShowButton;
                  })() && (
                    <Button 
                      onClick={handlePublishClick}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {publishAction}
                    </Button>
                  )}

                  {!isUser && entity?.publicationStatus === 'PUBLISHED' && onCancel && (
                    <Button 
                      onClick={handleCancelClick}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                  )}

                  {canImportConsolidatedFile() && (
                    <Button 
                      onClick={handleUploadClick}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUser ? 'Importer fichier signé' : 'Importer consolidation signée'}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2 overflow-y-auto h-full">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Chargement des données...</span>
            </div>
          )}

          {error && (
            <Card className="border-red-200 bg-red-50 m-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Erreur</span>
                </div>
                <p className="text-red-700 mt-2">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadEntityData}
                  className="mt-4"
                >
                  Réessayer
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Message de debug si pas de données */}
          {!loading && !error && !entityAggregatedData && (
            <Card className="border-yellow-200 bg-yellow-50 m-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Aucune donnée chargée</span>
                </div>
                <p className="text-yellow-700 mt-2">
                  Les données de l'entité n'ont pas été chargées. Vérifiez la console pour plus de détails.
                </p>
                <div className="mt-3 text-sm text-yellow-600">
                  <strong>Entité :</strong> {entity?.libelle} ({entity?.code})
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message d'alerte si des CELs sont en attente (même sans données chargées) */}
          {!loading && entity && entity.pendingCels > 0 && (
            <Card className="border-yellow-200 bg-yellow-50 m-6">
              <CardContent className="pt-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">
                      Chargement en cours
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      <strong>{entity.pendingCels}</strong> CEL{entity.pendingCels > 1 ? 's' : ''} en attente de chargement pour{' '}
                      <strong>{entity.type === 'DEPARTMENT' ? 'le département' : 'la commune'} {entity.libelle}</strong>.
                      Les options d'import et de publication seront disponibles une fois toutes les CELs chargées.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {entityAggregatedData && !loading && (
            <Card className="border-none shadow-none">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-base font-semibold text-gray-900">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Consolidation des résultats par CEL
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {entityAggregatedData.cels.length} CELs
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Rechercher..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="pl-10 w-56 h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <Table
                  columns={columns}
                  dataSource={filteredData}
                  rowKey="codeCellule"
                  scroll={{ x: 2500, y: 400 }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `${range[0]}-${range[1]} sur ${total} résultats`,
                  }}
                  size="small"
                  bordered
                  className="entity-results-table"
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t bg-gray-50 px-6 py-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Total des CELs:</span> {entityAggregatedData?.cels.length || 0} CELs
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} size="sm">
              <X className="h-4 w-4 mr-2" />
              Fermer
            </Button>
          </div>
        </div>

        {/* Alertes de confirmation */}
        <AlertDialog open={showPublishAlert} onOpenChange={setShowPublishAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Confirmer la {publishActionGerund}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir {publishActionLower} les résultats de{' '}
                <strong>{entity?.libelle}</strong> ?
                <br />
                <br />
                {isUser 
                  ? 'Cette action consolidera les résultats et ne pourra pas être annulée facilement.'
                  : 'Cette action rendra les résultats publics et ne pourra pas être annulée facilement.'
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmPublish}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirmer la {publishActionGerund}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Confirmer l&apos;annulation
              </AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir annuler la {publishActionGerund} des résultats de{' '}
                <strong>{entity?.libelle}</strong> ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmCancel}
                className="bg-red-600 hover:bg-red-700"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Confirmer l&apos;annulation
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog d'upload */}
        <AlertDialog open={showUploadDialog} onOpenChange={handleCloseUploadDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-purple-600" />
                {isUser ? 'Importer fichier consolidé signé' : 'Importer consolidation signée'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Téléchargez le fichier de consolidation signé pour {entity?.libelle}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              {uploadLoading && (
                <div className="flex items-center justify-center py-8 bg-blue-50 rounded-lg mb-4">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-blue-600 font-medium">Upload en cours...</p>
                  </div>
                </div>
              )}

              {uploadMessage.type && (
                <div className={`rounded-lg p-4 mb-4 ${
                  uploadMessage.type === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    {uploadMessage.type === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    )}
                    <p className={`text-sm font-medium ${
                      uploadMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {uploadMessage.text}
                    </p>
                  </div>
                </div>
              )}

              {!uploadLoading && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="consolidation-file"
                      disabled={uploadLoading}
                    />
                    <label
                      htmlFor="consolidation-file"
                      className={`cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                        uploadLoading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choisir un fichier
                    </label>
                    {selectedFile && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p><strong>Fichier sélectionné :</strong> {selectedFile.name}</p>
                        <p><strong>Taille :</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={uploadLoading} onClick={handleCloseUploadDialog}>
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleFileUpload}
                disabled={!selectedFile || uploadLoading}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                {uploadLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {uploadLoading ? 'Upload en cours...' : 'Uploader'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}

