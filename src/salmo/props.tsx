import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, H, Ink, Line, W, cloudPath, ease, rand} from './ink';

export const GROUND_TOP = 1250;
export const FEET_Y = 1400;
const HORIZON = 1100;

// Factor de velocidad en perspectiva respecto a la altura de los pies
export const depthFactor = (y: number) => (y - HORIZON) / (FEET_Y - HORIZON);

/* ---------- suelo ---------- */

export const Ground: React.FC<{color?: string; wipeColor?: string; wipe?: number}> = ({
  color = C.ochre,
  wipeColor = C.lime,
  wipe = 0,
}) => (
  <g>
    <rect x={-20} y={GROUND_TOP} width={W + 40} height={H - GROUND_TOP + 20} fill={color} />
    {wipe > 0 && (
      <rect x={-20} y={GROUND_TOP} width={(W + 40) * wipe} height={H - GROUND_TOP + 20} fill={wipeColor} />
    )}
    <Line d={`M -20 ${GROUND_TOP} L ${W + 20} ${GROUND_TOP - 2}`} w={4} />
  </g>
);

// Marca de hierba: tres trazos en "M" como en la referencia
export const GrassMark: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <Line d="M -16 0 Q -20 -34 -10 -48 M -2 0 Q -2 -40 4 -56 M 12 0 Q 16 -30 24 -42" w={5} />
  </g>
);

// Elementos del suelo que pasan hacia atrás según la distancia recorrida
export const GroundScroll: React.FC<{
  offset: number;
  seed?: number;
  rows?: Array<{y: number; n: number; s: number}>;
  color?: string;
}> = ({offset, seed = 5, rows, color = C.ink}) => {
  const tile = 1500;
  const spec = rows ?? [
    {y: 1330, n: 4, s: 0.8},
    {y: 1500, n: 4, s: 1.1},
    {y: 1660, n: 3, s: 1.5},
    {y: 1800, n: 3, s: 1.9},
  ];
  return (
    <g>
      {spec.map((row, ri) => {
        const r = rand(seed + ri * 17);
        const f = depthFactor(row.y);
        return Array.from({length: row.n}, (_, i) => {
          const base = (i + r()) * (tile / row.n);
          const x = ((((base - offset * f) % tile) + tile) % tile) - 220;
          const kind = i % 3;
          return kind === 2 ? (
            <g key={`${ri}-${i}`} transform={`translate(${x},${row.y})`}>
              <Line d="M -14 0 L 14 -2" w={4} color={color} />
              <circle cx={-26} cy={-6} r={3.5} fill={color} />
              <circle cx={30} cy={-8} r={3} fill={color} />
            </g>
          ) : (
            <g key={`${ri}-${i}`} style={{color}}>
              <GrassMark x={x} y={row.y} s={row.s} />
            </g>
          );
        });
      })}
    </g>
  );
};

/* ---------- cielo ---------- */

export const SkyCloud: React.FC<{x: number; y: number; s?: number; fill?: string}> = ({x, y, s = 1, fill = C.blue}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <Ink d={cloudPath(0, 0, 150, 70, 7, 26)} fill={fill} shade={fill} />
  </g>
);

export const Sun: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 90}) => (
  <g>
    <circle cx={x} cy={y} r={r * 1.5} fill={C.yellow} opacity={0.4} />
    <Ink d={`M ${x - r} ${y} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`} fill={C.yellow} fillOff={[6, 6]} />
    <Line d={`M ${x - r * 0.35} ${y - r * 0.2} Q ${x} ${y + r * 0.1} ${x + r * 0.35} ${y - r * 0.2}`} w={4} />
  </g>
);

export const Moon: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 80}) => (
  <g>
    <circle cx={x} cy={y} r={r * 1.45} fill={C.blue} opacity={0.4} />
    <Ink
      d={`M ${x + r * 0.2} ${y - r} A ${r} ${r} 0 1 0 ${x + r * 0.2} ${y + r} A ${r * 0.72} ${r * 0.9} 0 1 1 ${x + r * 0.2} ${y - r} Z`}
      fill={C.blue}
      fillOff={[6, 6]}
    />
  </g>
);

