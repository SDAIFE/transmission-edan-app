"use client";

import { useEffect, useState } from 'react';

interface InactivityWarningModalProps {
  open: boolean;
  onContinue: () => void;
  onLogout: () => void;
  timeRemaining: number;
}

/**
 * Modal d'avertissement d'inactivité
 */
export function InactivityWarningModal({
  open,
  onContinue,
  onLogout,
  timeRemaining,
}: InactivityWarningModalProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(Math.floor(timeRemaining / 1000));

  useEffect(() => {
    if (!open) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open, onLogout]);

  if (!open) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Session inactive</h2>
        <p className="text-gray-700 mb-4">
          Votre session va expirer dans{' '}
          <span className="font-semibold text-red-600">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>{' '}
          en raison de l&apos;inactivité.
        </p>
        <p className="text-gray-600 mb-6">
          Souhaitez-vous continuer votre session ?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onLogout}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Déconnexion
          </button>
          <button
            onClick={onContinue}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}

