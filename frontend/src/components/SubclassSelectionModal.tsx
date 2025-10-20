/**
 * @file SubclassSelectionModal - Subclass selection UI for character progression
 *
 * Displays available subclasses when a character reaches the appropriate level
 * for their class. Shows features and allows selection.
 */

import { useState } from 'react';

// Icons
const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const LoadingSpinner = ({ className = '' }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Types
interface SubclassFeature {
  level: number;
  name: string;
  description: string;
}

interface Subclass {
  name: string;
  class: string;
  subclassFlavor: string;
  description: string;
  features: SubclassFeature[];
  spells?: Array<{
    level: number;
    spells: string[];
  }>;
}

interface SubclassSelectionModalProps {
  show: boolean;
  characterId: string;
  className: string;
  availableSubclasses: Subclass[];
  onComplete: () => void;
  onClose: () => void;
}

const SubclassSelectionModal = ({
  show,
  characterId,
  className,
  availableSubclasses,
  onComplete,
  onClose,
}: SubclassSelectionModalProps) => {
  const [expandedSubclass, setExpandedSubclass] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!show) return null;

  const handleSelectSubclass = async (subclass: Subclass) => {
    setLoading(true);
    setError(null);

    try {
      // Get auth token
      const token = localStorage.getItem('supabase.auth.token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // POST to backend API
      const response = await fetch(`/api/subclass/${characterId}/subclass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ subclassName: subclass.name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to select subclass');
      }

      const result = await response.json();
      console.log('[SubclassModal] Subclass selected:', result);

      // Call onComplete callback
      onComplete();
    } catch (err) {
      console.error('[SubclassModal] Error selecting subclass:', err);
      setError(err instanceof Error ? err.message : 'Failed to select subclass');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (subclassName: string) => {
    setExpandedSubclass(expandedSubclass === subclassName ? null : subclassName);
  };

  // Get first feature for preview (the one granted at selection)
  const getFirstFeature = (subclass: Subclass): SubclassFeature | undefined => {
    return subclass.features[0];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-nuaibria-surface via-nuaibria-bg to-nuaibria-surface border-4 border-nuaibria-gold rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-nuaibria-gold/20 to-nuaibria-arcane/20 border-b-2 border-nuaibria-gold/30 p-6">
          <h2 className="font-display text-3xl text-nuaibria-gold drop-shadow-glow mb-2 text-center">
            Choose Your {className} Path
          </h2>
          <p className="text-nuaibria-text-secondary text-center text-sm">
            Select a subclass to specialize your character
          </p>
        </div>

        {/* Error display */}
        {error && (
          <div className="mx-6 mt-6 bg-nuaibria-ember/20 border-2 border-nuaibria-ember rounded-lg p-4">
            <p className="text-nuaibria-ember font-semibold">{error}</p>
          </div>
        )}

        {/* Subclass list */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-4 custom-scrollbar">
          {availableSubclasses.map((subclass) => {
            const firstFeature = getFirstFeature(subclass);
            const isExpanded = expandedSubclass === subclass.name;

            return (
              <div
                key={subclass.name}
                className="bg-nuaibria-elevated border-2 border-nuaibria-border hover:border-nuaibria-gold/50 rounded-lg transition-all"
              >
                {/* Subclass header */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-display text-xl text-nuaibria-gold mb-1">
                        {subclass.name}
                      </h3>
                      <p className="text-nuaibria-text-accent text-sm italic">
                        {subclass.subclassFlavor}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleExpanded(subclass.name)}
                      className="text-nuaibria-gold hover:text-nuaibria-gold/80 transition-colors ml-4"
                      title="More info"
                    >
                      <InfoIcon />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-nuaibria-text-secondary text-sm leading-relaxed mb-4">
                    {subclass.description}
                  </p>

                  {/* First feature preview */}
                  {firstFeature && (
                    <div className="bg-nuaibria-bg/50 border border-nuaibria-gold/20 rounded-lg p-4 mb-4">
                      <h4 className="text-nuaibria-gold font-semibold mb-2">
                        Level {firstFeature.level}: {firstFeature.name}
                      </h4>
                      <p className="text-nuaibria-text-muted text-sm leading-relaxed">
                        {firstFeature.description}
                      </p>
                    </div>
                  )}

                  {/* Expanded features */}
                  {isExpanded && subclass.features.length > 1 && (
                    <div className="space-y-3 mb-4 animate-fade-in">
                      <h4 className="text-nuaibria-text-secondary font-semibold text-sm border-t border-nuaibria-border pt-3">
                        All Features:
                      </h4>
                      {subclass.features.slice(1).map((feature, idx) => (
                        <div
                          key={idx}
                          className="bg-nuaibria-bg/30 border border-nuaibria-border rounded-lg p-3"
                        >
                          <h5 className="text-nuaibria-text-primary font-semibold text-sm mb-1">
                            Level {feature.level}: {feature.name}
                          </h5>
                          <p className="text-nuaibria-text-muted text-xs leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Selection button */}
                  <button
                    onClick={() => handleSelectSubclass(subclass)}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-nuaibria-gold to-nuaibria-ember hover:from-nuaibria-gold/90 hover:to-nuaibria-ember/90 text-white font-bold py-3 px-6 rounded-lg transition-all hover:shadow-glow disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <LoadingSpinner className="w-5 h-5" />
                        Selecting...
                      </span>
                    ) : (
                      `Choose ${subclass.name}`
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-nuaibria-gold/30 p-4 bg-nuaibria-surface/50">
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full text-nuaibria-text-secondary hover:text-nuaibria-gold transition-colors font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubclassSelectionModal;
