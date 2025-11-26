'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UploadSection } from './upload-section';
import { Upload } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

export function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import de fichier Excel
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <UploadSection onUploadSuccess={onUploadSuccess} />
      </DialogContent>
    </Dialog>
  );
}
