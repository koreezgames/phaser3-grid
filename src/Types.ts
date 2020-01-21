import { IContent } from '@koreez/grid-core';

export type IPhaser3Child = Phaser.GameObjects.Container | Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;

export interface IPhaser3Content extends IContent {
  child: IPhaser3Child;
}
