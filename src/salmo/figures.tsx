import React from 'react';
import {C, Ink, Limb, Line, cloudPath} from './ink';

type P = [number, number];

const L1 = 165;
const L2 = 165;
const rad = (d: number) => (d * Math.PI) / 180;
const K = 0.97;
// Onda casi triangular: el pie apoyado avanza casi a velocidad constante
const tri = (p: number) => Math.asin(K * Math.sin(p)) / Math.asin(K);

type LegPose = {knee: P; ankle: P; toe: P; depth: number};

const leg = (phi: number, stride: number, flexOverride?: number): LegPose => {
  const thigh = stride * tri(phi);
  const flex =
    flexOverride ?? rad(6 + 58 * Math.pow(Math.max(0, Math.cos(phi + 0.5)), 1.6));
  const shin = thigh - flex;
  const knee: P = [L1 * Math.sin(thigh), L1 * Math.cos(thigh)];
  const ankle: P = [knee[0] + L2 * Math.sin(shin), knee[1] + L2 * Math.cos(shin)];
  const toe: P = [ankle[0] + 58 * Math.cos(shin * 0.3), ankle[1] + 8];
  return {knee, ankle, toe, depth: toe[1]};
};

export type ArmPose = 'swing' | 'hold' | 'point' | 'crossed' | 'raised';

export type PersonProps = {
  x: number;
  y: number; // línea del suelo bajo los pies
  s?: number;
  flip?: boolean;
  walk?: boolean;
  phase?: number; // fase del ciclo en radianes
  stride?: number; // amplitud de zancada en grados
  arms?: ArmPose;
  staff?: boolean;
  staffGlow?: number;
  beard?: boolean;
  angry?: boolean;
  lean?: number;
  body?: string;
  bodyShade?: string;
  hair?: string;
  hidden?: 'legs';
};

const Face: React.FC<{beard: boolean; angry: boolean; hair: string; body: string}> = ({beard, angry, hair, body}) => (
  <g>
    <Ink d="M -44 0 a 44 56 0 1 0 88 0 a 44 56 0 1 0 -88 0 Z" fill={body} shade={C.salmonDark} shadeOff={[-6, 4]} />
    {/* pelo */}
    <path d="M -50 -4 C -58 -70 36 -84 52 -22 C 36 -44 -4 -50 -50 -4 Z" fill={hair} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
    {beard && (
      <path
        d="M -44 8 C -42 76 36 84 48 14 C 34 44 -18 48 -44 8 Z"
        fill={hair}
        stroke={C.ink}
        strokeWidth={4}
        strokeLinejoin="round"
      />
    )}
    {/* nariz, ojo cerrado y boca */}
    <Line d="M 44 -4 L 56 12 L 44 16" w={4} />
    <Line d={angry ? 'M 10 -16 L 34 -8' : 'M 10 -12 Q 22 -4 34 -12'} w={5} />
    {angry && <Line d="M 12 -8 L 32 -2" w={4} />}
    {!beard && <Line d={angry ? 'M 22 32 Q 34 26 44 34' : 'M 22 30 Q 34 36 44 30'} w={4} />}
  </g>
);

export const Person: React.FC<PersonProps> = ({
  x,
  y,
  s = 1,
  flip = false,
  walk = false,
  phase = 0,
  stride = 22,
  arms = 'swing',
  staff = false,
  staffGlow = 0,
  beard = false,
  angry = false,
  lean = 3,
  body = C.salmon,
  bodyShade,
  hair = C.ink,
}) => {
  const A = rad(stride);
  const near = walk ? leg(phase, A) : leg(Math.PI / 2, rad(4), rad(3));
  const far = walk ? leg(phase + Math.PI, A) : leg(-Math.PI / 2, rad(4), rad(3));
  const hipY = -(Math.max(near.depth, far.depth));
  const bob = walk ? 0 : 0;
  const sw = walk ? tri(phase) : 0;
  const shoulder: P = [0, -240];

  const armPts = (angle: number, flex: number, u = 120, f = 115): P[] => {
    const e: P = [shoulder[0] + u * Math.sin(angle), shoulder[1] + u * Math.cos(angle)];
    const a2 = angle + flex;
    return [shoulder, e, [e[0] + f * Math.sin(a2), e[1] + f * Math.cos(a2)]];
  };

  const farArm: P[] =
    arms === 'crossed'
      ? [shoulder, [-34, -145], [38, -110]]
      : arms === 'raised'
        ? armPts(2.6, 0.2)
        : armPts(-0.5 * sw + 0.02, 0.25 + 0.3 * Math.max(0, sw));
  const nearArm: P[] =
    arms === 'hold'
      ? armPts(0.34, 0.7)
      : arms === 'point'
        ? armPts(1.25, 0.12)
        : arms === 'crossed'
          ? [shoulder, [40, -150], [-30, -120]]
          : arms === 'raised'
            ? armPts(2.4, 0.3)
            : armPts(0.5 * sw + 0.02, 0.25 + 0.3 * Math.max(0, -sw));
  const aw = [30, 26, 17];
  const handNear = nearArm[2];

  const farLegPts: P[] = [[0, -4], far.knee, far.ankle, far.toe];
  const nearLegPts: P[] = [[0, -4], near.knee, near.ankle, near.toe];
  const lw = [44, 32, 24, 14];
  const leanDeg = lean + (walk ? 1.6 * Math.sin(phase) : 0);

  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <g transform={`translate(0,${hipY + bob})`}>
        <g transform={`rotate(${leanDeg})`}>
          <Limb pts={farArm} widths={aw} fill={body} shade={bodyShade ?? C.salmonDark} />
        </g>
        <Limb pts={farLegPts} widths={lw} fill={body} shade={C.salmonDark} />

        {/* tronco */}
        <g transform={`rotate(${leanDeg})`}>
          <Ink
            d="M -50 -236 Q -56 -266 -26 -268 L 26 -268 Q 56 -266 50 -236 L 42 -12 Q 0 8 -42 -12 Z"
            fill={body}
            shade={bodyShade ?? C.salmonDark}
          />
          {/* cinturón a rayas, como en la referencia */}
          <Line d="M -40 -62 L 40 -66 M -38 -44 L 40 -48 M -22 -72 L -22 -36 M -6 -72 L -6 -36 M 10 -72 L 10 -36 M 26 -72 L 26 -36" w={4} />
          <Limb pts={[[0, -262], [8, -292]]} widths={[26, 22]} fill={body} />
          <g transform="translate(10,-318)">
            <Face beard={beard} angry={angry} hair={hair} body={body} />
          </g>
        </g>

        <Limb pts={nearLegPts} widths={lw} fill={body} shade={C.salmonDark} />
        <g transform={`rotate(${leanDeg})`}>
          <Limb pts={nearArm} widths={aw} fill={body} shade={bodyShade ?? C.salmonDark} />
          {staff && (
            <g transform={`translate(${handNear[0]},${handNear[1]}) rotate(${arms === 'point' ? 10 : -6})`}>
              <Staff glow={staffGlow} />
            </g>
          )}
        </g>
      </g>
    </g>
  );
};

