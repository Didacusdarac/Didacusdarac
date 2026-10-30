import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {DURATION, HEIGHT, WIDTH, rand, speedAtY} from './constants';

/* ---------- helper: capa que se desplaza en bucle sin costuras ---------- */

const Tiles: React.FC<{
  tileW: number;
  speed: number;
  start?: number;
  children: React.ReactNode;
}> = ({tileW, speed, start = 0, children}) => {
  const frame = useCurrentFrame();
  const shift = (frame * speed + start) % tileW;
  const count = Math.ceil(WIDTH / tileW) + 1;
  return (
    <g transform={`translate(${-shift},0)`}>
      {Array.from({length: count}, (_, i) => (
        <g key={i} transform={`translate(${i * tileW},0)`}>
          {children}
        </g>
      ))}
    </g>
  );
};

/* ---------- cielo y sol ---------- */

export const Sky: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="800">
        <stop offset="0" stopColor="#40235e" />
        <stop offset="0.26" stopColor="#9a3a6c" />
        <stop offset="0.52" stopColor="#ea6448" />
        <stop offset="0.78" stopColor="#ffa650" />
        <stop offset="1" stopColor="#ffd27c" />
      </linearGradient>
    </defs>
    <rect width={WIDTH} height={HEIGHT} fill="url(#sky)" />
  </g>
);

export const Sun: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = 1330;
  const cy = interpolate(frame, [0, DURATION], [598, 672], {extrapolateRight: 'clamp'});
  const pulse = Math.sin(frame / 18) * 8;
  return (
    <g>
      <defs>
        <radialGradient id="sunGlow">
          <stop offset="0" stopColor="#fff0b0" stopOpacity="0.9" />
          <stop offset="0.3" stopColor="#ffb95a" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ff7a3c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sunDisc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6c4" />
          <stop offset="1" stopColor="#ffc457" />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={620 + pulse} fill="url(#sunGlow)" />
      <circle cx={cx} cy={cy} r={170 + pulse / 2} fill="#ffe08a" opacity={0.28} />
      <circle cx={cx} cy={cy} r={128} fill="url(#sunDisc)" />
    </g>
  );
};

/* ---------- nubes ---------- */

const Cloud: React.FC<{
  x: number;
  y: number;
  s: number;
  top: string;
  belly: string;
}> = ({x, y, s, top, belly}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-130} y={-8} width={260} height={34} rx={17} fill={belly} />
    <g fill={top}>
      <rect x={-125} y={-22} width={250} height={36} rx={18} />
      <circle cx={-48} cy={-30} r={36} />
      <circle cx={10} cy={-46} r={48} />
      <circle cx={68} cy={-28} r={30} />
    </g>
  </g>
);

export const Clouds: React.FC = () => (
  <g>
    {/* nubes altas, finas y lentas */}
    <Tiles tileW={2400} speed={0.22}>
      <g opacity={0.55}>
        <ellipse cx={260} cy={150} rx={230} ry={14} fill="#f7a1a0" />
        <ellipse cx={700} cy={240} rx={170} ry={11} fill="#f7a1a0" />
        <ellipse cx={1250} cy={120} rx={260} ry={15} fill="#f7a1a0" />
        <ellipse cx={1800} cy={215} rx={200} ry={12} fill="#f7a1a0" />
        <ellipse cx={2200} cy={300} rx={150} ry={10} fill="#f7a1a0" />
      </g>
    </Tiles>
    {/* nubes medias */}
    <Tiles tileW={2600} speed={0.55}>
      <Cloud x={300} y={360} s={1.2} top="#ffb089" belly="#ec6f7c" />
      <Cloud x={980} y={290} s={0.85} top="#ffc08c" belly="#f58680" />
      <Cloud x={1650} y={400} s={1.4} top="#ffb287" belly="#e8667a" />
      <Cloud x={2200} y={320} s={0.7} top="#ffc690" belly="#f78c80" />
    </Tiles>
    {/* nubes bajas junto al horizonte */}
    <Tiles tileW={2200} speed={0.9}>
      <Cloud x={420} y={540} s={0.9} top="#ffc47e" belly="#f78b6a" />
      <Cloud x={1250} y={500} s={0.6} top="#ffd088" belly="#fb9a6c" />
      <Cloud x={1850} y={560} s={0.75} top="#ffc47e" belly="#f78b6a" />
    </Tiles>
  </g>
);

/* ---------- pájaros ---------- */

