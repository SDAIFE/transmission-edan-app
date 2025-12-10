"use client";

import { Badge } from "@/components/ui/badge";
import {
  Clock,
  // Loader2,
  CheckCircle,
  // AlertCircle,
  // HelpCircle, // ❌ NON UTILISÉ
} from "lucide-react";
// import { getStatusIcon, getStatusColor } from '@/lib/api/upload'; // ❌ NON UTILISÉ - TODO: check if this is needed
import { ImportStatus } from "@/types/upload";
// import type { ImportData } from "@/types/upload"; // ❌ NON UTILISÉ - ImportStatusDetails est commenté

interface ImportStatusBadgeProps {
  status: ImportStatus;
  showIcon?: boolean;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ImportStatusBadge({
  status,
  showIcon = true,
  showText = true,
  size = "md",
}: ImportStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case ImportStatus.N:
        return {
          label: "En attente",
          icon: <Clock className="h-3 w-3" />,
          variant: "secondary" as const,
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      case ImportStatus.I:
        return {
          label: "Importé",
          icon: <CheckCircle className="h-3 w-3" />,
          variant: "default" as const,
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case ImportStatus.P:
        return {
          label: "Publié",
          icon: <CheckCircle className="h-3 w-3" />,
          variant: "default" as const,
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
      default:
        return {
          label: "En attente",
          icon: <Clock className="h-3 w-3" />,
          variant: "secondary" as const,
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-2.5 py-1.5",
    lg: "text-base px-3 py-2",
  };

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${sizeClasses[size]} flex items-center gap-1`}
    >
      {showIcon && config.icon}
      {showText && config.label}
    </Badge>
  );
}

// ❌ COMPOSANT NON UTILISÉ - Commenté car les propriétés n'existent pas dans ImportData
// Composant pour afficher le statut avec des détails supplémentaires
// interface ImportStatusDetailsProps {
//   importData: ImportData;
//   showDetails?: boolean;
// }

// export function ImportStatusDetails({
//   importData,
//   showDetails = false,
// }: ImportStatusDetailsProps) {
//   // ❌ ERREUR: Ces propriétés n'existent pas dans ImportData
//   // const { statutImport, messageErreur, nombreLignesImportees, nombreLignesEnErreur } = importData;
//
//   return (
//     <div className="space-y-2">
//       {/* <ImportStatusBadge status={statutImport} /> */}
//
//       {/* {showDetails && (
//         <div className="text-xs text-muted-foreground space-y-1">
//           <div className="flex items-center gap-2">
//             <span>Lignes importées : {nombreLignesImportees}</span>
//             {nombreLignesEnErreur > 0 && (
//               <span className="text-red-600">
//                 ({nombreLignesEnErreur} erreurs)
//               </span>
//             )}
//           </div>
//
//           {messageErreur && (
//             <div className="text-red-600 bg-red-50 p-2 rounded text-xs">
//               {messageErreur}
//             </div>
//           )}
//         </div>
//       )} */}
//     </div>
//   );
// }
