import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {loadFont} from '@remotion/google-fonts/AmaticSC';

export const {fontFamily: FONT} = loadFont('normal', {
  weights: ['700'],
  subsets: ['latin', 'latin-ext'],
});

export const W = 1080;
export const H = 1920;

export const C = {
  ink: '#15101a',
  paper: '#fdfcff',
  salmon: '#ff8f86',
  salmonDark: '#f0766f',
  blue: '#aee3f5',
  lilac: '#e2c5fb',
  purple: '#a98ad8',
  yellow: '#fde58a',
  ochre: '#edb96e',
  lime: '#ccf59c',
  cream: '#fff6e6',
  night: '#6b4a8f',
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Interpolación con límites; por defecto sale rápido y frena suave
export const ease = (
  f: number,
  a: number,
  b: number,
  from = 0,
  to = 1,
  easing: (t: number) => number = Easing.out(Easing.cubic)
) =>
  interpolate(f, [a, b], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

export const rand = (seed: number) => {
  let s = Math.floor(seed) % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

/* ---------- trazo irregular tipo lápiz/rotulador ("hirviendo" cada 3 fotogramas) ---------- */

export const RoughDefs: React.FC = () => (
  <defs>
    {[0, 1, 2].map((i) => (
      <filter
        key={i}
        id={`rough${i}`}
        filterUnits="userSpaceOnUse"
        x={-40}
        y={-40}
        width={W + 80}
        height={H + 80}
      >
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={2} seed={i * 13 + 4} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={6} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    ))}
  </defs>
);

export const Sketchy: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  return <g filter={`url(#rough${Math.floor(frame / 3) % 3})`}>{children}</g>;
};

/* ---------- formas con contorno fino y relleno desplazado ---------- */

export const Ink: React.FC<{
  d: string;
  fill?: string;
  shade?: string;
  shadeOff?: [number, number];
  fillOff?: [number, number];
  w?: number;
  stroke?: string;
  opacity?: number;
}> = ({d, fill, shade, shadeOff = [-9, 9], fillOff = [5, 4], w = 5, stroke = C.ink, opacity = 1}) => (
  <g opacity={opacity}>
    {shade && <path d={d} fill={shade} transform={`translate(${shadeOff[0]},${shadeOff[1]})`} />}
    {fill && <path d={d} fill={fill} transform={`translate(${fillOff[0]},${fillOff[1]})`} />}
    <path d={d} fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

export const Line: React.FC<{
  d: string;
  w?: number;
  color?: string;
  opacity?: number;
}> = ({d, w = 5, color = C.ink, opacity = 1}) => (
  <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />
);

type P = [number, number];

// Contorno cerrado de una extremidad a partir de una polilínea y anchos por punto
export const limbPath = (pts: P[], widths: number[]) => {
  const n = pts.length;
  const normals = pts.map((_, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    return [-dy / l, dx / l] as P;
  });
  const side = (sign: number) =>
    pts.map((p, i) => [p[0] + sign * normals[i][0] * (widths[i] / 2), p[1] + sign * normals[i][1] * (widths[i] / 2)] as P);
  const L = side(1);
  const R = side(-1).reverse();
  const dirEnd: P = [pts[n - 1][0] - pts[n - 2][0], pts[n - 1][1] - pts[n - 2][1]];
  const le = Math.hypot(dirEnd[0], dirEnd[1]) || 1;
  const dirStart: P = [pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]];
  const ls = Math.hypot(dirStart[0], dirStart[1]) || 1;
  const tipEnd: P = [
    pts[n - 1][0] + (dirEnd[0] / le) * widths[n - 1] * 0.7,
    pts[n - 1][1] + (dirEnd[1] / le) * widths[n - 1] * 0.7,
  ];
  const tipStart: P = [
    pts[0][0] + (dirStart[0] / ls) * widths[0] * 0.7,
    pts[0][1] + (dirStart[1] / ls) * widths[0] * 0.7,
  ];
  let d = `M ${L[0][0]} ${L[0][1]}`;
  for (let i = 1; i < n; i++) d += ` L ${L[i][0]} ${L[i][1]}`;
  d += ` Q ${tipEnd[0]} ${tipEnd[1]} ${R[0][0]} ${R[0][1]}`;
  for (let i = 1; i < n; i++) d += ` L ${R[i][0]} ${R[i][1]}`;
  d += ` Q ${tipStart[0]} ${tipStart[1]} ${L[0][0]} ${L[0][1]} Z`;
  return d;
};

export const Limb: React.FC<{pts: P[]; widths: number[]; fill: string; shade?: string}> = ({
  pts,
  widths,
  fill,
  shade,
}) => <Ink d={limbPath(pts, widths)} fill={fill} shade={shade} shadeOff={[-5, 6]} />;

// Nube con borde ondulado (círculo de bultos alrededor de una elipse)
export const cloudPath = (cx: number, cy: number, rx: number, ry: number, n: number, bump: number) => {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = cx + Math.cos(a) * rx;
    const y = cy + Math.sin(a) * ry;
    if (i === 0) {
      d += `M ${x} ${y}`;
    } else {
      const am = ((i - 0.5) / n) * Math.PI * 2;
      const qx = cx + Math.cos(am) * (rx + bump);
      const qy = cy + Math.sin(am) * (ry + bump);
      d += ` Q ${qx} ${qy} ${x} ${y}`;
    }
  }
  return d + ' Z';
};

// Garabato continuo, como el humo enredado de la referencia
export const scribblePath = (cx: number, cy: number, rx: number, ry: number, count: number, seed: number) => {
  const r = rand(seed);
  const pts: P[] = [];
  for (let i = 0; i < count; i++) {
    const a = i * 2.4 + r() * 0.8;
    const k = 0.25 + 0.75 * r();
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a * 0.9) * ry * k]);
  }
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q ${pts[i][0]} ${pts[i][1]} ${mx} ${my}`;
  }
  return d;
};

/* ---------- rotulado a mano que se escribe de izquierda a derecha ---------- */

export const Lettering: React.FC<{
  lines: string[];
  x: number;
  y: number;
  size: number;
  start: number;
  perLine?: number;
  color?: string;
  gap?: number;
}> = ({lines, x, y, size, start, perLine = 16, color = C.ink, gap = 1.0}) => {
  const frame = useCurrentFrame();
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <g>
      {lines.map((text, i) => {
        const t0 = start + i * perLine;
        const p = ease(frame, t0, t0 + perLine * 0.95, 0, 1, Easing.inOut(Easing.quad));
        const width = text.length * size * 0.44;
        const left = x - width / 2 - 30;
        const baseY = y + i * size * gap;
        const rise = ease(frame, t0, t0 + 10, 8, 0);
        return (
          <g key={i} opacity={p > 0 ? 1 : 0}>
            <clipPath id={`${uid}c${i}`}>
              <rect x={left} y={baseY - size * 1.1} width={(width + 60) * p} height={size * 1.5} />
            </clipPath>
            <text
              x={x}
              y={baseY + rise}
              textAnchor="middle"
              fontFamily={FONT}
              fontWeight={700}
              fontSize={size}
              fill={color}
              clipPath={`url(#${uid}c${i})`}
              style={{letterSpacing: size * 0.02}}
            >
              {text}
            </text>
          </g>
        );
      })}
    </g>
  );
};
