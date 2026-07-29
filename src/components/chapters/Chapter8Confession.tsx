import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Sparkles } from 'lucide-react';

interface Props {
  playTypingSfx?: () => void;
  playBirthdaySfx?: () => void;
}

const CONFESSION_LINES = [
  'Here is the truth, Ahana.',
  'You are one of those rare people who make the world feel more alive just by being in it.',
  'Your laugh is contagious. Your kindness is effortless.',
  "And somewhere along the way, you became someone I genuinely care about — more than I've probably ever admitted.",
  'Happy Birthday. I hope this year gives you everything you deserve — which is everything.',
];

// Pre-generate particle data to avoid render-time randomness
const PARTICLES = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  left: (i * 1.87 * 100) % 100,
  width: 2 + ((i * 3.14) % 5),
  height: 2 + ((i * 2.71) % 5),
  dur: 4 + ((i * 1.13) % 5),
  delay: (i * 0.73) % 6,
}));

const FLOAT_ICONS = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  isHeart: i % 2 === 0,
  delay: (i * 0.47) % 6,
  dur: 3 + ((i * 0.61) % 3),
  repeatDelay: (i * 0.53) % 4,
  x: Math.sin(i * 1.2) * 300,
  y: -(100 + ((i * 73) % 220)),
  size: 5 + ((i * 3) % 7),
}));

function Typewriter({ text, speed = 35, onTick }: { text: string; speed?: number; onTick?: () => void }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      onTick?.();
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <>{displayed}</>;
}

