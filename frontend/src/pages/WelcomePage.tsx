import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useImageGeneration } from '../hooks/useAssetGeneration';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const heroBanner = useImageGeneration({
    prompt:
      'Dark fantasy vista of Nuaibria, shattered citadel atop cliffs, ember-lit storm clouds, arcane fissures bleeding gold light, Baldurs Gate 3 style, moody and mysterious',
    dimensions: { width: 1920, height: 1080 },
    contextType: 'location_banner',
    context: { location: 'nuaibria_twilight_citadel' }
  });

  const chroniclerPortrait = useImageGeneration({
    prompt:
      'The Chronicler, ethereal archivist cloaked in midnight vellum, floating runes and golden quill, eyes like molten amber, half-shadowed face, dark fantasy portrait',
    dimensions: { width: 512, height: 512 },
    contextType: 'character_portrait',
    context: { character: 'the_chronicler' }
  });

  const birdsEyeBackground = useImageGeneration({
    prompt:
      'Aerial view of Nuaibria at dusk, river of starlight winding through ruined spires, creeping mist, ember camps, ominous forests, painterly, atmospheric',
    dimensions: { width: 2560, height: 1440 },
    contextType: 'location_banner',
    context: { location: 'nuaibria_omen_map' }
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-chimera-bg font-body text-chimera-text-primary">
      <div className="pointer-events-none absolute inset-0 -z-10">
        {birdsEyeBackground.imageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: `url(${birdsEyeBackground.imageUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-chimera-bg via-chimera-surface to-chimera-elevated" />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.12),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(16,185,129,0.07),_transparent_60%)]" />

        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-chimera-ember/15 blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-chimera-arcane/20 blur-3xl" />
        <div className="absolute left-1/3 bottom-10 h-64 w-64 rounded-full bg-chimera-gold/10 blur-2xl" />

        <div
          className="absolute inset-0 mix-blend-screen opacity-5"
          style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 45%)' }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <section className="px-6 pb-16 pt-24 md:px-10 lg:px-16">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 lg:flex-row lg:items-center">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-chimera-border/40 bg-chimera-surface/50 px-4 py-1 text-sm uppercase tracking-[0.3em] text-chimera-text-muted">
                Realm Briefing
                <span className="h-1 w-1 rounded-full bg-chimera-gold" />
                Act I
              </div>

              <div className="space-y-4">
                <h1 className="font-display text-5xl leading-tight text-chimera-gold drop-shadow-[0_0_20px_rgba(212,175,55,0.35)] md:text-6xl lg:text-7xl">
                  Nuaibria
                </h1>
                <p className="max-w-xl text-lg text-chimera-text-secondary md:text-xl">
                  A realm scarred by forgotten magic, where the ruins of a fallen empire smolder beneath encroaching dusk. Every whispered legend points toward the darkness yet to wake.
                </p>
              </div>

              <div className="grid gap-4 text-sm uppercase tracking-[0.2em] text-chimera-text-muted sm:grid-cols-2">
                <div className="rounded-xl border border-chimera-border/30 bg-chimera-surface/60 p-4 backdrop-blur-sm">
                  <p className="text-chimera-text-accent font-medium tracking-normal">Forgotten Frontiers</p>
                  <p className="pt-1 text-xs normal-case text-chimera-text-secondary">
                    Chart fractured wilds, delve into rune-choked vaults, and listen as the land remembers.
                  </p>
                </div>
                <div className="rounded-xl border border-chimera-border/30 bg-chimera-surface/60 p-4 backdrop-blur-sm">
                  <p className="text-chimera-ember font-medium tracking-normal">Encroaching Night</p>
                  <p className="pt-1 text-xs normal-case text-chimera-text-secondary">
                    Face horrors reborn from empire ash and bargain with the shadows that hunger.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => navigate('/create-character')}
                  className="group inline-flex items-center justify-center rounded-full border border-chimera-gold/40 bg-gradient-to-r from-chimera-ember via-chimera-gold to-chimera-ember px-10 py-3 font-display text-lg tracking-[0.25em] text-chimera-bg shadow-glow transition-transform duration-300 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-chimera-gold/70"
                >
                  Begin Your Adventure
                </button>
                <p className="text-sm text-chimera-text-muted">
                  Guided by the Chronicler. Forged by your choices.
                </p>
              </div>
            </div>

            <div className="flex-1">
              <div className="relative rounded-3xl border border-chimera-border/30 bg-chimera-surface/80 shadow-card backdrop-blur">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                {heroBanner.imageUrl ? (
                  <img
                    src={heroBanner.imageUrl}
                    alt="Shattered citadel of Nuaibria"
                    className="h-full w-full rounded-3xl object-cover"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-3xl bg-gradient-to-br from-chimera-elevated via-chimera-surface to-chimera-border">
                    <span className="text-sm uppercase tracking-[0.3em] text-chimera-text-muted">Summoning Visions...</span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-x-6 bottom-6 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-xs uppercase tracking-[0.2em] text-chimera-text-secondary">
                  <span>Arcane Weather: Unstable</span>
                  <span>Visibility: Veiled</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 px-6 pb-20 md:px-10 lg:px-16">
          <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[2fr_3fr]">
            <div className="relative overflow-hidden rounded-3xl border border-chimera-arcane/40 bg-chimera-surface/80 p-8 shadow-card backdrop-blur">
              <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-chimera-arcane/20 blur-3xl" />
              <div className="relative flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border border-chimera-gold/40 bg-chimera-elevated shadow-glow">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-chimera-gold/20 via-transparent to-transparent" />
                    {chroniclerPortrait.imageUrl ? (
                      <img
                        src={chroniclerPortrait.imageUrl}
                        alt="The Chronicler"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.2em] text-chimera-text-muted">
                        Studying Fate...
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-chimera-text-muted">Guiding Presence</p>
                    <h2 className="font-display text-2xl text-chimera-arcane">The Chronicler</h2>
                  </div>
                </div>
                <p className="text-chimera-text-secondary">
                  I bear witness to every whispered prophecy and broken oath. Your steps rewrite the annals of Nuaibria, and I shall chart each fracture, each triumph. Ask, and I will translate the murmurs of the dark.
                </p>
                <p className="text-sm italic text-chimera-text-muted">
                  "Ink the tale in gold or shadow--only choose before the dusk consumes the page."
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-chimera-border/40 bg-chimera-surface/70 p-8 shadow-card backdrop-blur">
                <h2 className="font-display text-3xl text-chimera-gold">What Awaits Beyond The Veil</h2>
                <p className="mt-4 text-chimera-text-secondary">
                  Nuaibria breathes in cycles of ruin and rebirth. Venture forth to unravel the sigils left by a doomed empire, barter with spirits forged from ember and ice, and bend the turmoil to your design.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: 'Explore',
                    accent: 'text-chimera-gold',
                    body:
                      'Traverse haunted skylines, collapsing archives, and living forests that change with each vigil.'
                  },
                  {
                    title: 'Battle',
                    accent: 'text-chimera-ember',
                    body:
                      'Command tactical encounters where every sigil spent shifts the balance between hope and oblivion.'
                  },
                  {
                    title: 'Decide',
                    accent: 'text-chimera-arcane',
                    body:
                      "Shape alliances, invoke forgotten pacts, and steer the Chronicler's record toward salvation or dominion."
                  },
                  {
                    title: 'Endure',
                    accent: 'text-chimera-poison',
                    body:
                      'Harness idle progression while you plan, letting your stronghold gather power even in silence.'
                  }
                ].map(({ title, accent, body }) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-chimera-border/30 bg-chimera-elevated/70 p-5 shadow-inner-dark transition-transform duration-300 hover:-translate-y-1"
                  >
                    <p className={`font-display text-xl ${accent}`}>{title}</p>
                    <p className="mt-2 text-sm text-chimera-text-secondary">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 px-6 pb-24 md:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-5xl rounded-3xl border border-chimera-border/30 bg-gradient-to-br from-chimera-surface/80 via-chimera-elevated/70 to-chimera-surface/80 p-10 shadow-card backdrop-blur">
            <div className="grid gap-8 lg:grid-cols-[5fr_4fr] lg:items-center">
              <div className="space-y-5">
                <h2 className="font-display text-3xl text-chimera-text-accent">Idle Does Not Mean Still</h2>
                <p className="text-chimera-text-secondary">
                  While you commune with the Chronicler, your stronghold hums. Send envoys into the mist, refine relics, and watch fate inch toward dawn as you prepare the next decisive strike.
                </p>
                <ul className="space-y-3 text-sm text-chimera-text-muted">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-chimera-gold" />
                    <span>Establish sanctums that harvest arcane echoes even when you rest.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-chimera-ember" />
                    <span>Return to fortify gear, decipher chronicles, and plot the next descent.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-chimera-poison" />
                    <span>Let the world evolve--alliances shift, threats grow, opportunities bloom.</span>
                  </li>
                </ul>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/create-character')}
                    className="inline-flex items-center justify-center rounded-full border border-chimera-border/60 px-8 py-3 text-sm uppercase tracking-[0.25em] text-chimera-text-accent transition-colors duration-300 hover:border-chimera-gold/70 hover:text-chimera-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-chimera-arcane/70"
                  >
                    Chronicle My Origin
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-chimera-border/40 bg-chimera-surface/80 p-6 text-sm text-chimera-text-secondary">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.15),_transparent_65%)]" />
                <div className="relative space-y-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-chimera-text-muted">Chronicler's Log</p>
                  <p>"Fourth bell. The sky split--just a breath. Residual gold fire drifting across the Mire. Adventurer remained steady; the land took notice."</p>
                  <p>"Idle wards hum at threshold capacity. Recommend release of gathered arcane before the next breach."</p>
                  <p className="text-chimera-text-muted">- Recorded in the Codex Noctis</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="px-6 pb-10 md:px-10 lg:px-16">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 rounded-3xl border border-chimera-border/30 bg-chimera-elevated/60 px-6 py-6 text-center text-xs uppercase tracking-[0.3em] text-chimera-text-muted">
            <span>In Nuaibria, every silence hides a choice.</span>
            <span className="text-chimera-text-accent">Will you brave the encroaching dark?</span>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default WelcomePage;