// Vara y cayado: línea amarilla fina con borde negro y un gancho arriba
export const Staff: React.FC<{glow?: number}> = ({glow = 0}) => (
  <g>
    {glow > 0 && (
      <g><circle cx={-30} cy={-540} r={130 * glow} fill="#ffe27a" opacity={0.45} /><circle cx={-30} cy={-540} r={80 * glow} fill="#ffe27a" opacity={0.85} /></g>
    )}
    <path d="M 0 190 L 0 -500 Q 0 -590 -62 -580 Q -104 -572 -96 -530" fill="none" stroke={C.ink} strokeWidth={17} strokeLinecap="round" />
    <path d="M 0 190 L 0 -500 Q 0 -590 -62 -580 Q -104 -572 -96 -530" fill="none" stroke={C.yellow} strokeWidth={9} strokeLinecap="round" transform="translate(3,2)" />
  </g>
);

/* ---------- oveja ---------- */

export type SheepProps = {
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  pose?: 'stand' | 'walk' | 'lie' | 'drink';
  phase?: number;
  headDip?: number; // 0..1 para bajar la cabeza (beber/pastar)
};

export const Sheep: React.FC<SheepProps> = ({x, y, s = 1, flip = false, pose = 'stand', phase = 0, headDip = 0}) => {
  const lying = pose === 'lie';
  const drinking = pose === 'drink' || headDip > 0;
  const dip = pose === 'drink' ? 1 : headDip;
  const bodyY = lying ? -68 : -118;
  const hx = 136 + dip * 12;
  const hy = (lying ? -128 : -150) + dip * (lying ? 60 : 120);
  const legsX = [-72, -38, 40, 74];
  const bounce = pose === 'walk' ? Math.abs(Math.sin(phase)) * -7 : 0;

  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <g transform={`translate(0,${bounce})`}>
        {!lying &&
          legsX.map((lx, i) => {
            const sw = pose === 'walk' ? Math.sin(phase + (i % 2 ? Math.PI : 0) + i * 0.4) : 0;
            const lift = pose === 'walk' ? Math.max(0, Math.cos(phase + (i % 2 ? Math.PI : 0) + i * 0.4)) * 16 : 0;
            const fx = lx + sw * 26;
            const fy = -lift - bounce;
            return (
              <g key={i}>
                <Line d={`M ${lx} -64 L ${fx} ${fy - 8}`} w={9} />
                <circle cx={fx} cy={fy - 4} r={8} fill={C.ink} />
              </g>
            );
          })}
        <Limb pts={[[84, bodyY - 6], [hx - 6, hy + 4]]} widths={[50, 42]} fill={C.cream} shade={C.blue} />
        <Ink d={cloudPath(0, bodyY, 118, lying ? 62 : 78, 10, 18)} fill={C.cream} shade={C.blue} shadeOff={[-10, 11]} />
        <Ink d={cloudPath(-104, bodyY - 14, 26, 22, 6, 8)} fill={C.cream} />
        {/* cabeza */}
        <g transform={`translate(${hx},${hy}) rotate(${dip * 20})`}>
          <Ink d="M -38 0 a 40 31 0 1 0 80 0 a 40 31 0 1 0 -80 0 Z" fill="#4a3a52" shade="#3a2c42" shadeOff={[-4, 4]} />
          <Ink d="M -30 -14 Q -64 -24 -52 6 Q -40 -2 -26 0 Z" fill="#4a3a52" />
          <circle cx={14} cy={-8} r={4} fill={C.paper} />
          {drinking && <Line d="M 36 6 Q 44 8 48 4" w={3} color={C.paper} />}
        </g>
      </g>
    </g>
  );
};
