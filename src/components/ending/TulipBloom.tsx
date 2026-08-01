import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// ── Petal shape paths — drawn pointing straight up from flower center (100, 162) ──
// Each petal is rotated into position via SVG transform.

/** Outer petal: wider, slightly flared, more opulent */
const OUTER_PETAL =
  'M 100 164 C 79 150, 68 113, 74 81 C 80 50, 120 50, 126 81 C 132 113, 121 150, 100 164 Z';

/** Inner petal: narrower, more upright — forms the inner cup */
const INNER_PETAL =
  'M 100 164 C 85 151, 80 121, 86 93 C 91 65, 109 65, 114 93 C 120 121, 115 151, 100 164 Z';

/** Sepal (small green leaf protecting the base) */
const SEPAL =
  'M 100 175 C 90 165, 86 150, 90 140 C 94 132, 100 130, 100 130 C 100 130, 106 132, 110 140 C 114 150, 110 165, 100 175 Z';

const OUTER_ROTATIONS = [0, 120, 240] as const;
const INNER_ROTATIONS = [60, 180, 300] as const;
const SEPAL_ROTATIONS = [0, 72, 144, 216, 288] as const;

// Five stamen filaments
const STAMEN_ANGLES = [0, 72, 144, 216, 288];

interface TulipBloomProps {
  /** When true the flower begins its animation sequence */
  visible: boolean;
}

