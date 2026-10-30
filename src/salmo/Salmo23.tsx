import React from 'react';
import {AbsoluteFill, Easing, Sequence, useCurrentFrame} from 'remotion';
import {C, H, RoughDefs, Sketchy, W, ease} from './ink';
import {Scene1, Scene2, Scene3, Scene4, Scene5, Scene6} from './scenes';

export const SALMO_FPS = 30;
export const SALMO_DURATION = 30 * SALMO_FPS;

// Cada escena entra y sale con un deslizamiento horizontal compartido (14 fotogramas)
const SLIDE = 14;

const SCENES: Array<{Component: React.FC; from: number; dur: number}> = [
  {Component: Scene1, from: 0, dur: 126},
  {Component: Scene2, from: 126, dur: 174},
  {Component: Scene3, from: 300, dur: 210},
  {Component: Scene4, from: 510, dur: 150},
  {Component: Scene5, from: 660, dur: 150},
  {Component: Scene6, from: 810, dur: 90},
];

const Slide: React.FC<{first: boolean; last: boolean; dur: number; children: React.ReactNode}> = ({
  first,
  last,
  dur,
  children,
}) => {
  const f = useCurrentFrame();
  const inOut = Easing.inOut(Easing.cubic);
  const enter = first ? 0 : ease(f, 0, SLIDE, W, 0, inOut);
  const exit = last ? 0 : ease(f, dur, dur + SLIDE, 0, -W, inOut);
  return <g transform={`translate(${enter + exit},0)`}>{children}</g>;
};

export const Salmo23: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.paper}}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <RoughDefs />
      {SCENES.map(({Component, from, dur}, i) => {
        const last = i === SCENES.length - 1;
        return (
          <Sequence key={i} from={from} durationInFrames={dur + (last ? 0 : SLIDE)} layout="none">
            <Slide first={i === 0} last={last} dur={dur}>
              <Sketchy>
                <Component />
              </Sketchy>
            </Slide>
          </Sequence>
        );
      })}
    </svg>
  </AbsoluteFill>
);
