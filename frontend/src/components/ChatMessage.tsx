import type { ChatMessage as ChatMessageType, ActionResult } from '../types';

interface ChatMessageProps {
  message: ChatMessageType & { actionResults?: ActionResult[] };
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isPlayer = message.role === 'player';

  const bubbleClasses = isPlayer
    ? 'bg-nuaibria-gold/20 self-end text-right'
    : 'bg-nuaibria-arcane/20 self-start text-left';

  const authorName = isPlayer ? 'You' : 'The Chronicler';
  const authorClasses = isPlayer ? 'text-nuaibria-gold' : 'text-nuaibria-arcane';

  return (
    <div className={`flex flex-col w-full max-w-[85%] animate-fade-in ${isPlayer ? 'items-end' : 'items-start'}`}>
      <div className={`rounded-lg p-3 shadow-md ${bubbleClasses}`}>
        <p className={`text-sm font-bold mb-1 ${authorClasses}`}>{authorName}</p>

        {/* Display action results (dice rolls, combat info) - only for DM messages */}
        {!isPlayer && message.actionResults && message.actionResults.length > 0 && (
          <div className="mb-3 space-y-2">
            {message.actionResults.map((result, idx) => (
              <div key={idx} className="bg-nuaibria-elevated/50 rounded p-2 border border-nuaibria-border text-xs space-y-1">
                {/* Dice rolls */}
                {result.rolls && Object.keys(result.rolls).length > 0 && (
                  <div className="space-y-1">
                    {(result.rolls as any).attack && (
                      <div className="flex items-center space-x-2">
                        <span className="text-nuaibria-mana">🎲</span>
                        <span className="text-nuaibria-text-secondary">
                          Attack: 1d20{(result.rolls as any).attack.modifier >= 0 ? '+' : ''}{(result.rolls as any).attack.modifier} =
                          <span className="font-bold text-nuaibria-gold ml-1">{(result.rolls as any).attack.total}</span>
                          {(result.rolls as any).attack.criticalHit && <span className="text-nuaibria-ember ml-1">💥 CRIT!</span>}
                          {(result.rolls as any).attack.criticalMiss && <span className="text-nuaibria-danger ml-1">💀 MISS!</span>}
                        </span>
                      </div>
                    )}
                    {(result.rolls as any).damage && (
                      <div className="flex items-center space-x-2">
                        <span className="text-nuaibria-health">⚔️</span>
                        <span className="text-nuaibria-text-secondary">
                          Damage: {(result.rolls as any).damage.dice}{(result.rolls as any).damage.modifier >= 0 ? '+' : ''}{(result.rolls as any).damage.modifier} =
                          <span className="font-bold text-nuaibria-ember ml-1">{(result.rolls as any).damage.total}</span>
                        </span>
                      </div>
                    )}
                    {(result.rolls as any).check && (
                      <div className="flex items-center space-x-2">
                        <span className="text-nuaibria-arcane">🎲</span>
                        <span className="text-nuaibria-text-secondary">
                          Check: 1d20{(result.rolls as any).check.modifier >= 0 ? '+' : ''}{(result.rolls as any).check.modifier} =
                          <span className={`font-bold ml-1 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                            {(result.rolls as any).check.total} {result.success ? '✓' : '✗'}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Enemy defeated */}
                {result.narrativeContext.enemyDefeated && (
                  <div className="flex items-center space-x-2 text-green-400 font-semibold">
                    <span>⚡</span>
                    <span>Enemy Defeated!</span>
                  </div>
                )}

                {/* Quest progress - check for travel success */}
                {result.outcome === 'success' && (
                  <div className="text-nuaibria-poison text-xs">
                    ✓ Action successful
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Narrative text */}
        <p className="text-nuaibria-text-primary whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
