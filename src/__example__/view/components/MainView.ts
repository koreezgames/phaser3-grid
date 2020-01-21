import { CellAlign, CellScale, IGridConfig } from '@koreez/grid-core';
import 'phaser';
import { Phaser3Grid } from '../../../Phaser3Grid';

function getCanvasBounds() {
  // @ts-ignore
  return { x: 0, y: 0, width: window.game.scale.width, height: window.game.scale.height };
}

function getMainViewGridConfig(): IGridConfig {
  // @ts-ignore
  return window.game.scale.isLandscape ? getMainViewLandscapeGridConfig() : getMainViewPortraitGridConfig();
}

function getMainViewPortraitGridConfig(): IGridConfig {
  return {
    debug: { color: 0xff0000 },
    name: 'main',
    bounds: getCanvasBounds,
    cells: [
      {
        name: 'main_1',
        bounds: { x: 0, y: 0, width: 0.5, height: 1 },
        padding: 0.1,
      },
      {
        name: 'main_2',
        bounds: { x: 0.5, y: 0 },
      },
    ],
  };
}

function getMainViewLandscapeGridConfig(): IGridConfig {
  return {
    debug: { color: 0xff0000 },
    name: 'main',
    bounds: getCanvasBounds,
    cells: [
      {
        name: 'main_1',
        bounds: { x: 0, y: 0, width: 0.4, height: 1 },
        padding: 0.1,
      },
      {
        name: 'main_2',
        bounds: { x: 0.4, y: 0, width: 0.3, height: 1 },
      },
      {
        name: 'main_3',
        bounds: { x: 0.7, y: 0, width: 0.3, height: 1 },
      },
    ],
  };
}

function getChildViewGridConfig(): IGridConfig {
  return {
    debug: { color: 0x626262 },
    name: 'ui',
    bounds: getCanvasBounds,
    cells: [
      {
        name: 'ui_1',
        bounds: { x: 0, y: 0, height: 0.25 },
      },
      {
        name: 'ui_2',
        bounds: { x: 0, y: 0.25, height: 0.25 },
      },
      {
        name: 'ui_3',
        bounds: { x: 0, y: 0.5, height: 0.25 },
      },
      {
        name: 'ui_4',
        bounds: { x: 0 },
        padding: 0.1,
      },
    ],
  };
}

export class MainView extends Phaser3Grid {
  constructor(scene: Phaser.Scene) {
    super(scene);

    this.build(getMainViewGridConfig());
  }

  public build(config: IGridConfig): void {
    super.build(config);

    const cont = this.scene.add.container(0, 0);
    const owl = this.scene.add.sprite(0, 0, 'owl');
    const duck = this.scene.add.sprite(200, 0, 'duck');

    owl.setOrigin(-2, 2);
    duck.setOrigin(2, -2);

    cont.add(owl);
    cont.add(duck);

    this.setChild('main_1', cont);

    const childView = new ChildView(this.scene);
    this.setChild('main_2', childView);

    setInterval(() => {
      cont.rotation += 0.005;
      this.rebuild();
    });

    this.scene.scale.on('resize', () => {
      this.rebuild();
    });

    this.scene.scale.on('orientationchange', orientation => {
      this.rebuild(getMainViewGridConfig());
    });
  }
}

// tslint:disable-next-line: max-classes-per-file
export class ChildView extends Phaser3Grid {
  constructor(scene: Phaser.Scene) {
    super(scene);

    this.build(getChildViewGridConfig());
  }

  public build(config: IGridConfig): void {
    super.build(config);

    const owl = this.scene.add.sprite(0, 0, 'owl');
    const parrot1 = this.scene.add.sprite(200, 0, 'parrot');
    const parrot2 = this.scene.add.sprite(-200, 0, 'parrot');
    const chick = this.scene.add.sprite(0, 0, 'chick');
    const pixel = this.scene.add.sprite(0, 0, 'pixel');

    const parrotCont = this.scene.add.container(0, 0);
    parrotCont.add(parrot1);
    parrotCont.add(parrot2);

    this.setChild('ui_1', owl, { align: CellAlign.LeftTop });
    this.setChild('ui_2', parrotCont);
    this.setChild('ui_3', chick, { align: CellAlign.RightBottom });
    this.setChild('ui_4', pixel, {
      scale: CellScale.ShowAll,
      padding: 0.2,
      debug: { color: 0xffffff },
    });

    setInterval(() => {
      owl.rotation += 0.005;
      pixel.rotation += 0.005;
      chick.rotation += 0.005;
      parrotCont.rotation += 0.005;
      parrot1.rotation -= 0.005;

      this.rebuild();
    });
  }
}
