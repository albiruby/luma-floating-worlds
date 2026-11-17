import React from 'react';
import { HeroModel } from './HeroModel';
import { PlayerRuntimeState, PuzzleRuntimeState, WayfinderAppearance } from '../../game/types';
import { LumaMaterialPalette } from '../materials';

interface WayfinderModelProps {
  playerRef: React.MutableRefObject<PlayerRuntimeState>;
  puzzleStateRef?: React.MutableRefObject<PuzzleRuntimeState>;
  palette: LumaMaterialPalette;
  isSoftwareGl: boolean;
  appearance?: WayfinderAppearance;
  onRegisterFrame: (cb: (dt: number, elapsed: number) => void) => () => void;
}

export const WayfinderModel: React.FC<WayfinderModelProps> = (props) => {
  return <HeroModel {...props} />;
};
