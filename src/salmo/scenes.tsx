import React from 'react';
import {Easing, interpolateColors, useCurrentFrame} from 'remotion';
import {C, H, Lettering, W, ease, scribblePath} from './ink';
import {Person, Sheep} from './figures';
import {
  FEET_Y,
  GROUND_TOP,
  Ground,
  GroundScroll,
  Hill,
  House,
  Infinity,
  Moon,
  Pond,
  SkyCloud,
  Sparkles,
  Sun,
  Table,
  wobble,
} from './props';

// Ciclo de caminata: 36 fotogramas, zancada de 22° → el suelo avanza 13.7 px/fotograma
const WALK = 36;
const V = 13.7;
const phaseOf = (f: number, k = 1) => (2 * Math.PI * f * k) / WALK;

const Paper: React.FC<{color?: string}> = ({color = C.paper}) => (
  <rect x={-10} y={-10} width={W + 20} height={H + 20} fill={color} />
);

/* 1 · "El Señor es mi pastor; nada me falta" — 0:00 a 0:04 */
export const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const px = ease(f, 0, 78, -300, 560, Easing.out(Easing.quad));
  const sx = ease(f, 14, 96, -560, 250, Easing.out(Easing.quad));
  const offset = V * f - (px + 300);
  return (
    <g>
      <Paper />
      <SkyCloud x={820 - f * 0.5} y={640} s={1} />
      <Ground />
      <GroundScroll offset={offset} seed={3} />
      <Sheep x={sx} y={FEET_Y + 36} pose="walk" phase={phaseOf(f, 1.25)} />
      <Person x={px} y={FEET_Y} s={0.9} walk phase={phaseOf(f)} arms="hold" staff beard />
      <Lettering lines={['EL SEÑOR', 'ES MI PASTOR']} x={W / 2} y={230} size={190} start={8} perLine={18} gap={0.82} />
    </g>
  );
};

/* 2 · pastos verdes y aguas tranquilas — 0:04 a 0:10 */
export const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const wipe = ease(f, 6, 54);
  const pond = ease(f, 70, 112, 0, 1, Easing.out(Easing.back(1.4)));
  const headDip = ease(f, 100, 118);
  return (
    <g>
      <Paper />
      <SkyCloud x={260 + f * 0.3} y={700} s={0.8} />
      <Ground wipe={wipe} />
      <Pond cx={260} cy={1730} rx={300} ry={92} grow={pond} />
      <Sheep x={640} y={1450} pose="lie" s={1.05} />
      <Sheep x={560} y={1660} flip pose="stand" headDip={headDip} s={0.95} />
      <Person x={920} y={FEET_Y} s={0.9} arms="hold" staff beard lean={2} />
      <Sparkles cx={640} cy={1250} start={150} />
      <Lettering lines={['PASTOS VERDES']} x={W / 2} y={200} size={170} start={14} />
      <Lettering lines={['AGUAS TRANQUILAS']} x={W / 2} y={380} size={150} start={78} />
      <Lettering lines={['RENUEVA MIS FUERZAS']} x={W / 2} y={540} size={110} start={132} color={C.purple} />
    </g>
  );
};

/* 3 · el valle oscuro — 0:10 a 0:17 */
const SCRIBBLE = scribblePath(540, 600, 340, 200, 34, 7);

export const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const dark = ease(f, 8, 44);
  const bg = interpolateColors(dark, [0, 1], [C.paper, '#d8c2f4']);
  const ground = interpolateColors(dark, [0, 1], [C.ochre, C.night]);
  const hills = ease(f, 6, 46, 0, 1, Easing.out(Easing.back(1.2)));
  const draw = ease(f, 26, 96, 0, 1, Easing.inOut(Easing.quad));
  const erase = ease(f, 132, 182, 0, 1, Easing.inOut(Easing.quad));
  const px = 650 + wobble(f, 6, 90);
  const offset = V * f;
  const fear = ease(f, 118, 128, 1, 0);
  const glow = ease(f, 124, 150);
  return (
    <g>
      <Paper color={bg} />
      <Hill side="left" grow={hills} />
      <Hill side="right" grow={hills} />
      <Ground color={ground} />
      <GroundScroll offset={offset} seed={9} color="#2a1838" />
      <g transform={`translate(540,600) scale(${1 - erase * 0.35}) translate(-540,-600)`} opacity={1 - erase * 0.6}>
        <path d={SCRIBBLE} fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 - draw - erase} />
      </g>
      <Sheep x={300} y={FEET_Y + 36} pose="walk" phase={phaseOf(f, 1.25)} />
      <Person x={px} y={FEET_Y} s={0.9} walk phase={phaseOf(f)} arms="hold" staff staffGlow={glow} beard />
      <g opacity={fear}>
        <Lettering lines={['NO TEMERÉ']} x={W / 2} y={230} size={200} start={72} />
      </g>
      <Lettering lines={['TÚ ESTÁS', 'CONMIGO']} x={W / 2} y={230} size={190} start={132} perLine={16} gap={0.82} color={C.ink} />
    </g>
  );
};

