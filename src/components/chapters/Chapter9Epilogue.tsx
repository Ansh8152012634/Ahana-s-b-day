import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoldenParticles } from '@/components/ending/GoldenParticles';
import { WarmLight } from '@/components/ending/WarmLight';
import { TulipBloom } from '@/components/ending/TulipBloom';
import { GiftCard } from '@/components/ending/GiftCard';
import { FinalMessage } from '@/components/ending/FinalMessage';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  fadeOutAudio?: () => void;
  /** Gentle chime — plays when the gift button appears */
  playGiftReadySfx?: () => void;
  /** Magical bloom arpeggio — plays when the tulip starts opening */
  playTulipBloomSfx?: () => void;
}

// ─── Pre-generated stable data ────────────────────────────────────────────────

const STARS_DATA = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  startX: ((i * 37.3 + 12) % 100) - 50,
  startY: ((i * 53.7 + 8) % 100) - 50,
  angle: (i * 23.7) % 360,
  dur: 2.8 + ((i * 0.41) % 1.8),
  delay: (i * 0.31) % 3.5,
  size: 4 + ((i * 2) % 6),
}));

const BOKEH = Array.from({ length: 30 }, (_, i) => ({
  left: (i * 3.37) % 100,
  top: (i * 5.73) % 100,
  size: 2 + (i % 4),
  dur: 5 + (i % 6),
  delay: (i * 0.27) % 4,
}));

const LETTER_PARAGRAPHS = [
  'One last page...',
  '',
  "Ig abhi 6:34 huye honge and koi piddi si bouni ye msg padh rahi hogi 😭. Btw aaj ek bohat pyaari si bachi ne janam li thi... Kiki! 👽 Many many happy returns of the day sundri.",
  '',
  "Next time toh boli thi DC pe ki 'Mare huye logon jaago, birthday hai mera!' Hehe! I guess tumhare dead log tumko wish kar diye honge. 😭 Aur han ji... cake bake toh khilao ji. Aise buddha hote raho, hamko usse kya matlab? Batao ji. 😂",
 
  "Btw 12 baje Tulip account pe voicenote bhej diya tha. Aur mere b'day 15 aug ko hai toh mimsii ko dungi boli ti aur nahi di😒 and tumhara 8 june ko hai toh tum he rakh lo mimsii ko. 😂 Meri betu ko belt se maarna band karo chudail ji. 🧙🏿‍♀️",

  "Happy Birthday Mochi (Ahana) 👽",
  "Happy Birthday Elley (Aditi) 🤡",
  "Happy Birthday Shatakshi 👺",
  "Happy Birthday Tulip (Avni) 🪻",
  "Happy Birthday Divyanshi 🐰",
  "Happy Birthday meri Gajar ka Halwa 🥕🪦 Miss you!",
  "Happy Birthday meri bouni 0.0001 mm 😂",
  "Happy Birthday 🐸 aur 🪳 (khud ho btw 😒)",
  "Happy Birthday Drumsticks",
  "Aur Happy Birthday mere sab favourite kuchu puchu log. Aaj bas enjoy karo! ❤️",

  "",
   
  "Also... sorry for everything. Kya hi bolu. Please don't forgive me... aur hamesha nafrat karna mujhse. 😝",
  
   "Aaj mandir jaunga aur Modi ke isteefa ke liye pray karunga. 😂 Hui hui... last bol raha hoon... hate u! 😒",
   
   "Party kab doge ji, bouni malkin? 🤓",

  "Aur haan... tumne pucha tha 'dil mein thodi jagah do'... arre pehle se hi ho, isliye kuch bola hi nahi. ❤️",
   
   "Happy Birthday Papa ji, Mummy ji, Mimsii aur Lucky ki maa! 🎂 Chai ka cake kaatna. 😂",

  "Aur thanks... meri life mein aane ke liye.",

  "Tum toh bolti thi mere se baat karke kaali ho gayi thi na? 🤡 Solly yaar... birthday hai na... Glow & Lovely de dunga. 😂",
   
   "Padhai achhe se karna. Aur Himakshi wali baat ke liye... sach mein sorry. Main uss way mein nahi bol raha tha, but mujhe pata hai bura laga hoga.",

  "Maharani, gift mein kya chahiye? Pen? Oops... woh toh bench-mate ne de diya hoga. 🤔 Chalo ek aur chashma de deta hoon. 👓",

  "Aur apne mummy papa ko thanks bolna... kyunki unhone tumhe paida kiya. Nahi toh mera kya hota? 🥹",

  "Jaa... enjoy kar kaali billi. 🐈‍⬛ Aur haan... gift mein baal chahiye na? Tantric banne ka shauk hai kya? 😂",
   
   "",

  "Happy Birthday once again, Ahana. ❤️"
];

