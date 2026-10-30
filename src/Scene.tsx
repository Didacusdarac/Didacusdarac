import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HEIGHT, WIDTH} from './constants';
import {
  BackGrass,
  Birds,
  Clouds,
  FarTrees,
  Field,
  FrontGrass,
  Grade,
  GroundDetail,
  Hills,
  Mountains,
  NearTrees,
  Sky,
  Sun,
} from './layers';
import {Man} from './Man';

export const Scene: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#1b0a1d'}}>
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      <Sky />
      <Sun />
      <Clouds />
      <Birds />
      <Mountains />
      <Hills />
      <Field />
      <FarTrees />
      <NearTrees />
      <BackGrass />
      <GroundDetail />
      <Man />
      <FrontGrass />
      <Grade />
    </svg>
  </AbsoluteFill>
);