/* 4 · la mesa y la copa que rebosa — 0:17 a 0:22 */
export const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const overflow = ease(f, 60, 100);
  const point = f > 12;
  return (
    <g>
      <Paper />
      <SkyCloud x={760 - f * 0.4} y={760} s={0.7} />
      <Ground />
      <Person x={940} y={FEET_Y - 20} s={0.78} flip arms="crossed" angry beard hair={C.ink} body={C.salmonDark} />
      <Person x={1050} y={FEET_Y + 10} s={0.78} flip arms="crossed" angry body={C.salmonDark} />
      <Sheep x={340} y={FEET_Y + 90} pose="lie" s={0.9} />
      <Person x={190} y={FEET_Y} s={0.9} arms={point ? 'point' : 'swing'} beard lean={4} />
      <Table x={650} y={1130} overflow={overflow} />
      <Lettering lines={['FRENTE A', 'MIS ENEMIGOS']} x={W / 2} y={190} size={140} start={8} perLine={14} gap={0.84} />
      <Lettering lines={['MI COPA REBOSA']} x={W / 2} y={560} size={150} start={64} color={C.purple} />
    </g>
  );
};

/* 5 · bondad y amor me perseguirán — 0:22 a 0:27 */
const Crossing: React.FC<{start: number; kind: 'sun' | 'moon'}> = ({start, kind}) => {
  const f = useCurrentFrame();
  const t = (f - start) / 62;
  if (t < 0 || t > 1) return null;
  const x = -140 + t * (W + 280);
  const y = 840 - 300 * Math.sin(Math.PI * t);
  return kind === 'sun' ? <Sun x={x} y={y} r={84} /> : <Moon x={x} y={y} r={74} />;
};

export const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const night = Math.max(ease(f, 54, 70) - ease(f, 100, 116), 0) * 0.22;
  return (
    <g>
      <Paper />
      <rect x={0} y={0} width={W} height={GROUND_TOP} fill="#3b2a6b" opacity={night} />
      <Crossing start={0} kind="sun" />
      <Crossing start={52} kind="moon" />
      <Crossing start={104} kind="sun" />
      <Ground />
      <GroundScroll offset={V * f} seed={21} />
      <Person x={150} y={FEET_Y + 36} s={0.44} walk phase={phaseOf(f, 1.75)} stride={28} lean={12} body={C.lilac} bodyShade={C.purple} />
      <Person x={340} y={FEET_Y + 24} s={0.44} walk phase={phaseOf(f, 1.75) + 1.2} stride={28} lean={12} body={C.yellow} bodyShade={C.ochre} />
      <Sheep x={610} y={FEET_Y + 40} pose="walk" phase={phaseOf(f, 1.25)} />
      <Person x={880} y={FEET_Y} s={0.9} walk phase={phaseOf(f)} arms="hold" staff beard />
      <Lettering lines={['AMOR']} x={150} y={1010} size={100} start={16} />
      <Lettering lines={['BONDAD']} x={350} y={1010} size={100} start={30} />
      <Lettering lines={['TODOS LOS DÍAS', 'DE MI VIDA']} x={W / 2} y={190} size={150} start={6} perLine={16} gap={0.84} />
    </g>
  );
};

/* 6 · habitaré en tu casa para siempre — 0:27 a 0:30 */
export const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const px = ease(f, 0, 46, -260, 250, Easing.out(Easing.quad));
  const sx = ease(f, 6, 74, -420, 560, Easing.out(Easing.quad));
  const offset = V * f - (px + 260);
  const light = ease(f, 40, 84);
  const walking = f < 64;
  return (
    <g>
      <Paper />
      <Ground />
      <GroundScroll offset={offset} seed={33} />
      <Infinity cx={290} cy={500} progress={ease(f, 28, 78, 0, 1, Easing.inOut(Easing.quad))} />
      <g transform={`translate(470,${FEET_Y + 40}) scale(1.6) translate(-470,${-(FEET_Y + 40)})`}>
        <House x={470} y={FEET_Y + 40} light={light} />
      </g>
      <Person x={px} y={FEET_Y} s={0.9} walk={walking} phase={phaseOf(f)} arms="swing" beard />
      <Sheep x={sx} y={FEET_Y + 60} pose={f < 70 ? 'walk' : 'stand'} phase={phaseOf(f, 1.25)} s={0.8} />
      <Lettering lines={['HABITARÉ EN', 'TU CASA PARA SIEMPRE']} x={W / 2} y={210} size={150} start={4} perLine={18} gap={0.84} />
    </g>
  );
};
