/**
 * @file Tension Badge - Displays vague warnings about threats
 *
 * Shows atmospheric indicators without revealing mechanics
 */

import { useState, useEffect } from 'react';

interface TensionData {
  tension: {
    feeling: string;
    icon: string;
    color: string;
    hasWarning: boolean;
  };
  warning: string | null;
  reputation: string[];
}

interface TensionBadgeProps {
  characterId: string;
}

const TensionBadge = ({ characterId }: TensionBadgeProps) => {
  const [tensionData, setTensionData] = useState<TensionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTension = async () => {
      if (!characterId) return;

      try {
        // Get auth token from Supabase
        const { data: { session } } = await import('../lib/supabase').then(m => m.supabase.auth.getSession());

        if (!session) {
          console.warn('[TensionBadge] No session, skipping tension fetch');
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/tension/${characterId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tension data');
        }
        const data = await response.json();
        setTensionData(data);
      } catch (error) {
        console.error('Error fetching tension:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTension();

    // Refresh tension every 30 seconds
    const interval = setInterval(fetchTension, 30000);
    return () => clearInterval(interval);
  }, [characterId]);

  if (loading || !tensionData || !tensionData.tension.hasWarning) {
    return null; // Don't show anything if peaceful
  }

  const colorClasses: Record<string, string> = {
    yellow: 'bg-yellow-900/30 border-yellow-600 text-yellow-200',
    orange: 'bg-orange-900/30 border-orange-600 text-orange-200',
    red: 'bg-red-900/30 border-red-600 text-red-200',
    crimson: 'bg-red-900/50 border-red-500 text-red-100',
  };

  const colorClass = colorClasses[tensionData.tension.color] || colorClasses.yellow;

  return (
    <div className="space-y-2">
      {/* Tension warning */}
      {tensionData.warning && (
        <div className={`${colorClass} border-2 rounded-lg p-3 animate-pulse-slow`}>
          <div className="flex items-start space-x-2">
            <span className="text-2xl">{tensionData.tension.icon}</span>
            <div className="flex-1">
              <p className="font-semibold text-sm mb-1">{tensionData.tension.feeling}</p>
              <p className="text-xs leading-relaxed">{tensionData.warning}</p>
            </div>
          </div>
        </div>
      )}

      {/* Reputation */}
      {tensionData.reputation && tensionData.reputation.length > 0 && (
        <div className="bg-nuaibria-surface/50 border border-nuaibria-border rounded-lg p-3">
          <p className="text-xs font-semibold text-nuaibria-text-secondary mb-2">Reputation:</p>
          <ul className="space-y-1">
            {tensionData.reputation.map((rep, idx) => (
              <li key={idx} className="text-xs text-nuaibria-text-muted flex items-start space-x-1">
                <span className="text-nuaibria-gold">•</span>
                <span>{rep}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TensionBadge;
