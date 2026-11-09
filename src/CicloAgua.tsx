import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const AGUA_W = 1920;
export const AGUA_H = 1080;
export const AGUA_FPS = 30;
export const AGUA_DURATION = 1200; // 40 s

// Fases (en frames)
const INTRO_END = 120;
const EVAP: [number, number] = [120, 390];
const COND: [number, number] = [390, 630];
const PREC: [number, number] = [630, 870];
const ESC: [number, number] = [870, 1140];
const OUTRO_START = 1140;

const FONT = 'Inter, Helvetica, Arial, sans-serif';

const ramp = (f: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(f, [a, b], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const window_ = (f: number, start: number, end: number, fade = 20) =>
  Math.min(ramp(f, start, start + fade), ramp(f, end - fade, end, 1, 0));

const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Superficie del terreno (montaña a la derecha, mar a la izquierda)
const SURFACE: [number, number][] = [
  [800, 820],
  [1000, 780],
  [1450, 430],
  [1700, 600],
  [1920, 700],
];
const groundY = (x: number) => {
  for (let i = 0; i < SURFACE.length - 1; i++) {
    const [x0, y0] = SURFACE[i];
    const [x1, y1] = SURFACE[i + 1];
    if (x >= x0 && x <= x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return 820;
};

const CLOUD = {x: 1430, y: 270};
const CLOUD_PUFFS: [number, number, number][] = [
  [-110, 25, 70],
  [-45, -20, 92],
  [50, -12, 82],
  [120, 28, 66],
  [0, 34, 82],
];

const PHASES = [
  {
    range: EVAP,
    title: '1 · Evaporación',
    text: 'El calor del Sol convierte el agua del mar en vapor, que sube a la atmósfera.',
    color: '#ffb703',
  },
  {
    range: COND,
    title: '2 · Condensación',
    text: 'Al subir se enfría y el vapor se condensa en diminutas gotas: se forman las nubes.',
    color: '#8ecae6',
  },
  {
    range: PREC,
    title: '3 · Precipitación',
    text: 'Cuando las gotas pesan demasiado, caen como lluvia, nieve o granizo.',
    color: '#4895ef',
  },
  {
    range: ESC,
    title: '4 · Escorrentía e infiltración',
    text: 'El agua baja por los ríos hacia el mar o se filtra en el suelo y forma aguas subterráneas.',
    color: '#2ec4b6',
  },
];

const Label: React.FC<{x: number; y: number; text: string; opacity: number}> = ({
  x,
  y,
  text,
  opacity,
}) => (
  <text
    x={x}
    y={y}
    opacity={opacity}
    fontFamily={FONT}
    fontWeight={700}
    fontSize={34}
    fill="#fff"
    stroke="rgba(10,30,60,0.75)"
    strokeWidth={7}
    paintOrder="stroke"
    textAnchor="middle"
  >
    {text}
  </text>
);

export const CicloAgua: React.FC = () => {
  const f = useCurrentFrame();

  // --- Cielo ---
  const rainDark = window_(f, PREC[0] - 20, ESC[0] + 40, 40) * 0.3;

  // --- Sol ---
  const sunScale = 1 + 0.15 * window_(f, EVAP[0], COND[0], 30) + 0.03 * Math.sin(f / 9);
  const rayRot = f * 0.4;

  // --- Mar ---
  const wave = (x: number, k: number, amp: number, base: number) =>
    base + amp * Math.sin(x / 60 + f / 12 + k);
  let seaPath = 'M0 1080 ';
  let sea2Path = 'M0 1080 ';
  for (let x = 0; x <= 840; x += 20) {
    seaPath += `L${x} ${wave(x, 0, 8, 800).toFixed(1)} `;
    sea2Path += `L${x} ${wave(x, 2, 6, 822).toFixed(1)} `;
  }
  seaPath += 'L840 1080 Z';
  sea2Path += 'L840 1080 Z';

  // --- Nube ---
  const cloudScale = ramp(f, 270, 630, 0.2, 1) * (1 - 0.15 * ramp(f, ESC[0], ESC[0] + 120));
  const cloudOpacity = ramp(f, 270, 330);
  const grey = Math.round(255 - 85 * window_(f, 660, 940, 50));
  const cloudFill = `rgb(${grey},${grey},${Math.min(255, grey + 8)})`;

  // --- Vapor ---
  const vaporAlpha = window_(f, EVAP[0] + 10, PREC[0] + 30, 30);
  const vapor = Array.from({length: 38}, (_, i) => {
    const sx = 40 + rnd(i, 2) * 740;
    const t = (f * 0.0038 + rnd(i, 1)) % 1;
    const tx = CLOUD.x + (rnd(i, 6) - 0.5) * 220;
    const x = sx + (tx - sx) * Math.pow(t, 1.6) + Math.sin(t * 12 + i) * 14;
    const y = 800 - t * (800 - (CLOUD.y + 40));
    const a = vaporAlpha * Math.sin(Math.PI * t) * 0.85;
    return {x, y, r: 5 + rnd(i, 7) * 5, a};
  });

  // --- Lluvia ---
  const rainAlpha = window_(f, PREC[0] + 10, ESC[0] + 10, 20);
  const drops = Array.from({length: 80}, (_, i) => {
    const x = 1270 + rnd(i, 3) * 330;
    const t = (f * 0.022 * (0.8 + 0.4 * rnd(i, 4)) + rnd(i, 5)) % 1;
    const y0 = CLOUD.y + 100;
    const y = y0 + t * (groundY(x) - y0);
    return {x, y, t};
  });

  // --- Río y agua subterránea ---
  const river = ramp(f, 800, 1010);
  const water = ramp(f, 900, 1070);
  const infAlpha = window_(f, ESC[0] + 20, OUTRO_START + 20, 25);
  const seep = Array.from({length: 26}, (_, i) => {
    const x = 1050 + rnd(i, 8) * 620;
    const t = (f * 0.0055 + rnd(i, 9)) % 1;
    const surf = groundY(x) + 12;
    return {x, y: surf + t * (985 - surf), a: infAlpha * Math.sin(Math.PI * t)};
  });

  // --- Intro / outro ---
  const introOverlay = ramp(f, 80, INTRO_END, 0.8, 0);
  const introText = window_(f, 0, 110, 20);
  const outroOverlay = ramp(f, OUTRO_START, OUTRO_START + 40, 0, 0.6);
  const outroText = ramp(f, OUTRO_START + 15, OUTRO_START + 45);

  const progress = f / AGUA_DURATION;

  return (
    <AbsoluteFill style={{background: 'linear-gradient(#6ab9ee, #dff3ff)', fontFamily: FONT}}>
      <AbsoluteFill style={{background: '#0b1d3a', opacity: rainDark}} />

      <svg width={AGUA_W} height={AGUA_H} viewBox={`0 0 ${AGUA_W} ${AGUA_H}`} style={{position: 'absolute'}}>
        <defs>
          <radialGradient id="sunGlow">
            <stop offset="0%" stopColor="#fff3b0" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#fff3b0" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a8fe0" />
            <stop offset="100%" stopColor="#0a4a96" />
          </linearGradient>
          <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6f8f4a" />
            <stop offset="45%" stopColor="#7a5a3d" />
            <stop offset="100%" stopColor="#4a3322" />
          </linearGradient>
          <mask id="riverMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080">
            <path d="M1400 470 C1330 560 1200 600 1100 720 S900 800 800 832" pathLength={1} fill="none" stroke="#fff" strokeWidth={20} strokeLinecap="round" strokeDasharray={1} strokeDashoffset={1 - river} />
          </mask>
          <mask id="gwMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080">
            <path d="M1560 1000 C1350 1020 1050 975 800 960" pathLength={1} fill="none" stroke="#fff" strokeWidth={26} strokeLinecap="round" strokeDasharray={1} strokeDashoffset={1 - water} />
          </mask>
        </defs>

        {/* Sol */}
        <g transform={`translate(220 200) scale(${sunScale})`}>
          <circle r={190} fill="url(#sunGlow)" />
          <g transform={`rotate(${rayRot})`} stroke="#ffd23f" strokeWidth={10} strokeLinecap="round">
            {Array.from({length: 12}, (_, i) => (
              <line key={i} x1={0} y1={-95} x2={0} y2={-125} transform={`rotate(${i * 30})`} />
            ))}
          </g>
          <circle r={72} fill="#ffd23f" />
        </g>

        {/* Mar */}
        <path d={seaPath} fill="url(#sea)" />
        <path d={sea2Path} fill="#1b6fc2" opacity={0.45} />

        {/* Tierra */}
        <polygon
          points={`${SURFACE.map((p) => p.join(',')).join(' ')} 1920,1080 800,1080`}
          fill="url(#land)"
        />
        <polyline
          points={SURFACE.map((p) => p.join(',')).join(' ')}
          fill="none"
          stroke="#4f9a3f"
          strokeWidth={14}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path d="M1450 430 L1360 500 L1405 485 L1450 515 L1500 485 L1560 505 Z" fill="#f4f9ff" />
        {[1090, 1190, 1640, 1780].map((x) => {
          const y = groundY(x);
          return (
            <g key={x} transform={`translate(${x} ${y})`}>
              <rect x={-5} y={-8} width={10} height={22} fill="#5b3a21" />
              <polygon points="0,-78 -28,-8 28,-8" fill="#2f7d3a" />
              <polygon points="0,-100 -20,-48 20,-48" fill="#3c9447" />
            </g>
          );
        })}
        <rect x={800} y={920} width={1120} height={160} fill="#2a1c10" opacity={0.45} />

        {/* Agua subterránea */}
        <path
          d="M1560 1000 C1350 1020 1050 975 800 960"
          pathLength={1}
          fill="none"
          stroke="#3aa0ff"
          strokeWidth={22}
          strokeLinecap="round"
          strokeDasharray={1}
          strokeDashoffset={1 - water}
          opacity={0.85}
        />
        <g mask="url(#gwMask)">
          <path
            d="M1560 1000 C1350 1020 1050 975 800 960"
            pathLength={1}
            fill="none"
            stroke="#fff"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray="0.02 0.05"
            strokeDashoffset={f * 0.004}
            opacity={0.6}
          />
        </g>
        {seep.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={6} fill="#5db8ff" opacity={s.a} />
        ))}

        {/* Río */}
        <path
          d="M1400 470 C1330 560 1200 600 1100 720 S900 800 800 832"
          pathLength={1}
          fill="none"
          stroke="#2f95e6"
          strokeWidth={16}
          strokeLinecap="round"
          strokeDasharray={1}
          strokeDashoffset={1 - river}
        />
        <g mask="url(#riverMask)">
          <path
            d="M1400 470 C1330 560 1200 600 1100 720 S900 800 800 832"
            pathLength={1}
            fill="none"
            stroke="#fff"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray="0.02 0.05"
            strokeDashoffset={f * 0.004}
            opacity={0.6}
          />
        </g>

        {/* Vapor */}
        {vapor.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#fff" opacity={p.a} />
        ))}

        {/* Nube */}
        <g
          transform={`translate(${CLOUD.x} ${CLOUD.y + 6 * Math.sin(f / 25)}) scale(${cloudScale})`}
          opacity={cloudOpacity}
          fill={cloudFill}
        >
          {CLOUD_PUFFS.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} />
          ))}
          <rect x={-110} y={30} width={230} height={50} />
        </g>

        {/* Lluvia */}
        {drops.map((d, i) => (
          <line
            key={i}
            x1={d.x}
            y1={d.y}
            x2={d.x - 4}
            y2={d.y + 22}
            stroke="#3aa0ff"
            strokeWidth={4}
            strokeLinecap="round"
            opacity={rainAlpha * Math.min(1, d.t * 8)}
          />
        ))}

        {/* Etiquetas */}
        <Label x={300} y={960} text="Mar" opacity={ramp(f, 100, 140)} />
        <Label x={520} y={520} text="Vapor de agua" opacity={window_(f, 160, 560, 30)} />
        <Label x={1700} y={440} text="Lluvia" opacity={window_(f, PREC[0] + 30, PREC[1] - 20, 20) * (f > 0 ? 1 : 0)} />
        <Label x={1010} y={650} text="Río" opacity={ramp(f, 950, 990)} />
        <Label x={1280} y={1058} text="Agua subterránea" opacity={ramp(f, 1000, 1040)} />
      </svg>

      {/* Barra de progreso */}
      <div style={{position: 'absolute', left: 0, top: 0, height: 8, width: AGUA_W * progress, background: '#ffb703'}} />

      {/* Subtítulos por fase */}
      {PHASES.map((p) => {
        const o = window_(f, p.range[0], p.range[1], 18);
        if (o <= 0) return null;
        return (
          <div
            key={p.title}
            style={{
              position: 'absolute',
              left: 400,
              top: 34,
              width: 780,
              padding: '20px 28px',
              borderRadius: 22,
              background: 'rgba(10,30,60,0.78)',
              borderLeft: `10px solid ${p.color}`,
              opacity: o,
              transform: `translateY(${(1 - o) * 14}px)`,
              color: '#fff',
            }}
          >
            <div style={{fontSize: 48, fontWeight: 800, color: p.color, marginBottom: 6}}>{p.title}</div>
            <div style={{fontSize: 29, lineHeight: 1.3}}>{p.text}</div>
          </div>
        );
      })}

      {/* Intro */}
      <AbsoluteFill style={{background: '#0b2a55', opacity: introOverlay, alignItems: 'center', justifyContent: 'center'}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: introText, color: '#fff', textAlign: 'center'}}>
        <div style={{fontSize: 132, fontWeight: 800, textShadow: '0 6px 30px rgba(0,0,0,0.5)'}}>El ciclo del agua</div>
        <div style={{fontSize: 46, marginTop: 14, textShadow: '0 4px 20px rgba(0,0,0,0.5)'}}>
          Cómo viaja el agua por nuestro planeta
        </div>
      </AbsoluteFill>

      {/* Cierre */}
      <AbsoluteFill style={{background: '#0b2a55', opacity: outroOverlay}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: outroText, color: '#fff', textAlign: 'center'}}>
        <div style={{fontSize: 96, fontWeight: 800, textShadow: '0 6px 30px rgba(0,0,0,0.5)'}}>
          Y el ciclo vuelve a empezar
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
