/**
 * @file Welcome Page - Redesigned landing page
 *
 * Showcases the AI DM experience and what makes this game unique
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';

const WelcomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-nuaibria-bg via-nuaibria-surface to-nuaibria-bg font-body text-nuaibria-text-primary">
      {/* Animated background effects */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.15),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(139,92,246,0.1),_transparent_60%)]" />
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-nuaibria-ember/10 blur-3xl animate-pulse-slow" />
        <div className="absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-nuaibria-arcane/15 blur-3xl animate-pulse-slow" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 px-6 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          {/* Main headline */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-nuaibria-gold/30 bg-nuaibria-surface/50">
              <span className="text-sm uppercase tracking-wider text-nuaibria-gold">✨ Powered by AI</span>
            </div>

            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold text-nuaibria-gold drop-shadow-glow mb-6">
              Nuaibria
            </h1>

            <p className="text-2xl md:text-3xl text-nuaibria-text-accent font-semibold mb-4">
              Your AI Dungeon Master Awaits
            </p>

            <p className="text-lg text-nuaibria-text-secondary max-w-3xl mx-auto leading-relaxed">
              Talk to The Chronicler in natural language. Your choices shape the story.
              Dice rolls decide your fate. Dynamic consequences emerge from your words.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button
              onClick={() => navigate(user ? '/dashboard' : '/create-character')}
              className="group bg-gradient-to-r from-nuaibria-gold to-nuaibria-ember hover:from-nuaibria-gold/90 hover:to-nuaibria-ember/90 text-nuaibria-bg font-display font-bold text-xl px-12 py-4 rounded-full shadow-glow transition-all hover:scale-105 hover:shadow-glow-intense"
            >
              {user ? 'Enter Nuaibria' : 'Begin Your Journey'}
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </button>

            {!user && (
              <button
                onClick={() => navigate('/login')}
                className="border-2 border-nuaibria-gold/40 hover:border-nuaibria-gold text-nuaibria-gold font-semibold px-8 py-4 rounded-full transition-all hover:bg-nuaibria-gold/10"
              >
                I Have an Account
              </button>
            )}
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {/* Feature 1: AI DM */}
            <div className="bg-nuaibria-surface/80 border-2 border-nuaibria-arcane/30 rounded-2xl p-6 backdrop-blur hover:border-nuaibria-arcane transition-all">
              <div className="text-4xl mb-4">🎭</div>
              <h3 className="font-display text-xl text-nuaibria-arcane font-bold mb-3">
                Conversational AI DM
              </h3>
              <p className="text-nuaibria-text-secondary text-sm leading-relaxed">
                Type what you want to do in plain English. No buttons, no menus.
                "I sneak past the guards" or "I'm the king's son" - The Chronicler responds.
              </p>
            </div>

            {/* Feature 2: Real D&D */}
            <div className="bg-nuaibria-surface/80 border-2 border-nuaibria-ember/30 rounded-2xl p-6 backdrop-blur hover:border-nuaibria-ember transition-all">
              <div className="text-4xl mb-4">🎲</div>
              <h3 className="font-display text-xl text-nuaibria-ember font-bold mb-3">
                D&D 5e Mechanics
              </h3>
              <p className="text-nuaibria-text-secondary text-sm leading-relaxed">
                Real dice rolls. Skill checks. Combat calculations. See every 1d20+5 attack roll.
                Level up. Find loot. Complete quests. It's actual D&D.
              </p>
            </div>

            {/* Feature 3: Consequences */}
            <div className="bg-nuaibria-surface/80 border-2 border-nuaibria-gold/30 rounded-2xl p-6 backdrop-blur hover:border-nuaibria-gold transition-all">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-display text-xl text-nuaibria-gold font-bold mb-3">
                Dynamic Consequences
              </h3>
              <p className="text-nuaibria-text-secondary text-sm leading-relaxed">
                Claim you're royalty? Face kidnapping attempts. Build reputation.
                Your words create story arcs. One choice = hours of emergent gameplay.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-nuaibria-surface/60 border-2 border-nuaibria-gold/20 rounded-3xl p-8 md:p-12 backdrop-blur mb-20">
            <h2 className="font-display text-4xl text-nuaibria-gold text-center mb-12">
              How It Works
            </h2>

            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-nuaibria-gold to-nuaibria-ember flex items-center justify-center font-display text-2xl text-nuaibria-bg font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold text-nuaibria-text-accent mb-2">Chat with The Chronicler</h3>
                  <p className="text-nuaibria-text-secondary">
                    Type naturally: "I explore the forest" or "I attack the goblin with my sword"
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-nuaibria-arcane to-nuaibria-poison flex items-center justify-center font-display text-2xl text-white font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold text-nuaibria-text-accent mb-2">AI Enforces D&D Rules</h3>
                  <p className="text-nuaibria-text-secondary">
                    The system rolls 1d20+5 for your attack, calculates damage, updates your character sheet automatically
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-nuaibria-ember to-nuaibria-gold flex items-center justify-center font-display text-2xl text-nuaibria-bg font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold text-nuaibria-text-accent mb-2">See Results & Continue</h3>
                  <p className="text-nuaibria-text-secondary">
                    View dice rolls, get loot, track quests, level up. The story evolves based on your choices.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Example Conversation */}
          <div className="bg-gradient-to-br from-nuaibria-elevated/80 to-nuaibria-surface/80 border-2 border-nuaibria-arcane/30 rounded-3xl p-8 md:p-12 backdrop-blur">
            <h2 className="font-display text-3xl text-nuaibria-arcane text-center mb-8">
              See It In Action
            </h2>

            <div className="max-w-2xl mx-auto space-y-4">
              {/* Player message */}
              <div className="flex justify-end">
                <div className="bg-nuaibria-gold/20 rounded-lg p-4 max-w-[80%] border border-nuaibria-gold/30">
                  <p className="text-sm font-bold text-nuaibria-gold mb-1">You</p>
                  <p className="text-nuaibria-text-primary">I attack the goblin</p>
                </div>
              </div>

              {/* DM response with dice */}
              <div className="flex justify-start">
                <div className="bg-nuaibria-arcane/20 rounded-lg p-4 max-w-[85%] border border-nuaibria-arcane/30">
                  <p className="text-sm font-bold text-nuaibria-arcane mb-2">The Chronicler</p>

                  {/* Dice rolls */}
                  <div className="bg-nuaibria-elevated/50 rounded p-2 mb-3 text-xs space-y-1 border border-nuaibria-border">
                    <div className="flex items-center space-x-2">
                      <span>🎲</span>
                      <span className="text-nuaibria-text-secondary">Attack: 1d20+5 = <span className="font-bold text-nuaibria-gold">18</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>⚔️</span>
                      <span className="text-nuaibria-text-secondary">Damage: 1d8+3 = <span className="font-bold text-nuaibria-ember">9</span></span>
                    </div>
                    <div className="text-green-400 font-semibold">
                      ⚡ Enemy Defeated!
                    </div>
                  </div>

                  <p className="text-nuaibria-text-primary leading-relaxed">
                    Your rusty blade finds a gap in the goblin's armor! The creature howls in pain as blood
                    spatters across the dirt floor. It collapses, defeated. Searching its corpse, you find
                    12 gold and a serviceable short sword.
                  </p>
                </div>
              </div>

              {/* Player response */}
              <div className="flex justify-end">
                <div className="bg-nuaibria-gold/20 rounded-lg p-4 max-w-[80%] border border-nuaibria-gold/30">
                  <p className="text-sm font-bold text-nuaibria-gold mb-1">You</p>
                  <p className="text-nuaibria-text-primary">I equip the short sword</p>
                </div>
              </div>

              {/* DM confirmation */}
              <div className="flex justify-start">
                <div className="bg-nuaibria-arcane/20 rounded-lg p-4 max-w-[85%] border border-nuaibria-arcane/30">
                  <p className="text-sm font-bold text-nuaibria-arcane mb-2">The Chronicler</p>
                  <p className="text-nuaibria-text-primary">
                    You sheath your old dagger and draw the goblin's short sword. It's better balanced,
                    sharper. You're ready for whatever comes next.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-nuaibria-text-muted text-sm italic">
                Natural language gameplay. Real D&D mechanics. Infinite possibilities.
              </p>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center mt-20">
            <h2 className="font-display text-4xl text-nuaibria-gold mb-6">
              Your Adventure Begins Now
            </h2>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/create-character')}
              className="bg-gradient-to-r from-nuaibria-gold via-nuaibria-ember to-nuaibria-gold hover:from-nuaibria-gold/90 hover:to-nuaibria-gold/90 text-nuaibria-bg font-display font-bold text-2xl px-16 py-5 rounded-full shadow-glow transition-all hover:scale-105 hover:shadow-glow-intense"
            >
              {user ? 'Continue Playing' : 'Create Your Hero'}
            </button>

            {!user && (
              <p className="text-nuaibria-text-muted mt-4">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-nuaibria-gold hover:text-nuaibria-ember underline font-semibold"
                >
                  Log in here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-nuaibria-border/30 bg-nuaibria-surface/50 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-nuaibria-text-muted text-sm">
            Nuaibria - An AI-Powered D&D 5e Experience
          </p>
          <p className="text-nuaibria-text-muted text-xs mt-2">
            Featuring secure AI DM architecture, dynamic consequences, and emergent storytelling
          </p>
        </div>
      </footer>
    </main>
  );
};

export default WelcomePage;
