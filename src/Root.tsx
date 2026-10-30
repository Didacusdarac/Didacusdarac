import React from 'react';
import {Composition} from 'remotion';
import {Scene} from './Scene';
import {DURATION, FPS, HEIGHT, WIDTH} from './constants';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Caminata"
    component={Scene}
    durationInFrames={DURATION}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
