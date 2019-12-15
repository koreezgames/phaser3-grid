import { GridAlign, GridScale, IGridConfig } from '../../../../index';
import { Phaser3Grid } from '../../../../Phaser3Grid';

function getMainViewGridConfig(scene: Phaser.Scene): IGridConfig {
  return {
    debug: { color: 0xff0000 },
    name: 'main',
    bounds: { x: 0, y: 0, width: scene.scale.width, height: scene.scale.height },
    cells: [
      {
        name: 'main_1',
        bounds: { x: 0, y: 0, width: 0.5, height: 1 },
        padding: 0.1,
      },
      {
        name: 'main_2',
        bounds: { x: 0.5, y: 0, height: 1 },
      },
    ],
  };
}

function getChildViewGridConfig(scene: Phaser.Scene): IGridConfig {
  return {
    debug: {},
    name: 'ui',
    bounds: { x: 0, y: 0, width: scene.scale.width, height: scene.scale.height },
    cells: [
      {
        name: 'ui_1',
        bounds: { x: 0, y: 0, width: 1, height: 0.25 },
      },
      {
        name: 'ui_2',
        bounds: { x: 0, y: 0.25, width: 1, height: 0.25 },
      },
      {
        name: 'ui_3',
        bounds: { x: 0, y: 0.5, width: 1, height: 0.25 },
      },
      {
        name: 'ui_4',
        bounds: { x: 0, y: 0.75, width: 1 },
        padding: 0.1,
      },
    ],
  };
}

export class MainView extends Phaser3Grid {
  constructor(scene: Phaser.Scene) {
    super(scene);

    this.build(getMainViewGridConfig(this.scene));
    // this.setScale(0.8)
  }

  public build(config: IGridConfig): void {
    super.build(config);

    const cont = this.scene.add.container();
    const owl = this.scene.add.sprite(0, 0, 'owl');
    const duck = this.scene.add.sprite(200, 0, 'duck');

    owl.setOrigin(-3, 3);
    duck.setOrigin(3, -3);

    cont.add(owl);
    cont.add(duck);

    this.setChild('main_1', cont);

    setInterval(() => {
      cont.rotation += 0.005;
      this.rebuild();
    }, 5);

    const childView = new ChildView(this.scene);
    this.setChild('main_2', childView);
  }
}

// tslint:disable-next-line: max-classes-per-file
export class ChildView extends Phaser3Grid {
  constructor(scene: Phaser.Scene) {
    super(scene);

    this.build(getChildViewGridConfig(this.scene, false));
  }

  public build(config: IGridConfig): void {
    super.build(config);

    const owl = this.scene.add.sprite(0, 0, 'owl');
    const parrot1 = this.scene.add.sprite(200, 0, 'parrot');
    const parrot2 = this.scene.add.sprite(-200, 0, 'parrot');
    const chick = this.scene.add.sprite(0, 0, 'chick');
    const pixel = this.scene.add.sprite(0, 0, 'pixel');

    const parrotCont = this.scene.add.container();
    parrotCont.add(parrot1);
    parrotCont.add(parrot2);

    this.setChild('ui_1', owl, { scale: GridScale.Fit, align: GridAlign.LeftTop });
    this.setChild('ui_2', parrotCont);
    this.setChild('ui_3', chick, { align: GridAlign.RightBottom });
    this.setChild('ui_4', pixel, { scale: GridScale.ShowAll });

    setInterval(() => {
      owl.rotation += 0.005;
      pixel.rotation += 0.005;
      chick.rotation += 0.005;
      parrotCont.rotation += 0.005;
      parrot1.rotation -= 0.005;

      this.rebuild();
    }, 5);
  }
}