export function Chapter8Confession({ playTypingSfx, playBirthdaySfx }: Props) {
  const [phase, setPhase] = useState<'card-enter' | 'reading' | 'finale'>('card-enter');
  const [currentLine, setCurrentLine] = useState(-1);
  const [showFinale, setShowFinale] = useState(false);
  const birthdaySfxFiredRef = useRef(false);

  // Phase 1: card entrance
  useEffect(() => {
    const t = setTimeout(() => setPhase('reading'), 3000);
    return () => clearTimeout(t);
  }, []);

  // Phase 2: confession lines sequence
  useEffect(() => {
    if (phase !== 'reading') return;
    let line = 0;

    const nextLine = () => {
      if (line < CONFESSION_LINES.length) {
        setCurrentLine(line);
        const duration =
          line === CONFESSION_LINES.length - 1
            ? CONFESSION_LINES[line].length * 75 + 4200
            : CONFESSION_LINES[line].length * 65 + 2600;
        line++;
        setTimeout(nextLine, duration);
      } else {
        setTimeout(() => {
          setPhase('finale');
          setShowFinale(true);
        }, 2200);
      }
    };

    setTimeout(nextLine, 800);
  }, [phase]);

  // Phase 3: fire birthday SFX once on finale
  useEffect(() => {
    if (!showFinale || birthdaySfxFiredRef.current) return;
    birthdaySfxFiredRef.current = true;
    setTimeout(() => playBirthdaySfx?.(), 500);
  }, [showFinale, playBirthdaySfx]);

  // Fade ending after finale
  useEffect(() => {
    if (!showFinale) return;
    const timer = setTimeout(() => {
      document.body.classList.add('fade-ending');
    }, 12000);
    return () => clearTimeout(timer);
  }, [showFinale]);

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background overflow-hidden px-6 text-center">
      {/* Starry night gradient background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(80,50,140,0.4) 0%, transparent 60%), ' +
            'radial-gradient(ellipse at 20% 20%, rgba(212,175,55,0.15) 0%, transparent 40%), ' +
            'radial-gradient(ellipse at 80% 30%, rgba(100,60,180,0.2) 0%, transparent 40%), ' +
            'linear-gradient(to bottom, hsl(240,15%,5%) 0%, hsl(240,10%,3%) 100%)',
        }}
      />

      {/* Animated scale overlay on finale */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{
          opacity: showFinale ? 0.55 : 0.18,
          scale: showFinale ? 1.08 : 1.02,
        }}
        transition={{ duration: showFinale ? 8 : 18, ease: 'easeInOut' }}
        style={{
          background:
            'radial-gradient(ellipse at 50% 60%, rgba(212,175,55,0.25) 0%, transparent 65%)',
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-background/75 to-background/40" />

      {/* Warm radial glow */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        animate={{ opacity: showFinale ? 0.35 : 0.12 }}
        transition={{ duration: 3 }}
        style={{
          background:
            'radial-gradient(ellipse at 50% 60%, rgba(212,175,55,0.4) 0%, transparent 65%)',
        }}
      />

      {/* Rising particles */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {PARTICLES.map(p => (
          <div
            key={p.id}
            className="particle absolute rounded-full"
            style={{
              left: `${p.left}%`,
              width: `${p.width}px`,
              height: `${p.height}px`,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
              background: 'radial-gradient(circle, rgba(212,175,55,1) 0%, rgba(212,175,55,0) 70%)',
            }}
          />
        ))}
      </div>

      {/* Card-opening intro */}
      <AnimatePresence>
        {phase === 'card-enter' && (
          <motion.div
            key="card-enter"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
            exit={{ opacity: 0, scale: 1.03, y: -15, filter: 'blur(14px)' }}
            transition={{ duration: 1.5, ease: 'easeInOut', y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
            className="relative z-10 w-full max-w-sm"
          >
            <div className="border border-primary/25 bg-card/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
              <motion.div
                animate={{
                  rotate: [-2, 2, -2, 0],
                  scale: [1, 1.08, 1],
                  filter: [
                    'drop-shadow(0 0 4px rgba(212,175,55,0.2))',
                    'drop-shadow(0 0 18px rgba(212,175,55,0.8))',
                    'drop-shadow(0 0 4px rgba(212,175,55,0.2))',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, times: [0, 0.5, 1] }}
              >
                <Heart className="w-10 h-10 text-primary" fill="currentColor" />
              </motion.div>

              <p className="handwriting text-3xl text-primary/80">
                Something to tell you...
              </p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.8 }}
                className="serif text-sm text-foreground/50 uppercase tracking-widest"
              >
                Opening
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  ▋
                </motion.span>
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confession lines */}
      <div
        className="relative z-10 max-w-3xl w-full flex flex-col items-center justify-center"
        style={{ minHeight: '55vh' }}
      >
        <AnimatePresence mode="wait">
          {phase === 'reading' && currentLine >= 0 && (
            <motion.div
              key={currentLine}
              initial={{ opacity: 0, y: 28, filter: 'blur(8px)', scale: 0.97 }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: [0.98, 1] }}
              exit={{ opacity: 0, y: -28, filter: 'blur(8px)', scale: 1.02 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute w-full px-4"
            >
              <p
                className="serif text-primary leading-relaxed font-medium"
                style={{
                  fontSize:
                    currentLine === 0
                      ? 'clamp(1.6rem, 5vw, 3.5rem)'
                      : currentLine === 4
                      ? 'clamp(1.4rem, 4vw, 2.5rem)'
                      : 'clamp(1.25rem, 3.5vw, 2.2rem)',
                  fontStyle: currentLine === 3 ? 'italic' : 'normal',
                  textShadow: '0 0 30px rgba(212,175,55,0.2)',
                }}
              >
                <Typewriter
                  text={CONFESSION_LINES[currentLine]}
                  speed={32}
                  onTick={playTypingSfx}
                />
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block ml-1"
                >
                  ▋
                </motion.span>
              </p>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6, duration: 1.4 }}
                className="mt-6 mx-auto h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                style={{ width: '60%' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Finale */}
        <AnimatePresence>
          {showFinale && (
            <motion.div
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
              className="flex flex-col items-center relative"
            >
              {/* Sparkle decorations */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-12 -left-8 text-primary/30"
              >
                <Sparkles className="w-8 h-8" />
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-8 -right-6 text-primary/20"
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>

              {/* Main text */}
              <motion.h1
                className="handwriting text-primary"
                style={{
                  fontSize: 'clamp(3.5rem, 10vw, 7rem)',
                  lineHeight: 1.15,
                  textShadow:
                    '0 0 60px rgba(212,175,55,0.5), 0 0 120px rgba(212,175,55,0.2)',
                  filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.4))',
                }}
                animate={{
                  scale: [1, 1.02, 1],
                  textShadow: [
                    '0 0 40px rgba(212,175,55,0.4)',
                    '0 0 90px rgba(212,175,55,0.8)',
                    '0 0 40px rgba(212,175,55,0.4)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                Happy Birthday,
                <br />
                Ahana
              </motion.h1>

              {/* Floating hearts & stars */}
              <div className="absolute inset-0 pointer-events-none overflow-visible">
                {FLOAT_ICONS.map(icon => (
                  <motion.div
                    key={`icon-${icon.id}`}
                    initial={{ opacity: 0, scale: 0, y: 0, x: 0 }}
                    animate={{
                      opacity: [0, 0.7, 0],
                      scale: [0, 1.4, 0],
                      y: icon.y,
                      x: icon.x,
                    }}
                    transition={{
                      duration: icon.dur,
                      repeat: Infinity,
                      repeatDelay: icon.repeatDelay,
                      delay: icon.delay,
                      ease: 'easeInOut',
                    }}
                    className="absolute top-1/2 left-1/2 text-primary/50"
                    style={{
                      marginLeft: -icon.size / 2,
                      marginTop: -icon.size / 2,
                    }}
                  >
                    {icon.isHeart ? (
                      <Heart
                        className="fill-current"
                        style={{ width: icon.size * 3, height: icon.size * 3 }}
                      />
                    ) : (
                      <Star
                        className="fill-current"
                        style={{ width: icon.size * 2.5, height: icon.size * 2.5 }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
