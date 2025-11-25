import { ReactNode } from 'react';

/**
 * Layout pour les routes protégées
 * 
 * TODO: Ajouter la protection de route et le layout complet
 */
export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}

