// Composants skeleton pour les statistiques
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonNumberProps {
  className?: string;
}

export function SkeletonNumber({ className = "h-6 w-16" }: SkeletonNumberProps) {
  return <Skeleton className={className} />;
}

interface SkeletonStatCardProps {
  label: string;
  showGenderStats?: boolean;
}

export function SkeletonStatCard({ label, showGenderStats = false }: SkeletonStatCardProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-700 mb-1">
            {label}
          </p>
          <p className="text-lg font-bold text-gray-800 mb-2">
            <SkeletonNumber className="h-6 w-20" />
          </p>
          
          {showGenderStats && (
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-orange-600">
                <span>Homme: </span>
                <SkeletonNumber className="h-3 w-12" />
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <span>Femme: </span>
                <SkeletonNumber className="h-3 w-12" />
              </div>
            </div>
          )}
        </div>
        <div className="p-2 rounded-lg bg-gray-100">
          <Skeleton className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

interface SkeletonCandidateCardProps {
  candidate: {
    id: string;
    fullName: string;
    numero: number;
    party: {
      sigle: string;
      color: string;
    };
  };
}

export function SkeletonCandidateCard({ candidate }: SkeletonCandidateCardProps) {
  return (
    <div className="flex items-center p-4 rounded-lg border-2 border-gray-200">
      <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{candidate.fullName}</h3>
          <span className="text-sm text-gray-600">#{candidate.numero}</span>
        </div>
        <div className="flex items-center mt-1">
          <div className="w-4 h-4 rounded mr-2 bg-gray-300"></div>
          <span className="text-sm text-gray-600">{candidate.party.sigle}</span>
        </div>
      </div>
      <div className="ml-4">
        <SkeletonNumber className="h-6 w-16" />
      </div>
    </div>
  );
}

interface SkeletonDepartmentsListProps {
  count?: number;
}

export function SkeletonDepartmentsList({ count = 5 }: SkeletonDepartmentsListProps) {
  return (
    <div className="flex items-center gap-4 text-white text-sm font-medium">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/20 whitespace-nowrap">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          <Skeleton className="h-4 w-16 bg-white/20" />
        </div>
      ))}
    </div>
  );
}
