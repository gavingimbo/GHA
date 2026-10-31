import React from 'react';
import {Composition} from 'remotion';
import {FILM_FRAMES, FPS, Film} from './Film';

export const RemotionRoot: React.FC = () => (
  <Composition id="DineWithDiscovery" component={Film} durationInFrames={FILM_FRAMES} fps={FPS} width={1920} height={1080} />
);
