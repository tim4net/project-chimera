/**
 * @file Level-Up Modal - Celebrates character progression
 *
 * Displays when character levels up with animation and fanfare.
 * Handles subclass selection when required.
 */

import { useEffect, useState } from 'react';
import SubclassSelectionModal from './SubclassSelectionModal';

interface SubclassFeature {
  level: number;
  name: string;
  description: string;
}

interface LevelUpModalProps {
  show: boolean;
  newLevel: number;
  hpGained: number;
  oldHP: number;
  newHP: number;
  proficiencyBonus: number;
  characterId?: string;
  className?: string;
  requiresSubclassSelection?: boolean;
  availableSubclasses?: any[];
  subclassFeatures?: SubclassFeature[];
  onClose: () => void;
}

const LevelUpModal = ({
  show,
  newLevel,
  hpGained,
  oldHP,
  newHP,
  proficiencyBonus,
  characterId,
  className,
  requiresSubclassSelection = false,
  availableSubclasses = [],
  subclassFeatures = [],
  onClose,
}: LevelUpModalProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSubclassModal, setShowSubclassModal] = useState(false);

  useEffect(() => {
    if (show) {
      setIsAnimating(true);

      // If subclass selection is required, show modal after level-up animation
      if (requiresSubclassSelection && characterId && className) {
        const timer = setTimeout(() => {
          setShowSubclassModal(true);
        }, 3000); // Show subclass modal after 3 seconds
        return () => clearTimeout(timer);
      } else {
        // Auto-close after 5 seconds if no subclass selection needed
        const timer = setTimeout(() => {
          onClose();
        }, 5000);
        return () => clearTimeout(timer);
      }
    } else {
      setIsAnimating(false);
    }
  }, [show, requiresSubclassSelection, characterId, className, onClose]);

  const handleSubclassComplete = () => {
    setShowSubclassModal(false);
    onClose();
  };

  const handleSubclassClose = () => {
    setShowSubclassModal(false);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className={`bg-gradient-to-br from-nuaibria-gold/30 via-nuaibria-ember/20 to-nuaibria-arcane/30 border-4 border-nuaibria-gold rounded-xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-500 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
      >
        {/* Title */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-2 animate-bounce">🎉</div>
          <h2 className="text-4xl font-display font-bold text-nuaibria-gold drop-shadow-glow mb-2">
            LEVEL UP!
          </h2>
          <div className="text-2xl font-bold text-nuaibria-ember">
            Level {newLevel}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4 mb-6">
          {/* HP Increase */}
          <div className="bg-nuaibria-surface/50 rounded-lg p-4 border border-nuaibria-health/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-nuaibria-text-secondary font-semibold">Hit Points</span>
              <span className="text-nuaibria-health font-bold text-xl">+{hpGained} HP</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-nuaibria-text-muted">{oldHP}</span>
              <span className="text-nuaibria-gold">→</span>
              <span className="text-nuaibria-health font-bold">{newHP}</span>
            </div>
          </div>

          {/* Proficiency Bonus */}
          <div className="bg-nuaibria-surface/50 rounded-lg p-4 border border-nuaibria-arcane/30">
            <div className="flex items-center justify-between">
              <span className="text-nuaibria-text-secondary font-semibold">Proficiency Bonus</span>
              <span className="text-nuaibria-arcane font-bold text-xl">+{proficiencyBonus}</span>
            </div>
          </div>

          {/* New subclass features */}
          {subclassFeatures && subclassFeatures.length > 0 && (
            <div className="bg-nuaibria-surface/50 rounded-lg p-4 border border-nuaibria-arcane/30">
              <div className="text-nuaibria-arcane font-bold text-lg mb-2">New Subclass Features!</div>
              <div className="space-y-2">
                {subclassFeatures.map((feature, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="text-nuaibria-gold font-semibold">{feature.name}</span>
                    <p className="text-nuaibria-text-muted text-xs mt-1">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Flavor text */}
          <div className="text-center text-nuaibria-text-accent italic text-sm">
            {requiresSubclassSelection
              ? "You stand at a crossroads in your journey. Choose your path wisely..."
              : "You feel your skills sharpening, your body growing stronger..."}
          </div>
        </div>

        {/* Close button */}
        {!requiresSubclassSelection && (
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-nuaibria-gold to-nuaibria-ember hover:from-nuaibria-gold/90 hover:to-nuaibria-ember/90 text-white font-bold py-3 px-6 rounded-lg transition-all hover:shadow-glow"
          >
            Continue Adventure
          </button>
        )}
        {requiresSubclassSelection && (
          <div className="text-center text-nuaibria-gold font-semibold animate-pulse">
            Preparing subclass selection...
          </div>
        )}
      </div>

      {/* Subclass Selection Modal */}
      {showSubclassModal && characterId && className && (
        <SubclassSelectionModal
          show={showSubclassModal}
          characterId={characterId}
          className={className}
          availableSubclasses={availableSubclasses}
          onComplete={handleSubclassComplete}
          onClose={handleSubclassClose}
        />
      )}
    </div>
  );
};

export default LevelUpModal;