const Bird: React.FC<{
  x0: number;
  y0: number;
  size: number;
  speed: number;
  offset: number;
}> = ({x0, y0, size, speed, offset}) => {
  const frame = useCurrentFrame();
  const span = WIDTH + 300;
  const x = ((x0 + frame * speed) % span) - 150;
  const y = y0 + Math.sin(frame / 22 + offset) * 10 - (x / WIDTH) * 20;
  const tip = Math.sin(frame * 0.45 + offset * 3) * size * 0.75;
  const lift = tip * 0.15 - size * 0.28;
  return (
    <path
      transform={`translate(${x},${y})`}
      d={`M ${-size} ${-tip} Q ${-size * 0.5} ${lift} 0 0 Q ${size * 0.5} ${lift} ${size} ${-tip}`}
      fill="none"
      stroke="#4e2342"
      strokeWidth={3.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
};

export const Birds: React.FC = () => (
  <g>
    <Bird x0={100} y0={300} size={16} speed={2.6} offset={0} />
    <Bird x0={170} y0={340} size={13} speed={2.6} offset={1.3} />
    <Bird x0={235} y0={285} size={14} speed={2.6} offset={2.2} />
    <Bird x0={300} y0={350} size={11} speed={2.6} offset={0.7} />
    <Bird x0={360} y0={310} size={12} speed={2.6} offset={3.1} />
    <Bird x0={1200} y0={200} size={10} speed={1.8} offset={4.0} />
    <Bird x0={1500} y0={460} size={8} speed={1.5} offset={5.2} />
  </g>
);

/* ---------- montañas ---------- */

const buildMountains = (
  tileW: number,
  count: number,
  topMin: number,
  topMax: number,
  valleyMin: number,
  valleyMax: number,
  seed: number
) => {
  const r = rand(seed);
  const step = tileW / count;
  const valleys: Array<[number, number]> = [];
  for (let i = 0; i < count; i++) {
    valleys.push([i * step, valleyMin + r() * (valleyMax - valleyMin)]);
  }
  valleys.push([tileW, valleys[0][1]]);
  const peaks: Array<[number, number]> = [];
  for (let i = 0; i < count; i++) {
    peaks.push([i * step + step * (0.5 + (r() - 0.5) * 0.3), topMin + r() * (topMax - topMin)]);
  }

  let d = `M ${valleys[0][0]} ${valleys[0][1]}`;
  const shadows: string[] = [];
  for (let i = 0; i < count; i++) {
    const [px, py] = peaks[i];
    const [vx, vy] = valleys[i + 1];
    d += ` L ${px} ${py} L ${vx} ${vy}`;
    const dx = vx - px;
    const dh = vy - py;
    shadows.push(
      [
        [px, py],
        [vx, vy],
        [px + dx * 0.2, vy],
        [px + dx * 0.07, py + dh * 0.62],
        [px + dx * 0.17, py + dh * 0.33],
      ]
        .map(([x, y]) => `${x},${y}`)
        .join(' ')
    );
  }
  d += ` L ${tileW} ${HEIGHT} L 0 ${HEIGHT} Z`;
  return {d, shadows};
};

const MountainLayer: React.FC<{
  speed: number;
  fill: string;
  shade: string;
  count: number;
  top: [number, number];
  valley: [number, number];
  seed: number;
}> = ({speed, fill, shade, count, top, valley, seed}) => {
  const tileW = 2400;
  const {d, shadows} = React.useMemo(
    () => buildMountains(tileW, count, top[0], top[1], valley[0], valley[1], seed),
    [count, top, valley, seed]
  );
  return (
    <Tiles tileW={tileW} speed={speed}>
      <path d={d} fill={fill} />
      {shadows.map((p, i) => (
        <polygon key={i} points={p} fill={shade} />
      ))}
    </Tiles>
  );
};

export const Mountains: React.FC = () => (
  <g>
    <MountainLayer
      speed={0.35}
      fill="#d4627a"
      shade="#c4556f"
      count={6}
      top={[430, 580]}
      valley={[690, 740]}
      seed={11}
    />
    <MountainLayer
      speed={0.8}
      fill="#aa4a6e"
      shade="#983d62"
      count={7}
      top={[560, 680]}
      valley={[760, 800]}
      seed={29}
    />
  </g>
);

/* ---------- colinas ---------- */

const hillPath = (tileW: number, baseY: number, waves: Array<[number, number, number]>) => {
  let d = `M 0 ${HEIGHT}`;
  for (let x = 0; x <= tileW; x += 16) {
    let y = baseY;
    for (const [amp, k, phase] of waves) {
      y -= amp * Math.sin((2 * Math.PI * k * x) / tileW + phase);
    }
    d += ` L ${x} ${y.toFixed(1)}`;
  }
  return d + ` L ${tileW} ${HEIGHT} Z`;
};

const HillLayer: React.FC<{
  speed: number;
  fill: string;
  baseY: number;
  waves: Array<[number, number, number]>;
}> = ({speed, fill, baseY, waves}) => {
  const tileW = 2400;
  const d = React.useMemo(() => hillPath(tileW, baseY, waves), [baseY, waves]);
  return (
    <Tiles tileW={tileW} speed={speed}>
      <path d={d} fill={fill} />
    </Tiles>
  );
};

const BACK_HILLS: Array<[number, number, number]> = [
  [34, 2, 0.4],
  [18, 5, 1.7],
  [8, 9, 0.2],
];
const FRONT_HILLS: Array<[number, number, number]> = [
  [30, 3, 2.4],
  [14, 7, 0.9],
  [6, 12, 3.1],
];

export const Hills: React.FC = () => (
  <g>
    <HillLayer speed={1.8} fill="#8a4062" baseY={768} waves={BACK_HILLS} />
    <HillLayer speed={3.4} fill="#6d3a56" baseY={822} waves={FRONT_HILLS} />
    {/* neblina cálida del horizonte */}
    <defs>
      <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffb860" stopOpacity="0" />
        <stop offset="0.6" stopColor="#ffb860" stopOpacity="0.22" />
        <stop offset="1" stopColor="#ffb860" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect x={0} y={600} width={WIDTH} height={300} fill="url(#haze)" />
  </g>
);

/* ---------- árboles ---------- */

const RoundTree: React.FC<{x: number; y: number; s: number; c: string; hi: string}> = ({x, y, s, c, hi}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-9} y={-112} width={18} height={114} rx={4} fill={c} />
    <g fill={c}>
      <circle cx={0} cy={-170} r={70} />
      <circle cx={-52} cy={-135} r={48} />
      <circle cx={55} cy={-140} r={52} />
      <circle cx={22} cy={-200} r={48} />
    </g>
    <circle cx={34} cy={-190} r={30} fill={hi} opacity={0.14} />
    <circle cx={64} cy={-146} r={26} fill={hi} opacity={0.1} />
  </g>
);

const PineTree: React.FC<{x: number; y: number; s: number; c: string; hi: string}> = ({x, y, s, c, hi}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-8} y={-60} width={16} height={62} fill={c} />
    {[
      {w: 130, top: -150, bottom: -52},
      {w: 108, top: -225, bottom: -118},
      {w: 80, top: -300, bottom: -196},
    ].map((t, i) => (
      <g key={i}>
        <polygon points={`0,${t.top} ${t.w / 2},${t.bottom} ${-t.w / 2},${t.bottom}`} fill={c} />
        <polygon
          points={`0,${t.top} ${t.w / 2},${t.bottom} ${t.w / 8},${t.bottom}`}
          fill={hi}
          opacity={0.26}
        />
      </g>
    ))}
  </g>
);