export function TulipBloom({ visible }: TulipBloomProps) {
  // breathe starts after all petals finish opening (~9 s into visible)
  const [breathe, setBreathe] = useState(false);

  useEffect(() => {
    if (!visible) {
      setBreathe(false);
      return;
    }
    const t = setTimeout(() => setBreathe(true), 9200);
    return () => clearTimeout(t);
  }, [visible]);

  // Ease used everywhere for organic feel
  const bloom = [0.22, 1, 0.36, 1] as const;

  return (
    <svg
      viewBox="0 0 200 370"
      width="210"
      height="378"
      style={{
        overflow: 'visible',
        filter: breathe
          ? 'drop-shadow(0 0 28px rgba(200,80,140,0.55))'
          : 'drop-shadow(0 0 12px rgba(200,80,140,0.28))',
        transition: 'filter 2s ease',
      }}
      aria-label="Blooming tulip"
    >
      <defs>
        {/* Stem */}
        <linearGradient id="stemG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1e3d28" />
          <stop offset="45%" stopColor="#3d7050" />
          <stop offset="100%" stopColor="#1e3d28" />
        </linearGradient>

        {/* Leaves */}
        <linearGradient id="leafG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4a8060" />
          <stop offset="100%" stopColor="#1e3d28" />
        </linearGradient>
        <linearGradient id="leafG2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a8060" />
          <stop offset="100%" stopColor="#1e3d28" />
        </linearGradient>

        {/* Outer petals — deep magenta → blush pink */}
        <linearGradient id="outerPG" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%" stopColor="#7a1245" />
          <stop offset="32%" stopColor="#b83870" />
          <stop offset="72%" stopColor="#d96898" />
          <stop offset="100%" stopColor="#f0a8ca" />
        </linearGradient>

        {/* Inner petals — wine → magenta */}
        <linearGradient id="innerPG" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%" stopColor="#5c0d35" />
          <stop offset="35%" stopColor="#94285c" />
          <stop offset="100%" stopColor="#d070a0" />
        </linearGradient>

        {/* Sepal green */}
        <linearGradient id="sepalG" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%" stopColor="#1e3d28" />
          <stop offset="100%" stopColor="#3d7050" />
        </linearGradient>

        {/* Subtle petal highlight vein */}
        <linearGradient id="veinG" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>

        {/* Soft inner glow filter */}
        <filter id="softG" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ══════════════════════════════════════
          STEM — pathLength animation
          ══════════════════════════════════════ */}
      {visible && (
        <motion.path
          d="M 100 358 Q 97 328 99 298 Q 101 268 99 238 Q 97 210 100 185"
          stroke="url(#stemG)"
          strokeWidth="6.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 2.6, ease: bloom },
            opacity: { duration: 0.35 },
          }}
        />
      )}

      {/* Ground shadow */}
      {visible && (
        <motion.ellipse
          cx="100"
          cy="362"
          rx="28"
          ry="6"
          fill="rgba(0,0,0,0.28)"
          initial={{ opacity: 0, scaleX: 0.1 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1.6, delay: 0.3, ease: bloom }}
          style={{ transformOrigin: '100px 362px' }}
        />
      )}

      {/* ══════════════════════════════════════
          LEFT LEAF
          ══════════════════════════════════════ */}
      {visible && (
        <motion.path
          d="M 99 268 Q 70 254, 50 230 Q 56 222, 67 226 Q 86 240, 99 260 Z"
          fill="url(#leafG)"
          stroke="#1a3222"
          strokeWidth="0.6"
          style={{ transformOrigin: '99px 260px' }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 2.0, delay: 1.6, ease: bloom }}
        />
      )}

      {/* ══════════════════════════════════════
          RIGHT LEAF
          ══════════════════════════════════════ */}
      {visible && (
        <motion.path
          d="M 101 300 Q 134 282, 154 260 Q 160 254, 162 262 Q 146 272, 101 296 Z"
          fill="url(#leafG2)"
          stroke="#1a3222"
          strokeWidth="0.6"
          style={{ transformOrigin: '101px 296px' }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 2.0, delay: 2.1, ease: bloom }}
        />
      )}

      {/* ══════════════════════════════════════
          SEPALS (green calyx base)
          ══════════════════════════════════════ */}
      {visible && (
        <motion.g
          style={{ transformOrigin: '100px 172px' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.1, delay: 2.6, ease: bloom }}
        >
          {SEPAL_ROTATIONS.map((rot, i) => (
            <path
              key={i}
              d={SEPAL}
              transform={`rotate(${rot}, 100, 164)`}
              fill="url(#sepalG)"
              opacity="0.75"
            />
          ))}
        </motion.g>
      )}

      {/* ══════════════════════════════════════
          OUTER PETALS (3) — blooming one by one
          ══════════════════════════════════════ */}
      {visible && (
        <motion.g
          style={{ transformOrigin: '100px 164px' }}
          animate={
            breathe
              ? {
                  scale: [1, 1.026, 1],
                }
              : { scale: 1 }
          }
          transition={
            breathe
              ? { duration: 3.8, repeat: Infinity, ease: 'easeInOut' }
              : {}
          }
        >
          {OUTER_ROTATIONS.map((rot, i) => (
            <motion.g
              key={`op-${i}`}
              style={{ transformOrigin: '100px 164px' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 1.5,
                delay: 3.2 + i * 0.32,
                ease: bloom,
              }}
            >
              {/* Main petal body */}
              <path
                d={OUTER_PETAL}
                transform={`rotate(${rot}, 100, 164)`}
                fill="url(#outerPG)"
                opacity="0.96"
                filter="url(#softG)"
              />
              {/* Central vein highlight */}
              <line
                x1="100"
                y1="164"
                x2={100 + 2 * Math.sin((rot * Math.PI) / 180)}
                y2={164 - 84 * Math.cos((rot * Math.PI) / 180)}
                transform={`rotate(${rot}, 100, 164)`}
                stroke="url(#veinG)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </motion.g>
          ))}
        </motion.g>
      )}

      {/* ══════════════════════════════════════
          INNER PETALS (3)
          ══════════════════════════════════════ */}
      {visible && (
        <motion.g
          style={{ transformOrigin: '100px 164px' }}
          animate={
            breathe
              ? { scale: [1, 1.03, 1] }
              : { scale: 1 }
          }
          transition={
            breathe
              ? { duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }
              : {}
          }
        >
          {INNER_ROTATIONS.map((rot, i) => (
            <motion.g
              key={`ip-${i}`}
              style={{ transformOrigin: '100px 164px' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 0.88, opacity: 1 }}
              transition={{
                duration: 1.4,
                delay: 3.8 + i * 0.26,
                ease: bloom,
              }}
            >
              <path
                d={INNER_PETAL}
                transform={`rotate(${rot}, 100, 164)`}
                fill="url(#innerPG)"
                opacity="0.92"
              />
              <line
                x1="100"
                y1="164"
                x2={100 + 1.5 * Math.sin((rot * Math.PI) / 180)}
                y2={164 - 70 * Math.cos((rot * Math.PI) / 180)}
                transform={`rotate(${rot}, 100, 164)`}
                stroke="url(#veinG)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </motion.g>
          ))}
        </motion.g>
      )}

      {/* ══════════════════════════════════════
          STAMEN & PISTIL (golden centre)
          ══════════════════════════════════════ */}
      {visible && (
        <motion.g
          style={{ transformOrigin: '100px 156px' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, delay: 5.2, ease: 'easeOut' }}
        >
          {STAMEN_ANGLES.map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const cx = 100 + 8 * Math.sin(rad);
            const cy = 156 - 8 * Math.cos(rad);
            return (
              <React.Fragment key={i}>
                <line
                  x1="100"
                  y1="163"
                  x2={cx}
                  y2={cy}
                  stroke="rgba(160,110,10,0.5)"
                  strokeWidth="0.8"
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r="2.4"
                  fill="rgba(245,210,50,0.95)"
                  style={{
                    filter: 'drop-shadow(0 0 4px rgba(245,215,100,0.85))',
                  }}
                />
              </React.Fragment>
            );
          })}
          {/* Central pistil */}
          <circle
            cx="100"
            cy="155"
            r="3.8"
            fill="rgba(220,175,35,0.95)"
            style={{
              filter: 'drop-shadow(0 0 5px rgba(245,215,100,0.95))',
            }}
          />
        </motion.g>
      )}
    </svg>
  );
}
