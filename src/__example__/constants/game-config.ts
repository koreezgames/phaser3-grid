import { Scale } from 'phaser';
import { CANVAS_CONTAINER_ID } from './constants';

export const gameConfig = {
  backgroundColor: 0xcdcdcd,
  banner: false,
  parent: CANVAS_CONTAINER_ID,
  scale: { width: '100%', height: '100%', mode: Scale.RESIZE, autoCenter: Scale.CENTER_BOTH },
};
