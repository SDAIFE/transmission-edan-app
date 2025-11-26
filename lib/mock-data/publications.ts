// Données mockées pour la page Publications

import type { DepartmentData, DepartmentStats } from '@/types/publications';
import { PublicationStatus } from '@/types/publications';

// Statistiques mockées
export const mockStats: DepartmentStats = {
  totalDepartments: 12,
  publishedDepartments: 8,
  pendingDepartments: 4,
  totalCels: 156,
  importedCels: 142,
  pendingCels: 14,
  publicationRate: 66.7
};

// Départements mockés
export const mockDepartments: DepartmentData[] = [
  {
    id: 'dept-001',
    codeDepartement: 'ABJ',
    libelleDepartement: 'Abidjan',
    totalCels: 25,
    importedCels: 25,
    pendingCels: 0,
    publicationStatus: PublicationStatus.PUBLISHED,
    lastUpdate: '2025-01-15T10:30:00Z',
    cels: [
      { codeCellule: 'ABJ-001', libelleCellule: 'CEC ABIDJAN 01', statut: 'P', dateImport: '2025-01-15T09:00:00Z' },
      { codeCellule: 'ABJ-002', libelleCellule: 'CEC ABIDJAN 02', statut: 'P', dateImport: '2025-01-15T09:15:00Z' },
      { codeCellule: 'ABJ-003', libelleCellule: 'CEC ABIDJAN 03', statut: 'P', dateImport: '2025-01-15T09:30:00Z' },
    ]
  },
  {
    id: 'dept-002',
    codeDepartement: 'YAM',
    libelleDepartement: 'Yamoussoukro',
    totalCels: 18,
    importedCels: 15,
    pendingCels: 3,
    publicationStatus: PublicationStatus.PENDING,
    lastUpdate: '2025-01-15T11:00:00Z',
    cels: [
      { codeCellule: 'YAM-001', libelleCellule: 'CEC YAMOUSSOUKRO 01', statut: 'I', dateImport: '2025-01-15T10:00:00Z' },
      { codeCellule: 'YAM-002', libelleCellule: 'CEC YAMOUSSOUKRO 02', statut: 'I', dateImport: '2025-01-15T10:15:00Z' },
      { codeCellule: 'YAM-003', libelleCellule: 'CEC YAMOUSSOUKRO 03', statut: 'N' },
    ]
  },
  {
    id: 'dept-003',
    codeDepartement: 'BOU',
    libelleDepartement: 'Bouaké',
    totalCels: 22,
    importedCels: 20,
    pendingCels: 2,
    publicationStatus: PublicationStatus.PUBLISHED,
    lastUpdate: '2025-01-15T12:00:00Z',
    cels: [
      { codeCellule: 'BOU-001', libelleCellule: 'CEC BOUAKE 01', statut: 'P', dateImport: '2025-01-15T11:00:00Z' },
      { codeCellule: 'BOU-002', libelleCellule: 'CEC BOUAKE 02', statut: 'P', dateImport: '2025-01-15T11:15:00Z' },
      { codeCellule: 'BOU-003', libelleCellule: 'CEC BOUAKE 03', statut: 'I', dateImport: '2025-01-15T11:30:00Z' },
    ]
  },
  {
    id: 'dept-004',
    codeDepartement: 'DAL',
    libelleDepartement: 'Daloa',
    totalCels: 16,
    importedCels: 12,
    pendingCels: 4,
    publicationStatus: PublicationStatus.PENDING,
    lastUpdate: '2025-01-15T13:00:00Z',
    cels: [
      { codeCellule: 'DAL-001', libelleCellule: 'CEC DALOA 01', statut: 'I', dateImport: '2025-01-15T12:00:00Z' },
      { codeCellule: 'DAL-002', libelleCellule: 'CEC DALOA 02', statut: 'N' },
      { codeCellule: 'DAL-003', libelleCellule: 'CEC DALOA 03', statut: 'N' },
    ]
  },
  {
    id: 'dept-005',
    codeDepartement: 'KOR',
    libelleDepartement: 'Korhogo',
    totalCels: 20,
    importedCels: 18,
    pendingCels: 2,
    publicationStatus: PublicationStatus.CANCELLED,
    lastUpdate: '2025-01-15T14:00:00Z',
    cels: [
      { codeCellule: 'KOR-001', libelleCellule: 'CEC KORHOGO 01', statut: 'I', dateImport: '2025-01-15T13:00:00Z' },
      { codeCellule: 'KOR-002', libelleCellule: 'CEC KORHOGO 02', statut: 'I', dateImport: '2025-01-15T13:15:00Z' },
      { codeCellule: 'KOR-003', libelleCellule: 'CEC KORHOGO 03', statut: 'N' },
    ]
  },
  {
    id: 'dept-006',
    codeDepartement: 'MAN',
    libelleDepartement: 'Man',
    totalCels: 14,
    importedCels: 14,
    pendingCels: 0,
    publicationStatus: PublicationStatus.PUBLISHED,
    lastUpdate: '2025-01-15T15:00:00Z',
    cels: [
      { codeCellule: 'MAN-001', libelleCellule: 'CEC MAN 01', statut: 'P', dateImport: '2025-01-15T14:00:00Z' },
      { codeCellule: 'MAN-002', libelleCellule: 'CEC MAN 02', statut: 'P', dateImport: '2025-01-15T14:15:00Z' },
    ]
  },
  {
    id: 'dept-007',
    codeDepartement: 'GAG',
    libelleDepartement: 'Gagnoa',
    totalCels: 12,
    importedCels: 8,
    pendingCels: 4,
    publicationStatus: PublicationStatus.PENDING,
    lastUpdate: '2025-01-15T16:00:00Z',
    cels: [
      { codeCellule: 'GAG-001', libelleCellule: 'CEC GAGNOA 01', statut: 'I', dateImport: '2025-01-15T15:00:00Z' },
      { codeCellule: 'GAG-002', libelleCellule: 'CEC GAGNOA 02', statut: 'N' },
    ]
  },
  {
    id: 'dept-008',
    codeDepartement: 'SAN',
    libelleDepartement: 'San-Pédro',
    totalCels: 10,
    importedCels: 10,
    pendingCels: 0,
    publicationStatus: PublicationStatus.PUBLISHED,
    lastUpdate: '2025-01-15T17:00:00Z',
    cels: [
      { codeCellule: 'SAN-001', libelleCellule: 'CEC SAN-PEDRO 01', statut: 'P', dateImport: '2025-01-15T16:00:00Z' },
    ]
  }
];
