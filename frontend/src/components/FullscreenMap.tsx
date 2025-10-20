import { useEffect } from 'react';
import ZoomableGameCanvas from './ZoomableGameCanvas';
import type { MapZoneDefinition } from '../game/types';

export interface FullscreenMapProps {
  zone: MapZoneDefinition | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function FullscreenMap({ zone, isOpen, onClose }: FullscreenMapProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col"
      onClick={onClose}
    >
      <div
        className="flex-1 m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-nuaibria-surface border-2 border-nuaibria-gold/40 rounded-lg h-full flex flex-col overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-nuaibria-ember/30 via-nuaibria-gold/20 to-nuaibria-ember/30 px-6 py-4 border-b border-nuaibria-border flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-nuaibria-gold">
                {zone?.name || 'World Map'}
              </h2>
              <p className="text-sm text-nuaibria-text-muted mt-1">
                {zone?.size.width}×{zone?.size.height} tiles | Press ESC or click outside to close
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-nuaibria-danger/80 hover:bg-nuaibria-danger text-white rounded-lg transition-colors font-semibold"
            >
              ✕ Close
            </button>
          </div>
          <div className="flex-1 p-4" style={{ minHeight: 0 }}>
            {zone && (
              <ZoomableGameCanvas
                key={zone.id}
                initialZone={zone}
                onFullscreenToggle={onClose}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