type TreeSpec = {x: number; kind: 'round' | 'pine'; s: number};

const TREES: TreeSpec[] = [
  {x: 180, kind: 'round', s: 1.0},
  {x: 430, kind: 'pine', s: 1.25},
  {x: 640, kind: 'round', s: 0.8},
  {x: 960, kind: 'pine', s: 1.0},
  {x: 1260, kind: 'round', s: 1.2},
  {x: 1540, kind: 'pine', s: 0.9},
  {x: 1780, kind: 'round', s: 0.9},
  {x: 2050, kind: 'pine', s: 1.15},
];

const TreeRow: React.FC<{
  y: number;
  scale: number;
  color: string;
  hi: string;
  tileW: number;
  start?: number;
}> = ({y, scale, color, hi, tileW, start = 0}) => (
  <Tiles tileW={tileW} speed={speedAtY(y)} start={start}>
    {TREES.map((t, i) =>
      t.kind === 'round' ? (
        <RoundTree key={i} x={t.x * (tileW / 2250)} y={y} s={t.s * scale} c={color} hi={hi} />
      ) : (
        <PineTree key={i} x={t.x * (tileW / 2250)} y={y} s={t.s * scale} c={color} hi={hi} />
      )
    )}
  </Tiles>
);

export const FarTrees: React.FC = () => (
  <TreeRow y={866} scale={0.42} color="#57304c" hi="#ff9a5a" tileW={1500} start={300} />
);

export const NearTrees: React.FC = () => (
  <TreeRow y={888} scale={1} color="#3e2442" hi="#ff9a52" tileW={2250} />
);

/* ---------- campo ---------- */

export const Field: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="field" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#c98b3a" />
        <stop offset="0.5" stopColor="#a96a2e" />
        <stop offset="1" stopColor="#7a4426" />
      </linearGradient>
      <linearGradient id="trail" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e2a85a" stopOpacity="0" />
        <stop offset="0.3" stopColor="#e2a85a" stopOpacity="0.55" />
        <stop offset="0.7" stopColor="#e2a85a" stopOpacity="0.55" />
        <stop offset="1" stopColor="#e2a85a" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect x={0} y={858} width={WIDTH} height={HEIGHT - 858} fill="url(#field)" />
    <rect x={0} y={925} width={WIDTH} height={110} fill="url(#trail)" />
  </g>
);

