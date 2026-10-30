import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GROUND_Y, MAN_X, WALK_CYCLE} from './constants';

const THIGH = 98;
const SHIN = 94;
const UPPER_ARM = 62;
const FOREARM = 58;
const ANKLE_TO_SOLE = 10;
const STRIDE_ANGLE = (26 * Math.PI) / 180;
const ARM_ANGLE = (24 * Math.PI) / 180;
const K = 0.97;

// Onda casi triangular (-1..1): el pie apoyado se desliza a velocidad casi constante
const tri = (phi: number) => Math.asin(K * Math.sin(phi)) / Math.asin(K);

type LegPose = {
  knee: [number, number];
  ankle: [number, number];
  shinAngle: number;
  depth: number;
};

// Ángulos medidos desde la vertical, positivo = hacia adelante (derecha)
const legPose = (phi: number): LegPose => {
  const thigh = STRIDE_ANGLE * tri(phi);
  const flex =
    ((6 + 58 * Math.pow(Math.max(0, Math.cos(phi + 0.5)), 1.6)) * Math.PI) / 180;
  const shinAngle = thigh - flex;
  const knee: [number, number] = [THIGH * Math.sin(thigh), THIGH * Math.cos(thigh)];
  const ankle: [number, number] = [
    knee[0] + SHIN * Math.sin(shinAngle),
    knee[1] + SHIN * Math.cos(shinAngle),
  ];
  return {knee, ankle, shinAngle, depth: ankle[1]};
};

const pts = (...p: Array<[number, number]>) => p.map(([x, y]) => `${x},${y}`).join(' ');

const Leg: React.FC<{
  pose: LegPose;
  pants: string;
  shoe: string;
}> = ({pose, pants, shoe}) => (
  <g>
    <polyline
      points={pts([0, 0], pose.knee, pose.ankle)}
      fill="none"
      stroke={pants}
      strokeWidth={28}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <g
      transform={`translate(${pose.ankle[0]},${pose.ankle[1]}) rotate(${
        (-pose.shinAngle * 180) / Math.PI * 0.45
      })`}
    >
      <rect x={-12} y={-6} width={48} height={ANKLE_TO_SOLE + 6} rx={9} fill={shoe} />
    </g>
  </g>
);

const Arm: React.FC<{
  upperAngle: number;
  flex: number;
  sleeve: string;
  skin: string;
}> = ({upperAngle, flex, sleeve, skin}) => {
  const elbow: [number, number] = [
    UPPER_ARM * Math.sin(upperAngle),
    UPPER_ARM * Math.cos(upperAngle),
  ];
  const foreAngle = upperAngle + flex;
  const hand: [number, number] = [
    elbow[0] + FOREARM * Math.sin(foreAngle),
    elbow[1] + FOREARM * Math.cos(foreAngle),
  ];
  return (
    <g>
      <polyline
        points={pts([0, 0], elbow)}
        fill="none"
        stroke={sleeve}
        strokeWidth={22}
        strokeLinecap="round"
      />
      <polyline
        points={pts(elbow, hand)}
        fill="none"
        stroke={skin}
        strokeWidth={17}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={hand[0]} cy={hand[1]} r={11} fill={skin} />
    </g>
  );
};

export const Man: React.FC = () => {
  const frame = useCurrentFrame();
  const phi = (2 * Math.PI * frame) / WALK_CYCLE;

  const near = legPose(phi);
  const far = legPose(phi + Math.PI);

  // La cadera se ajusta para que el pie más bajo siempre toque el suelo (genera el rebote)
  const hipY = -(Math.max(near.depth, far.depth) + ANKLE_TO_SOLE);
  const lean = 4 + 1.8 * Math.sin(phi);
  const shoulderY = -112;

  // Los brazos oscilan opuestos a la pierna del mismo lado
  const nearArmAngle = -ARM_ANGLE * tri(phi);
  const farArmAngle = ARM_ANGLE * tri(phi);
  const armFlex = (a: number) =>
    ((14 + 26 * Math.max(0, a / ARM_ANGLE)) * Math.PI) / 180;

  const skin = '#e3a273';
  const skinFar = '#c98557';
  const shirt = '#2f7f84';
  const shirtFar = '#256569';
  const pants = '#3d2c5e';
  const pantsFar = '#2c2046';
  const shoe = '#241722';

  return (
    <g transform={`translate(${MAN_X},${GROUND_Y})`}>
      {/* sombra en el suelo */}
      <ellipse cx={14} cy={4} rx={92} ry={13} fill="#2a1424" opacity={0.35} />

      <g transform={`translate(0,${hipY})`}>
        {/* extremidades lejanas */}
        <g transform={`rotate(${lean}) translate(0,${shoulderY})`}>
          <Arm upperAngle={farArmAngle} flex={armFlex(farArmAngle)} sleeve={shirtFar} skin={skinFar} />
        </g>
        <Leg pose={far} pants={pantsFar} shoe="#170e16" />

        {/* tronco, mochila, cabeza */}
        <g transform={`rotate(${lean})`}>
          <rect x={-50} y={-108} width={30} height={72} rx={11} fill="#b8503a" />
          <rect x={-50} y={-108} width={30} height={14} rx={7} fill="#d76a48" />
          <rect x={-27} y={-132} width={54} height={138} rx={25} fill={shirt} />
          <rect x={-27} y={-42} width={54} height={14} fill="#2a1d36" />
          <rect x={-8} y={-152} width={17} height={26} rx={7} fill={skin} />
          <g transform={`rotate(${-lean * 0.8} 6 -176)`}>
            <circle cx={1} cy={-181} r={30} fill="#2a1a1c" />
            <circle cx={9} cy={-174} r={27} fill={skin} />
            <path d="M -19 -190 Q 8 -214 38 -188 Q 20 -198 -2 -194 Z" fill="#2a1a1c" />
            <circle cx={5} cy={-172} r={6} fill={skinFar} />
            <circle cx={36} cy={-171} r={5.5} fill={skin} />
            <circle cx={25} cy={-180} r={3.2} fill="#2a1a1c" />
            <path d="M 22 -160 Q 29 -157 35 -161" stroke="#8a4a3a" strokeWidth={2.5} fill="none" strokeLinecap="round" />
          </g>
        </g>

        {/* extremidades cercanas */}
        <Leg pose={near} pants={pants} shoe={shoe} />
        <g transform={`rotate(${lean}) translate(0,${shoulderY})`}>
          <Arm upperAngle={nearArmAngle} flex={armFlex(nearArmAngle)} sleeve={shirt} skin={skin} />
        </g>
      </g>
    </g>
  );
};