export const Sparkles: React.FC<{cx: number; cy: number; start: number}> = ({cx, cy, start}) => {
  const f = useCurrentFrame();
  const pts: Array<[number, number, number]> = [
    [-120, -40, 0],
    [-50, -120, 6],
    [60, -90, 12],
    [130, -20, 3],
    [10, -170, 9],
  ];
  return (
    <g>
      {pts.map(([dx, dy, d], i) => {
        const t = (f - start - d) / 26;
        if (t < 0) return null;
        const p = t % 1;
        const sc = Math.sin(p * Math.PI);
        return (
          <g key={i} transform={`translate(${cx + dx},${cy + dy - p * 24}) scale(${sc})`}>
            <Line d="M 0 -26 L 0 26 M -26 0 L 26 0" w={9} color={C.ink} />
            <Line d="M 0 -22 L 0 22 M -22 0 L 22 0" w={4} color={C.yellow} />
          </g>
        );
      })}
    </g>
  );
};

/* ---------- valle oscuro ---------- */

export const Hill: React.FC<{side: 'left' | 'right'; grow: number}> = ({side, grow}) => {
  const base = GROUND_TOP + 6;
  const top = base - 700 * grow;
  const d =
    side === 'left'
      ? `M -60 ${base} L -60 ${top - 120} Q 120 ${top - 160} 260 ${top + 120} Q 380 ${base - 220} 470 ${base} Z`
      : `M ${W + 60} ${base} L ${W + 60} ${top - 80} Q ${W - 120} ${top - 140} ${W - 260} ${top + 140} Q ${W - 380} ${base - 200} ${W - 480} ${base} Z`;
  return <Ink d={d} fill={C.purple} shade="#8a6cc0" shadeOff={[side === 'left' ? 14 : -14, 0]} />;
};

/* ---------- agua ---------- */

export const Pond: React.FC<{cx: number; cy: number; rx: number; ry: number; grow: number}> = ({cx, cy, rx, ry, grow}) => {
  const f = useCurrentFrame();
  const r = rx * grow;
  const q = ry * grow;
  const ripple = (k: number) => {
    const p = ((f / 40 + k) % 1);
    return (
      <ellipse key={k} cx={cx - 30} cy={cy + 6} rx={r * 0.12 + p * r * 0.45} ry={q * 0.12 + p * q * 0.45} fill="none" stroke={C.ink} strokeWidth={4} opacity={(1 - p) * grow} />
    );
  };
  return (
    <g>
      <Ink d={`M ${cx - r} ${cy} a ${r} ${q} 0 1 0 ${2 * r} 0 a ${r} ${q} 0 1 0 ${-2 * r} 0 Z`} fill={C.blue} shade={C.blue} />
      {grow > 0.6 && [0, 0.5].map(ripple)}
      {grow > 0.6 && (
        <>
          <Line d={`M ${cx + r * 0.2} ${cy - q * 0.4} q 20 -10 40 0 q 20 10 40 0`} w={4} />
          <Line d={`M ${cx - r * 0.6} ${cy + q * 0.35} q 20 -10 40 0 q 20 10 40 0`} w={4} />
        </>
      )}
    </g>
  );
};

/* ---------- mesa ---------- */

