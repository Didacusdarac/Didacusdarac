import React from 'react';
import {Composition} from 'remotion';
import {Scene} from './Scene';
import {AGUA_DURATION, AGUA_FPS, AGUA_H, AGUA_W, CicloAgua} from './CicloAgua';
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
      id="CicloAgua"
      component={CicloAgua}
      durationInFrames={AGUA_DURATION}
      fps={AGUA_FPS}
      width={AGUA_W}
      height={AGUA_H}
    />
  </>
);
