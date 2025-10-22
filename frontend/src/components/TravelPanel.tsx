import React, { useState } from 'react';
import { useTravelStatus } from '../hooks/useTravelStatus';

interface TravelPanelProps {
  characterId: string;
  onTravelModeChange?: (mode: 'smart' | 'active' | 'quiet') => void;
}

/**
 * TravelPanel - Displays active travel session with real-time updates
 *
 * Features:
 * - Header: Display destination name
 * - Progress bar: milesTraveled / milesTotal
 * - Danger indicator: Color-coded box (green=1, blue=2, amber=3, red=4, purple=5)
 * - Current encounter: Event description + choice buttons
 * - Event log: Scrolling history of events during travel
 * - Status: "In Progress", "Completed", etc.
 * - Travel mode selection: Smart / Active / Quiet
 */
export const TravelPanel: React.FC<TravelPanelProps> = ({ characterId, onTravelModeChange }) => {
  const {
    currentSession,
    events,
    currentEvent,
    loading,
    error,
    chooseOption,
    cancelTravel,
  } = useTravelStatus(characterId);

  const [selectedMode, setSelectedMode] = useState<'smart' | 'active' | 'quiet'>('smart');
  const [processingChoice, setProcessingChoice] = useState(false);

  // Handle travel mode change
  const handleModeChange = (mode: 'smart' | 'active' | 'quiet') => {
    setSelectedMode(mode);
    onTravelModeChange?.(mode);
  };

  // Handle choice selection
  const handleChoiceSelect = async (label: string) => {
    setProcessingChoice(true);
    try {
      await chooseOption(label);
    } catch (err) {
      console.error('[TravelPanel] Failed to process choice:', err);
    } finally {
      setProcessingChoice(false);
    }
  };

  // Handle cancel travel
  const handleCancelTravel = async () => {
    if (window.confirm('Are you sure you want to cancel your journey?')) {
      try {
        await cancelTravel();
      } catch (err) {
        console.error('[TravelPanel] Failed to cancel travel:', err);
      }
    }
  };

  // Danger level styling
  const getDangerLevelColor = (level: 1 | 2 | 3 | 4 | 5): string => {
    switch (level) {
      case 1:
        return 'danger-1'; // Green - Safe
      case 2:
        return 'danger-2'; // Blue - Minor danger
      case 3:
        return 'danger-3'; // Amber - Moderate danger
      case 4:
        return 'danger-4'; // Red - High danger
      case 5:
        return 'danger-5'; // Purple - Extreme danger
      default:
        return 'danger-1';
    }
  };

  const getDangerLevelText = (level: 1 | 2 | 3 | 4 | 5): string => {
    switch (level) {
      case 1:
        return 'Safe';
      case 2:
        return 'Minor Danger';
      case 3:
        return 'Moderate Danger';
      case 4:
        return 'High Danger';
      case 5:
        return 'Extreme Danger';
      default:
        return 'Unknown';
    }
  };

  // Format timestamp for display
  const formatTimestamp = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  // Calculate progress percentage
  const progressPercent = currentSession
    ? Math.min(100, (currentSession.milesTraveled / currentSession.milesTotal) * 100)
    : 0;

  // If no active session, show travel mode selector only
  if (!currentSession) {
    return (
      <div className="bg-nuaibria-surface border-2 border-nuaibria-gold/20 rounded-lg shadow-card-hover overflow-hidden">
        <div className="bg-gradient-to-r from-nuaibria-gold/20 via-nuaibria-ember/10 to-nuaibria-gold/20 px-4 py-3 border-b border-nuaibria-border">
          <h2 className="text-lg font-display font-bold text-nuaibria-gold">Travel</h2>
        </div>
        <div className="p-4">
          <p className="text-nuaibria-text-secondary text-sm mb-4">
            No active journey. Click a destination on the map to begin traveling.
          </p>

          {/* Travel Mode Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-nuaibria-text-primary mb-2">
              Travel Mode
            </label>
            <div className="space-y-2">
              {(['smart', 'active', 'quiet'] as const).map((mode) => (
                <label
                  key={mode}
                  className="flex items-center space-x-3 p-3 bg-nuaibria-bg rounded border border-nuaibria-border hover:border-nuaibria-gold/40 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="travelMode"
                    value={mode}
                    checked={selectedMode === mode}
                    onChange={() => handleModeChange(mode)}
                    className="w-4 h-4 text-nuaibria-gold focus:ring-nuaibria-gold focus:ring-offset-nuaibria-bg"
                  />
                  <div>
                    <div className="text-sm font-semibold text-nuaibria-text-primary capitalize">
                      {mode} Mode
                    </div>
                    <div className="text-xs text-nuaibria-text-muted">
                      {mode === 'smart' && 'AI handles most encounters automatically'}
                      {mode === 'active' && 'You make all decisions during travel'}
                      {mode === 'quiet' && 'Skip travel encounters entirely'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active travel session UI
  return (
    <div className="bg-nuaibria-surface border-2 border-nuaibria-ember/40 rounded-lg shadow-card-hover overflow-hidden animate-slide-in-right">
      {/* Header */}
      <div className="bg-gradient-to-r from-nuaibria-ember/30 via-nuaibria-gold/20 to-nuaibria-ember/30 px-4 py-3 border-b border-nuaibria-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-nuaibria-ember">
            Traveling to {currentSession.destinationName}
          </h2>
          <button
            onClick={handleCancelTravel}
            className="px-2 py-1 bg-nuaibria-danger/20 hover:bg-nuaibria-danger/30 text-nuaibria-danger text-xs font-semibold rounded transition-colors"
            title="Cancel Journey"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Error Display */}
        {error && (
          <div className="bg-nuaibria-danger/20 border border-nuaibria-danger/40 rounded p-3 text-sm text-nuaibria-danger">
            {error}
          </div>
        )}

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-nuaibria-text-secondary">Progress</span>
            <span className="text-xs font-mono text-nuaibria-text-accent">
              {currentSession.milesTraveled.toFixed(1)} / {currentSession.milesTotal.toFixed(1)} miles
            </span>
          </div>
          <div className="w-full bg-nuaibria-bg rounded-full h-3 shadow-inner-dark border border-nuaibria-border">
            <div
              className="bg-gradient-to-r from-nuaibria-ember to-nuaibria-gold h-3 rounded-full transition-all duration-500 shadow-glow"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Danger Level Indicator */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-nuaibria-text-secondary">Danger Level</span>
            <span className={`text-xs font-bold ${getDangerLevelColor(currentSession.dangerLevel)}`}>
              {getDangerLevelText(currentSession.dangerLevel)}
            </span>
          </div>
          <div className={`p-3 rounded border-2 ${getDangerLevelColor(currentSession.dangerLevel)} transition-all`}>
            <div className="text-center text-xs font-mono">
              Level {currentSession.dangerLevel} / 5
            </div>
          </div>
        </div>

        {/* Travel Status */}
        <div className="flex items-center justify-between p-3 bg-nuaibria-bg rounded border border-nuaibria-border">
          <span className="text-xs font-semibold text-nuaibria-text-secondary">Status</span>
          <span className={`text-xs font-bold capitalize ${
            currentSession.status === 'in_progress' ? 'text-nuaibria-ember' :
            currentSession.status === 'completed' ? 'text-nuaibria-health' :
            'text-nuaibria-text-muted'
          }`}>
            {currentSession.status.replace('_', ' ')}
          </span>
        </div>

        {/* Current Event */}
        {currentEvent && (
          <div className="space-y-3 animate-slide-in-right">
            <div className="border-t-2 border-nuaibria-border pt-3">
              <h3 className="text-sm font-semibold text-nuaibria-gold mb-2">Current Encounter</h3>
              <div className={`p-4 rounded border-2 ${getDangerLevelColor(currentEvent.dangerLevel)}`}>
                <p className="text-sm text-nuaibria-text-primary leading-relaxed">
                  {currentEvent.description}
                </p>
              </div>
            </div>

            {/* Choice Buttons */}
            {currentEvent.choices && currentEvent.choices.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-nuaibria-text-secondary">
                  Choose your action:
                </label>
                {currentEvent.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChoiceSelect(choice.label)}
                    disabled={processingChoice || loading}
                    className="w-full p-3 bg-nuaibria-bg hover:bg-nuaibria-gold/10 border border-nuaibria-border hover:border-nuaibria-gold/40 rounded text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-sm font-semibold text-nuaibria-text-primary">
                      {choice.label}
                    </div>
                    {choice.description && (
                      <div className="text-xs text-nuaibria-text-muted mt-1">
                        {choice.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Event Log */}
        {events.length > 0 && (
          <div className="border-t-2 border-nuaibria-border pt-3">
            <h3 className="text-sm font-semibold text-nuaibria-gold mb-2">Event Log</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="p-3 bg-nuaibria-bg rounded border border-nuaibria-border text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-nuaibria-text-muted">
                      {formatTimestamp(event.timestamp)}
                    </span>
                    <span className={`text-xs font-bold ${getDangerLevelColor(event.dangerLevel)}`}>
                      Lvl {event.dangerLevel}
                    </span>
                  </div>
                  <p className="text-nuaibria-text-secondary leading-relaxed">
                    {event.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && !processingChoice && (
          <div className="text-center py-2">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-nuaibria-gold" />
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelPanel;
