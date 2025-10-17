import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Landing page that introduces players to Nuaibria
 * Sets the tone before character creation
 */
const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-chimera-bg text-chimera-text-primary font-body overflow-x-hidden">
      {/* Fixed gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-chimera-bg via-chimera-surface to-chimera-elevated -z-10"></div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 space-y-16">

        {/* Hero Section */}
        <section className="text-center space-y-6 animate-fade-in">
          <h1 className="font-display text-7xl md:text-8xl text-chimera-gold tracking-widest drop-shadow-lg animate-glow-pulse">
            Nuaibria
          </h1>
          <p className="text-chimera-text-accent text-xl md:text-2xl italic max-w-3xl mx-auto leading-relaxed">
            In a world scarred by forgotten magic, your legend is waiting to be written in blood and shadow.
          </p>
        </section>

        {/* World Introduction */}
        <section className="bg-chimera-surface/80 border-2 border-chimera-gold/20 rounded-lg p-8 shadow-card-hover backdrop-blur-sm animate-slide-up">
          <h2 className="font-display text-3xl text-chimera-ember mb-6 tracking-wider border-b-2 border-chimera-ember/30 pb-4">
            The World Awaits
          </h2>
          <p className="text-chimera-text-primary text-lg leading-relaxed">
            Welcome, traveler, to <span className="text-chimera-gold font-semibold">Nuaibria</span>—a realm of fractured beauty where the embers of a fallen empire glow amidst encroaching darkness. Ancient ruins hold forgotten secrets, rival houses scheme for a crumbling throne, and deep within the shadows, something ancient stirs. The land calls for heroes... or perhaps, it calls for you.
          </p>
        </section>

        {/* The Chronicler */}
        <section className="bg-chimera-surface/80 border-2 border-chimera-arcane/20 rounded-lg p-8 shadow-card-hover backdrop-blur-sm">
          <div className="flex items-start gap-6">
            {/* Icon/Avatar placeholder */}
            <div className="flex-shrink-0 w-20 h-20 rounded-full bg-gradient-to-br from-chimera-gold/20 to-chimera-arcane/20 border-2 border-chimera-gold/30 flex items-center justify-center shadow-glow">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-chimera-gold">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>

            <div className="flex-1">
              <h2 className="font-display text-3xl text-chimera-arcane mb-4 tracking-wider">
                Your Guide: The Chronicler
              </h2>
              <p className="text-chimera-text-primary text-lg leading-relaxed mb-4">
                I am <span className="text-chimera-gold font-semibold">the Chronicler</span>, keeper of tales lost to time. Your choices will carve a new path through this broken land, and I will be your guide through its darkest trials and most desperate triumphs.
              </p>
              <p className="text-chimera-text-secondary italic">
                Your story awaits, adventurer. Let us see what fate has in store for you.
              </p>
            </div>
          </div>
        </section>

        {/* What to Expect */}
        <section className="bg-chimera-surface/80 border-2 border-chimera-poison/20 rounded-lg p-8 shadow-card-hover backdrop-blur-sm">
          <h2 className="font-display text-3xl text-chimera-poison mb-6 tracking-wider border-b-2 border-chimera-poison/30 pb-4">
            What Awaits You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-chimera-gold"></div>
                <p className="text-chimera-text-primary">
                  <span className="text-chimera-gold font-semibold">Explore</span> a procedurally generated world filled with ancient ruins, dangerous wilds, and hidden mysteries
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-chimera-ember"></div>
                <p className="text-chimera-text-primary">
                  <span className="text-chimera-ember font-semibold">Battle</span> in tactical turn-based combat against monsters, bandits, and darker things
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-chimera-arcane"></div>
                <p className="text-chimera-text-primary">
                  <span className="text-chimera-arcane font-semibold">Decide</span> your fate through meaningful choices that shape the world around you
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-chimera-poison"></div>
                <p className="text-chimera-text-primary">
                  <span className="text-chimera-poison font-semibold">Adventure</span> at your own pace with idle progression and active encounters
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-chimera-mana"></div>
                <p className="text-chimera-text-primary">
                  <span className="text-chimera-mana font-semibold">Discover</span> unique loot, legendary artifacts, and secrets of the fallen empire
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-chimera-stamina"></div>
                <p className="text-chimera-text-primary">
                  <span className="text-chimera-stamina font-semibold">Grow</span> in power and reputation as your legend spreads across the land
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-12">
          <button
            onClick={() => navigate('/create-character')}
            className="font-display text-2xl bg-gradient-to-r from-chimera-gold via-chimera-ember to-chimera-gold
                       text-white px-16 py-5 rounded-lg tracking-widest shadow-glow-lg
                       hover:shadow-glow hover:scale-105 transition-all duration-300
                       bg-size-200 bg-pos-0 hover:bg-pos-100 animate-glow-pulse"
            style={{
              backgroundSize: '200% auto',
              backgroundPosition: 'left center'
            }}
          >
            Begin Your Adventure
          </button>
          <p className="text-chimera-text-muted text-sm mt-6 italic">
            Your destiny awaits in the shadows of Nuaibria
          </p>
        </section>

        {/* Footer */}
        <footer className="text-center text-chimera-text-muted text-sm pb-8">
          <p>Enter a world where every choice matters and legends are forged in darkness</p>
        </footer>
      </div>
    </div>
  );
};

export default WelcomePage;