export const Table: React.FC<{x: number; y: number; overflow: number}> = ({x, y, overflow}) => {
  const f = useCurrentFrame();
  const drip = (k: number) => {
    const p = ((f / 22 + k * 0.37) % 1) * overflow;
    return <ellipse key={k} cx={x + 96 + (k % 2 ? 14 : -4)} cy={y - 20 + p * 90} rx={7} ry={11} fill={C.purple} opacity={overflow > 0.2 ? 1 - p * 0.4 : 0} />;
  };
  return (
    <g>
      {/* patas */}
      <Ink d={`M ${x - 180} ${y + 24} L ${x - 190} ${FEET_Y + 70} L ${x - 150} ${FEET_Y + 70} L ${x - 140} ${y + 24} Z`} fill={C.ochre} />
      <Ink d={`M ${x + 140} ${y + 24} L ${x + 150} ${FEET_Y + 70} L ${x + 190} ${FEET_Y + 70} L ${x + 180} ${y + 24} Z`} fill={C.ochre} />
      {/* pan */}
      <Ink d={`M ${x - 150} ${y - 6} q 40 -60 100 -50 q 50 6 40 50 Z`} fill={C.ochre} shade="#d79a4c" />
      <Line d={`M ${x - 112} ${y - 40} l 14 22 M ${x - 80} ${y - 46} l 12 24`} w={4} />
      {/* tablero */}
      <Ink d={`M ${x - 230} ${y} L ${x + 230} ${y} L ${x + 230} ${y + 36} L ${x - 230} ${y + 36} Z`} fill="#f3c98a" shade={C.ochre} shadeOff={[0, 10]} />
      {/* copa que rebosa */}
      <Ink d={`M ${x + 60} ${y - 130} L ${x + 150} ${y - 130} L ${x + 132} ${y} L ${x + 78} ${y} Z`} fill={C.yellow} shade={C.yellow} />
      <path
        d={`M ${x + 66} ${y - 112} L ${x + 144} ${y - 112} L ${x + 132} ${y - 4} L ${x + 78} ${y - 4} Z`}
        fill={C.purple}
        opacity={0.0}
      />
      <ellipse cx={x + 105} cy={y - 131} rx={45} ry={9 + overflow * 6} fill={C.purple} stroke={C.ink} strokeWidth={4} />
      {overflow > 0.05 && (
        <>
          <path d={`M ${x + 60} ${y - 131} q -10 ${40 * overflow} -4 ${90 * overflow}`} fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
          <path d={`M ${x + 150} ${y - 131} q 10 ${40 * overflow} 4 ${90 * overflow}`} fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
          {[0, 1, 2, 3].map(drip)}
        </>
      )}
    </g>
  );
};

/* ---------- casa ---------- */

export const House: React.FC<{x: number; y: number; light: number}> = ({x, y, light}) => (
  <g>
    {light > 0 && <circle cx={x + 100} cy={y - 140} r={380 * light} fill={C.yellow} opacity={0.3} />}
    <Ink d={`M ${x} ${y} L ${x} ${y - 330} L ${x + 380} ${y - 330} L ${x + 380} ${y} Z`} fill={C.lilac} shade={C.purple} shadeOff={[12, 0]} />
    <Ink d={`M ${x - 40} ${y - 322} L ${x + 190} ${y - 520} L ${x + 420} ${y - 322} Z`} fill={C.salmon} shade={C.salmonDark} shadeOff={[0, 12]} />
    <Ink d={`M ${x + 40} ${y} L ${x + 40} ${y - 190} Q ${x + 100} ${y - 280} ${x + 160} ${y - 190} L ${x + 160} ${y} Z`} fill={C.yellow} shade={C.yellow} />
    <Ink d={`M ${x + 240} ${y - 250} L ${x + 330} ${y - 250} L ${x + 330} ${y - 160} L ${x + 240} ${y - 160} Z`} fill={C.yellow} />
    <Line d={`M ${x + 285} ${y - 250} L ${x + 285} ${y - 160} M ${x + 240} ${y - 205} L ${x + 330} ${y - 205}`} w={4} />
  </g>
);

export const Infinity: React.FC<{cx: number; cy: number; progress: number}> = ({cx, cy, progress}) => {
  const a = 120;
  const d = `M ${cx} ${cy} C ${cx + a * 0.4} ${cy - a * 0.9} ${cx + a * 1.5} ${cy - a * 0.9} ${cx + a * 1.5} ${cy} C ${cx + a * 1.5} ${cy + a * 0.9} ${cx + a * 0.4} ${cy + a * 0.9} ${cx} ${cy} C ${cx - a * 0.4} ${cy - a * 0.9} ${cx - a * 1.5} ${cy - a * 0.9} ${cx - a * 1.5} ${cy} C ${cx - a * 1.5} ${cy + a * 0.9} ${cx - a * 0.4} ${cy + a * 0.9} ${cx} ${cy}`;
  return (
    <g>
      <path d={d} fill="none" stroke={C.yellow} strokeWidth={26} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} transform="translate(5,5)" />
      <path d={d} fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} />
    </g>
  );
};

export const wobble = (f: number, amp: number, period: number, ph = 0) => Math.sin((f / period) * Math.PI * 2 + ph) * amp;
export { ease };