const PHOTO_ROTATIONS = [-3.2, 2.1, -1.8, 3.5];
const PHOTO_OFFSETS = [
  { x: -18, y: -12 },
  { x: 14, y: -8 },
  { x: -10, y: 10 },
  { x: 16, y: 14 },
];

// ─── Scene type ───────────────────────────────────────────────────────────────

type Scene =
  | 'idle'
  | 'jar-enter'
  | 'stars-float'
  | 'jar-glow'
  | 'jar-fade'
  | 'journal-open'
  | 'letter'
  | 'journal-close'
  // ── New ending ──
  | 'fade-black'
  | 'gift-card'
  | 'gift-ready'
  | 'tulip-entrance'
  | 'tulip-bloom'
  | 'final-message'
  // ── Final credits ──
  | 'credits'
  | 'done';

// ─── Memory Jar ───────────────────────────────────────────────────────────────

function MemoryJar({ glowing }: { glowing: boolean }) {
  return (
    <svg width="200" height="260" viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="jarGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation={glowing ? '10' : '4'} result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(212,175,55,0.18)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(212,175,55,0.12)" />
        </linearGradient>
        <linearGradient id="lidGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(212,175,55,0.55)" />
          <stop offset="100%" stopColor="rgba(180,130,30,0.4)" />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="252" rx="55" ry="7" fill="rgba(0,0,0,0.25)" />
      <path
        d="M45 80 Q38 100 38 150 Q38 230 100 235 Q162 230 162 150 Q162 100 155 80 Z"
        fill="url(#glassGrad)"
        stroke="rgba(212,175,55,0.4)"
        strokeWidth="1.5"
        filter="url(#jarGlow)"
      />
      <path d="M52 95 Q48 130 50 175" stroke="rgba(255,255,255,0.18)" strokeWidth="3" strokeLinecap="round" />
      <path d="M142 100 Q146 135 144 170" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeLinecap="round" />
      {glowing && (
        <ellipse
          cx="100" cy="165"
          rx="48" ry="55"
          fill="rgba(212,175,55,0.22)"
          style={{ filter: 'blur(14px)' }}
        />
      )}
      <rect x="55" y="60" width="90" height="22" rx="5" fill="url(#lidGrad)" stroke="rgba(212,175,55,0.5)" strokeWidth="1" />
      <rect x="62" y="55" width="76" height="10" rx="3" fill="rgba(212,175,55,0.45)" />
      <rect x="50" y="78" width="100" height="6" rx="3" fill="rgba(212,175,55,0.25)" />
    </svg>
  );
}

// ─── Floating Star particle ───────────────────────────────────────────────────

function FloatingStar({ star, absorbed }: { star: typeof STARS_DATA[0]; absorbed: boolean }) {
  return (
    <motion.div
      className="absolute"
      style={{ width: star.size * 2, height: star.size * 2, top: '50%', left: '50%' }}
      initial={{ x: star.startX * 4, y: star.startY * 3, opacity: 0, scale: 0, rotate: star.angle }}
      animate={
        absorbed
          ? { x: 0, y: 0, opacity: [1, 1, 0], scale: [1, 0.4, 0], rotate: star.angle + 360 }
          : { x: 0, y: 0, opacity: [0, 0.9, 0.9], scale: [0, 1, 1], rotate: star.angle + 180 }
      }
      transition={{ duration: star.dur, delay: star.delay, ease: absorbed ? 'easeIn' : 'easeOut' }}
    >
      <svg viewBox="0 0 20 20" width={star.size * 2} height={star.size * 2}>
        <polygon
          points="10,1 12.5,7 19,7 14,12 16,19 10,15 4,19 6,12 1,7 7.5,7"
          fill="rgba(212,175,55,0.85)"
          stroke="rgba(255,235,150,0.6)"
          strokeWidth="0.5"
        />
        <polygon
          points="10,1 12.5,7 19,7 14,12 16,19 10,15 4,19 6,12 1,7 7.5,7"
          fill="rgba(255,255,200,0.3)"
          style={{ filter: 'blur(1px)' }}
        />
      </svg>
    </motion.div>
  );
}