// Rayas y piedrecillas que se mueven con la velocidad del suelo (marcan el avance)
export const GroundDetail: React.FC = () => {
  const rows = [
    {y: 884, rx: 70, op: 0.14, seed: 3, n: 6},
    {y: 918, rx: 95, op: 0.16, seed: 5, n: 5},
    {y: 952, rx: 60, op: 0.3, seed: 7, n: 8},
    {y: 1012, rx: 70, op: 0.3, seed: 9, n: 7},
    {y: 1050, rx: 150, op: 0.16, seed: 13, n: 4},
  ];
  const tileW = 1800;
  return (
    <g>
      {rows.map((row) => {
        const r = rand(row.seed);
        const items = Array.from({length: row.n}, (_, i) => ({
          x: (i + r() * 0.8) * (tileW / row.n),
          rx: row.rx * (0.6 + r() * 0.8),
        }));
        return (
          <Tiles key={row.y} tileW={tileW} speed={speedAtY(row.y)}>
            {items.map((it, i) => (
              <ellipse
                key={i}
                cx={it.x}
                cy={row.y}
                rx={it.rx}
                ry={row.rx > 100 ? 7 : 4.5}
                fill={row.op > 0.2 ? '#f0c27a' : '#ffd38a'}
                opacity={row.op}
              />
            ))}
          </Tiles>
        );
      })}
    </g>
  );
};

/* ---------- hierba ---------- */

const Tuft: React.FC<{
  x: number;
  y: number;
  s: number;
  color: string;
  phase: number;
}> = ({x, y, s, color, phase}) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 14 + phase) * 5;
  const blades: Array<[number, number, number]> = [
    [-12, -34, -12],
    [-6, -52, -5],
    [0, -64, 2],
    [6, -50, 8],
    [12, -32, 14],
  ];
  return (
    <g transform={`translate(${x},${y}) scale(${s}) rotate(${sway})`}>
      {blades.map(([bx, h, lean], i) => (
        <path
          key={i}
          d={`M ${bx - 5} 0 Q ${bx + lean * 0.3} ${h * 0.55} ${bx + lean} ${h} Q ${bx + 3} ${h * 0.5} ${bx + 5} 0 Z`}
          fill={color}
        />
      ))}
    </g>
  );
};

const TuftRow: React.FC<{
  y: number;
  n: number;
  scale: [number, number];
  color: string;
  seed: number;
  tileW?: number;
  yJitter?: number;
}> = ({y, n, scale, color, seed, tileW = 1900, yJitter = 0}) => {
  const items = React.useMemo(() => {
    const r = rand(seed);
    return Array.from({length: n}, (_, i) => ({
      x: (i + 0.15 + r() * 0.7) * (tileW / n),
      y: y + (r() - 0.5) * yJitter,
      s: scale[0] + r() * (scale[1] - scale[0]),
      phase: r() * 6,
    }));
  }, [n, scale, seed, tileW, y, yJitter]);
  return (
    <Tiles tileW={tileW} speed={speedAtY(y)}>
      {items.map((it, i) => (
        <Tuft key={i} x={it.x} y={it.y} s={it.s} color={color} phase={it.phase} />
      ))}
    </Tiles>
  );
};

// Hierba que queda detrás del caminante
export const BackGrass: React.FC = () => (
  <g>
    <TuftRow y={896} n={22} scale={[0.7, 1.1]} color="#d79a42" seed={21} yJitter={14} />
    <TuftRow y={934} n={14} scale={[0.9, 1.4]} color="#e8ae52" seed={33} yJitter={14} />
  </g>
);

// Hierba al borde inferior, por delante (profundidad)
export const FrontGrass: React.FC = () => (
  <g>
    <TuftRow y={1080} n={8} scale={[1.8, 2.8]} color="#5a2f26" seed={47} tileW={2000} yJitter={20} />
    <TuftRow y={1072} n={5} scale={[1.4, 2.0]} color="#7b4128" seed={61} tileW={2000} yJitter={14} />
  </g>
);

/* ---------- ambiente final ---------- */

export const Grade: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 15, DURATION - 15, DURATION], [1, 0, 0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <g>
      <defs>
        <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.55" stopColor="#2a0f2e" stopOpacity="0" />
          <stop offset="1" stopColor="#2a0f2e" stopOpacity="0.42" />
        </radialGradient>
        <linearGradient id="warm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff8a3c" stopOpacity="0" />
          <stop offset="1" stopColor="#ff8a3c" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="url(#warm)" />
      <rect width={WIDTH} height={HEIGHT} fill="url(#vignette)" />
      <rect width={WIDTH} height={HEIGHT} fill="#1b0a1d" opacity={fade} />
    </g>
  );
};

