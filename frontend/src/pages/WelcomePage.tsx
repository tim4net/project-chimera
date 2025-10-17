import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useImageGeneration } from '../hooks/useAssetGeneration';

/**
 * Landing page that introduces players to Nuaibria
 * Sets the tone before character creation
 */
const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  // Generate hero banner image
  const heroBanner = useImageGeneration({
    prompt: 'Epic dark fantasy landscape, ancient ruins silhouetted against a twilight sky, mystical energy glowing from cracks in reality, broken empire architecture, atmospheric fog',
    dimensions: { width: 1920, height: 600 },
    contextType: 'location_banner',
    context: { location: 'nuaibria_overview' }
  });

  // Generate Chronicler portrait
  const chroniclerPortrait = useImageGeneration({
    prompt: 'Mysterious ethereal figure made of swirling pages and magical energy, hooded silhouette, glowing golden eyes, ancient tome floating nearby, keeper of knowledge',
    dimensions: { width: 512, height: 512 },
    contextType: 'character_portrait',
    context: { character: 'the_chronicler' }
  });

  return (
    <div className="min-h-screen bg-chimera-bg text-chimera-text-primary font-body overflow-x-hidden">
      {/* Animated background with magical particles */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-chimera-bg via-chimera-surface to-chimera-elevated"></div>

        {/* Magical glow orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-chimera-gold/5 rounded-full blur-3xl animate-glow-pulse"></div>
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-chimera-arcane/5 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-chimera-ember/5 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '2s'}}></div>

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(212, 175, 55, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 space-y-16">

        {/* Hero Banner Image */}
        {heroBanner.imageUrl && (
          <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden border-2 border-chimera-gold/20 shadow-glow-lg animate-fade-in">
            <img
              src={heroBanner.imageUrl}
              alt="Nuaibria landscape"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-chimera-bg via-transparent to-transparent"></div>
          </div>
        )}

        {/* Hero Section */}
        <section className="text-center space-y-8 animate-fade-in pt-12 pb-8">
          {/* Decorative top border */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-32 bg-gradient-to-r from-transparent to-chimera-gold/50"></div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-chimera-gold">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
            <div className="h-px w-32 bg-gradient-to-l from-transparent to-chimera-gold/50"></div>
          </div>

          <h1 className="font-display text-7xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-br from-chimera-gold via-chimera-ember to-chimera-gold tracking-widest drop-shadow-lg animate-glow-pulse" style={{
            textShadow: '0 0 40px rgba(212, 175, 55, 0.5), 0 0 80px rgba(255, 107, 53, 0.3)'
          }}>
            Nuaibria
          </h1>

          <p className="text-chimera-text-accent text-xl md:text-2xl italic max-w-3xl mx-auto leading-relaxed">
            In a world scarred by forgotten magic, your legend is waiting to be written in blood and shadow.
          </p>

          {/* Decorative bottom flourish */}
          <div className="flex justify-center gap-2 pt-4">
            <div className="w-2 h-2 rounded-full bg-chimera-gold/60"></div>
            <div className="w-2 h-2 rounded-full bg-chimera-ember/60"></div>
            <div className="w-2 h-2 rounded-full bg-chimera-arcane/60"></div>
          </div>
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
        <section className="bg-chimera-surface/80 border-2 border-chimera-arcane/20 rounded-lg p-8 shadow-card-hover backdrop-blur-sm relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-chimera-arcane/5 rounded-full blur-3xl -z-0"></div>

          <div className="flex items-start gap-6 relative z-10">
            {/* Enhanced Icon/Avatar with optional AI image */}
            <div className="flex-shrink-0 w-24 h-24 rounded-full bg-gradient-to-br from-chimera-gold/30 via-chimera-arcane/20 to-chimera-gold/30 border-2 border-chimera-gold/40 shadow-glow-lg relative overflow-hidden">
              {chroniclerPortrait.loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-chimera-gold border-t-transparent"></div>
                </div>
              ) : chroniclerPortrait.imageUrl ? (
                <img src={chroniclerPortrait.imageUrl} alt="The Chronicler" className="w-full h-full object-cover" />
              ) : (
                <>
                  {/* Fallback icon */}
                  <div className="absolute inset-2 rounded-full bg-chimera-bg/50 border border-chimera-gold/20"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-chimera-gold relative z-10 m-auto mt-6">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </>
              )}
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
        <section className="text-center py-12 relative">
          {/* Decorative elements */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-chimera-gold to-transparent"></div>
          </div>

          <div className="relative z-10 space-y-6">
            {/* Ornamental top border */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-chimera-gold"></div>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-chimera-gold"></div>
                <div className="w-1 h-1 rounded-full bg-chimera-ember"></div>
                <div className="w-1 h-1 rounded-full bg-chimera-arcane"></div>
              </div>
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-chimera-gold"></div>
            </div>

            <button
              onClick={() => navigate('/create-character')}
              className="group relative font-display text-2xl bg-gradient-to-r from-chimera-gold via-chimera-ember to-chimera-gold
                         text-white px-16 py-5 rounded-lg tracking-widest shadow-glow-lg
                         hover:shadow-glow hover:scale-105 transition-all duration-300
                         border-2 border-chimera-gold/30 hover:border-chimera-gold/60"
              style={{
                backgroundSize: '200% auto',
                backgroundPosition: 'left center'
              }}
            >
              <span className="relative z-10">Begin Your Adventure</span>
              {/* Inner glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
            </button>

            <p className="text-chimera-text-muted text-sm italic">
              Your destiny awaits in the shadows of Nuaibria
            </p>

            {/* Decorative bottom flourish */}
            <div className="flex justify-center gap-2 pt-4">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-chimera-gold/50 to-transparent"></div>
            </div>
          </div>
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