// ─── Scrapbook Journal ────────────────────────────────────────────────────────

function ScrapbookPage({ letterProgress, photoCount }: { letterProgress: number; photoCount: number }) {
  const letterText = LETTER_PARAGRAPHS.join('\n');
  const visibleChars = Math.floor(letterText.length * letterProgress);
  const visibleText = letterText.slice(0, visibleChars);

  return (
    <div
      className="relative w-full max-w-md mx-auto rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #e8dcc8 0%, #f0e6d2 40%, #ede0c4 100%)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4)',
        minHeight: '520px',
      }}
    >
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(160,120,60,0.08) 28px, rgba(160,120,60,0.08) 29px)',
        }}
      />
      <div className="absolute -top-1 -left-1 w-20 h-8 opacity-70 z-10 rounded-sm" style={{ background: 'rgba(255,180,100,0.55)', transform: 'rotate(-2deg)' }} />
      <div className="absolute -top-1 right-4 w-16 h-7 opacity-60 z-10 rounded-sm" style={{ background: 'repeating-linear-gradient(90deg, rgba(180,220,180,0.7) 0px, rgba(180,220,180,0.7) 8px, rgba(150,200,150,0.5) 8px, rgba(150,200,150,0.5) 16px)', transform: 'rotate(1.5deg)' }} />
      <svg className="absolute right-5 top-6 opacity-40" width="40" height="40" viewBox="0 0 40 40">
        <ellipse cx="20" cy="12" rx="5" ry="9" fill="rgba(200,160,100,0.6)" transform="rotate(0 20 20)" />
        <ellipse cx="20" cy="12" rx="5" ry="9" fill="rgba(200,160,100,0.6)" transform="rotate(60 20 20)" />
        <ellipse cx="20" cy="12" rx="5" ry="9" fill="rgba(200,160,100,0.6)" transform="rotate(120 20 20)" />
        <circle cx="20" cy="20" r="4" fill="rgba(220,180,80,0.7)" />
      </svg>
      <svg className="absolute left-5 bottom-16 opacity-35" width="18" height="16" viewBox="0 0 18 16">
        <path d="M9 14 C9 14 1 9 1 4.5 C1 2.5 2.5 1 4.5 1 C6 1 7.5 2 9 3.5 C10.5 2 12 1 13.5 1 C15.5 1 17 2.5 17 4.5 C17 9 9 14 9 14Z" fill="rgba(180,100,100,0.5)" />
      </svg>
      <svg className="absolute right-3 bottom-20 opacity-50" width="12" height="36" viewBox="0 0 12 36">
        <path d="M6 2 C2 2 2 10 6 10 C10 10 10 2 6 2Z M6 10 L6 34 M6 34 C2 34 2 26 6 26" stroke="rgba(120,100,80,0.7)" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
      {[{ x: 12, y: 45, r: 0 }, { x: 85, y: 82, r: 15 }, { x: 8, y: 75, r: -10 }].map((s, i) => (
        <svg key={i} className="absolute opacity-30" style={{ left: `${s.x}%`, top: `${s.r + s.y}px` }} width="10" height="10" viewBox="0 0 10 10">
          <polygon points="5,0.5 6.2,3.8 9.8,3.8 6.9,5.9 8,9.2 5,7.1 2,9.2 3.1,5.9 0.2,3.8 3.8,3.8" fill="rgba(160,120,60,0.7)" />
        </svg>
      ))}
      <div className="relative z-10 p-7 pt-8">
        <p className="handwriting text-2xl mb-5 text-center" style={{ color: 'rgba(100,70,40,0.85)', letterSpacing: '0.02em' }}>
          One last page...
        </p>
        <div className="handwriting text-base leading-relaxed whitespace-pre-wrap mb-4" style={{ color: 'rgba(80,55,30,0.88)', minHeight: '180px', fontSize: '1.05rem' }}>
          {visibleText.split('\n').slice(1).join('\n')}
          {letterProgress < 1 && (
            <span className="inline-block w-0.5 h-5 ml-0.5 align-middle" style={{ background: 'rgba(100,70,40,0.7)', animation: 'cursorBlink 0.8s step-end infinite' }} />
          )}
        </div>
        <div className="relative mt-4" style={{ minHeight: photoCount > 0 ? '180px' : '0' }}>
          {[0, 1, 2, 3].map(idx => (
            <AnimatePresence key={idx}>
              {idx < photoCount && (
                <motion.div
                  key={`photo-${idx}`}
                  className="absolute"
                  style={{ left: `${18 + idx * 18}%`, top: `${idx % 2 === 0 ? 10 : 50}px`, rotate: PHOTO_ROTATIONS[idx], zIndex: idx + 1 }}
                  initial={{ opacity: 0, scale: 0.6, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-4 rounded-sm opacity-70 z-10" style={{ background: idx % 2 === 0 ? 'rgba(255,200,130,0.65)' : 'repeating-linear-gradient(90deg, rgba(180,220,180,0.6) 0px, rgba(180,220,180,0.6) 6px, rgba(150,200,150,0.4) 6px, rgba(150,200,150,0.4) 12px)' }} />
                  <div className="rounded-sm overflow-hidden" style={{ background: '#f9f5ee', padding: '6px 6px 22px 6px', boxShadow: '0 4px 18px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)', width: '90px' }}>
                    <img src={`${import.meta.env.BASE_URL}photos/photo${idx + 1}.jpg`} alt={`Memory ${idx + 1}`} className="w-full h-full object-cover rounded-sm" />
                    <p className="handwriting text-center mt-1 opacity-40" style={{ fontSize: '0.55rem', color: 'rgba(80,60,40,0.6)' }}>add your photo here</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>
      </div>
      <style>{`@keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}

// ─── Main Epilogue Component ──────────────────────────────────────────────────

export function Chapter9Epilogue({ fadeOutAudio, playGiftReadySfx, playTulipBloomSfx }: Props) {
  const [scene, setScene] = useState<Scene>('idle');
  const [starsAbsorbed, setStarsAbsorbed] = useState(false);
  const [jarGlowing, setJarGlowing] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [letterProgress, setLetterProgress] = useState(0);
  const [photoCount, setPhotoCount] = useState(0);
  const [tulipVisible, setTulipVisible] = useState(false);

  const letterIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pianoRef = useRef<HTMLAudioElement | null>(null);
  const tulipTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Main timeline ──────────────────────────────────────────────
  useEffect(() => {
    pianoRef.current = new Audio(`${import.meta.env.BASE_URL}music/piano.mp3`);
    pianoRef.current.loop = true;
    pianoRef.current.volume = 0;
    pianoRef.current?.play().catch(() => {});

let vol = 0;
const fade = setInterval(() => {
  vol += 0.02;
  if (vol >= 0.22) {
    vol = 0.22;
    clearInterval(fade);
  }
  if (pianoRef.current) pianoRef.current.volume = vol;
}, 120);

     
        const seq: [number, () => void][] = [
      [200,    () => setScene('jar-enter')],
      [2200,   () => setScene('stars-float')],
      [8000,   () => { setStarsAbsorbed(true); setScene('jar-glow'); }],
      [10000,  () => setJarGlowing(true)],
      [12500,  () => setScene('jar-fade')],
      [15000,  () => { setScene('journal-open'); setJournalOpen(true); }],
      [17500,  () => {
        setScene('letter');
        const totalChars = LETTER_PARAGRAPHS.join('\n').length;
        const speed = totalChars > 0 ? 100000 / totalChars : 60;
        let elapsed = 0;
        letterIntervalRef.current = setInterval(() => {
          elapsed += speed;
          setLetterProgress(Math.min(elapsed / 100000, 1));
          if (elapsed >= 100000) clearInterval(letterIntervalRef.current!);
        }, speed);
        [4000, 8000, 13000, 18000].forEach((delay, idx) => {
          setTimeout(() => setPhotoCount(idx + 1), delay);
        });
      }],
      [125000, () => setScene('journal-close')],
      // ── New ending sequence ──────────────────────────────────
      [128500, () => {
        fadeOutAudio?.();
        setScene('fade-black');
      }],
      [131000, () => setScene('gift-card')],
      [146000, () => {
        playGiftReadySfx?.();
        setScene('gift-ready');
      }],
      // tulip-entrance and beyond are user-triggered (button click)
    ];

    const timers = seq.map(([delay, fn]) => setTimeout(fn, delay));

    return () => {
      timers.forEach(clearTimeout);
      tulipTimersRef.current.forEach(clearTimeout);
      if (letterIntervalRef.current) clearInterval(letterIntervalRef.current);
    };
  }, []);

    useEffect(() => {
  if (scene !== 'done'||!pianoRef.current) return;

  let volume = pianoRef.current.volume; 
    

    const fade = setInterval(() => {
      volume -= 0.01;

      if (volume <= 0) {
        volume = 0;
        pianoRef.current?.pause();
        clearInterval(fade);
      }

      if (pianoRef.current) {
        pianoRef.current.volume = volume;
      }
    }, 100);

    return () => clearInterval(fade);
  }
}, [scene]);


  // ── Button click → tulip sequence ─────────────────────────────
  const handleGiftButtonClick = useCallback(() => {
    setScene('tulip-entrance');

    const t1 = setTimeout(() => {
  if (pianoRef.current) {
    pianoRef.current.volume = 0.14;
  }

  setScene('tulip-bloom');
  setTulipVisible(true);
  playTulipBloomSfx?.();

  setTimeout(() => {
    if (pianoRef.current) {
      pianoRef.current.volume = 0.22;
    }
  }, 2000);

}, 2800);

    const t2 = setTimeout(() => {
      setScene('final-message');
    }, 13800); // 2.8 entrance + 11 bloom

    const t3 = setTimeout(() => {
      setScene('credits');
    }, 22800); // + 9 s for final message reading

    const t4 = setTimeout(() => {
      setScene('done');
    }, 28800); // + 6 s fade out

    tulipTimersRef.current = [t1, t2, t3, t4];
  }, [playTulipBloomSfx]);

  // ── Derived visibility flags ───────────────────────────────────
  const showJar     = ['jar-enter', 'stars-float', 'jar-glow'].includes(scene);
  const showJournal = ['journal-open', 'letter', 'journal-close'].includes(scene);
  const journalClosing = scene === 'journal-close';

  // Dark overlay — fades in after journal closes, persists through gift card
  const darkOverlayOpacity =
    ['fade-black', 'gift-card', 'gift-ready', 'tulip-entrance'].includes(scene) ? 0.82
    : ['tulip-bloom', 'final-message'].includes(scene) ? 0.30
    : ['credits', 'done'].includes(scene) ? 0.55
    : 0;

  const showGiftCard    = ['gift-card', 'gift-ready'].includes(scene);
  const showGiftButton  = scene === 'gift-ready';

  const showTulipScene  = ['tulip-entrance', 'tulip-bloom', 'final-message', 'credits', 'done'].includes(scene);
  const showParticles   = showTulipScene;
  const showWarmLight   = ['tulip-bloom', 'final-message', 'credits', 'done'].includes(scene);
  const showFinalMsg    = ['final-message', 'credits', 'done'].includes(scene);
  const showCredits     = scene === 'credits' || scene === 'done';

  return (
    <div className="relative min-h-[100dvh] w-full flex items-center justify-center bg-background overflow-hidden">

      {/* ── Deep space background ── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.08) 0%, transparent 55%), ' +
            'radial-gradient(ellipse at 20% 80%, rgba(80,50,140,0.15) 0%, transparent 45%), ' +
            'linear-gradient(180deg, hsl(240,20%,4%) 0%, hsl(240,10%,2%) 100%)',
        }}
      />

      {/* ── Bokeh orbs ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {BOKEH.map((b, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ left: `${b.left}%`, top: `${b.top}%`, width: b.size, height: b.size, background: 'rgba(212,175,55,0.4)' }}
            animate={{ opacity: [0.1, 0.35, 0.1], scale: [1, 1.6, 1] }}
            transition={{ duration: b.dur, repeat: Infinity, delay: b.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* ── Full-screen fade-to-black overlay ── */}
      <motion.div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{ zIndex: 22 }}
        animate={{ opacity: darkOverlayOpacity }}
        transition={{ duration: 2.8, ease: 'easeInOut' }}
      />

      {/* ── Scene: Memory Jar ── */}
      <AnimatePresence>
        {showJar && (
          <motion.div
            key="jar-scene"
            className="absolute flex flex-col items-center justify-center"
            style={{ zIndex: 20 }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, filter: 'blur(12px)' }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute rounded-full pointer-events-none" style={{ width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', filter: 'blur(20px)' }} />
            {(scene === 'stars-float' || scene === 'jar-glow') && STARS_DATA.map(star => (
              <FloatingStar key={star.id} star={star} absorbed={starsAbsorbed} />
            ))}
            <MemoryJar glowing={jarGlowing} />
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.8 }} className="handwriting text-primary/50 text-lg mt-4">
              a jar of memories
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scene: Scrapbook Journal ── */}
      <AnimatePresence>
        {showJournal && (
          <motion.div
            key="journal-scene"
            className="relative w-full max-w-md mx-4"
            style={{ zIndex: 20 }}
            initial={{ opacity: 0, scaleY: 0.02, transformOrigin: 'top center' }}
            animate={journalClosing ? { opacity: 0, scale: 0.85, filter: 'blur(8px)' } : { opacity: 1, scaleY: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={journalClosing ? { duration: 2.5, ease: 'easeInOut' } : { duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute -inset-8 rounded-3xl pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.12) 0%, transparent 70%)', filter: 'blur(16px)' }} />
            <ScrapbookPage letterProgress={letterProgress} photoCount={photoCount} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════
          NEW ENDING SCENES
          ════════════════════════════════════════════════════════════ */}

      {/* ── Gift Preparation Card ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 30 }}>
        <div style={{ pointerEvents: showGiftCard ? 'auto' : 'none' }}>
          <GiftCard
            visible={showGiftCard}
            showButton={showGiftButton}
            onButtonClick={handleGiftButtonClick}
          />
        </div>
      </div>

      {/* ── Tulip Scene: particles + warm light + tulip SVG ── */}
      <AnimatePresence>
        {showTulipScene && (
          <motion.div
            key="tulip-scene"
            className="absolute inset-0"
            style={{ zIndex: 28 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
          >
            {/* Golden particles floating upward */}
            <GoldenParticles active={showParticles} />

            {/* Warm golden light rising from below */}
            <WarmLight visible={showWarmLight} />

            {/* Tulip — positioned at bottom center */}
            <motion.div
              className="absolute flex items-end justify-center"
              style={{
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 29,
              }}
              initial={{ opacity: 0, y: 60 }}
              animate={tulipVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
              transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <TulipBloom visible={tulipVisible} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Final message: "Some memories don't fade. They simply bloom." ── */}
      <FinalMessage visible={showFinalMsg} />

      {/* ── Credits: "Made with ❤️ by Anshu" ── */}
      <AnimatePresence>
        {showCredits && (
          <motion.div
            key="credits"
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ zIndex: 40 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: scene === 'done' ? 0 : 1 }}
            transition={{ duration: 3, ease: 'easeInOut' }}
          >
            {/* Glowing star above */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: scene === 'done' ? 0 : [0, 1, 0.7, 1, 0.7], scale: scene === 'done' ? 0 : [0, 1.3, 1, 1.1, 1] }}
              transition={{ duration: 2.5, times: [0, 0.3, 0.5, 0.7, 1], ease: 'easeOut' }}
              className="mb-8"
              style={{ filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.9))' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24">
                <polygon
                  points="12,2 14.9,8.3 22,9.3 17,14.1 18.2,21.2 12,17.8 5.8,21.2 7,14.1 2,9.3 9.1,8.3"
                  fill="rgba(212,175,55,0.9)"
                  stroke="rgba(255,235,150,0.7)"
                  strokeWidth="0.5"
                />
              </svg>
            </motion.div>

            {/* Credit text */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: scene === 'done' ? 0 : 1, y: scene === 'done' ? -8 : 0 }}
              transition={{ duration: 2, delay: 0.5, ease: 'easeOut' }}
              className="serif text-2xl text-primary/80 tracking-wide"
              style={{ filter: 'drop-shadow(0 0 12px rgba(212,175,55,0.4))' }}
            >
              Made with ❤️ by Anshu
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
