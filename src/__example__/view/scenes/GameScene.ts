import { Scene } from 'phaser';
import { SceneKey } from '../../constants/constants';
import { MainView } from '../components/MainView';

export class GameScene extends Scene {
  constructor() {
    super(SceneKey.Game);
  }

  public create(): void {
    const mainView = new MainView(this);
    this.add.existing(mainView);
  }
}
