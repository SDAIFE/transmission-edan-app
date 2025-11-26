'use client';

interface UploadPageHeaderProps {
  title?: string;
  description?: string;
}

export function UploadPageHeader({ 
  title = "Import de fichiers Excel",
  description = "Importez des fichiers Excel contenant des données électorales"
}: UploadPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
