import React from 'react';
import {Composition} from 'remotion';
import {Scene} from './Scene';
import {Salmo23, SALMO_DURATION, SALMO_FPS} from './salmo/Salmo23';
import {DURATION, FPS, HEIGHT, WIDTH} from './constants';

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="Caminata"
    component={Scene}
    durationInFrames={DURATION}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
  <Composition
    id="Salmo23"
    component={Salmo23}
    durationInFrames={SALMO_DURATION}
    fps={SALMO_FPS}
    width={1080}
    height={1920}
  />
  </>
);
