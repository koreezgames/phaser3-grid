import { align, Cell, CellAlign, CellScale, fit, ICellConfig, IContentConfig, IGridConfig } from '@koreez/grid-core';
import './Patcher';
import { IPhaser3Child, IPhaser3Content } from './Types';

export class Phaser3Grid extends Phaser.GameObjects.Container {
  private _grid!: Cell<IGridConfig>;
  private _debugger!: Phaser.GameObjects.Graphics;

  public add(child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]): Phaser.GameObjects.Container {
    const c = super.add(child);
    if (this._debugger && child !== this._debugger) {
      this.bringToTop(this._debugger);
    }

    return c;
  }

  /**
   * @description Creates Grid object based on input configuration object
   * @param config Input configuration object.
   * @returns {void}
   */
  protected build(config: IGridConfig): void {
    this._internalBuild(config);
  }

  /**
   * @description Rebuilds Grid. Destroys existing grid and creates new one based on given or existing configuration
   * @param config Input configuration object. Can be empty, to build with existing configuration
   * @returns {void}
   */
  protected rebuild(config?: IGridConfig): void {
    // saves cells references before destroying grid
    const cells = this._grid.getCells();

    // creates new grid
    this._internalBuild(config || (this._grid.config as IGridConfig));

    // sets old cells contents in new grid cells
    cells.forEach((cell: Cell<ICellConfig>) => {
      const { name, contents } = cell;
      contents.forEach((content: IPhaser3Content) => {
        const { config: childConfig, child } = content;
        this.setChild(name, child, childConfig);
      });
    });
  }

  /**
   * @description Adds the given Game Object, to this Container.
   * @param cellName Cell name which will hold given child as content
   * @param child The Game Object, to add to the Container.
   * @param config Configuration object, which will be merged with cell configuration
   * @returns {this}
   */
  protected setChild(cellName: string, child: IPhaser3Child, config?: IContentConfig): this {
    const cell = this._grid.getCellByName(cellName);
    if (cell === undefined) {
      throw new Error(`No cell found with name ${cellName}`);
    }

    this.add(child);

    // resets child's position and scale
    child.setPosition(0);
    child.setScale(1);

    if (child instanceof Phaser3Grid) {
      config = config || {};
      config.scale = CellScale.None;
      config.align = CellAlign.LeftTop;
      child._grid.config.bounds = () => cell.contentArea;
      child.rebuild();
    } else {
      const thisTransform = this.getWorldTransformMatrix();
      const childTransform = child.getWorldTransformMatrix();
      // @ts-ignore
      const childBounds = child.__getBounds__ ? child.__getBounds__() : child.getBounds();

      // MERGE
      const merged = cell.mergeContentConfig(config);

      // SCALE
      let childDimensions = {
        width: childBounds.width / childTransform.scaleX,
        height: childBounds.height / childTransform.scaleY,
      };
      const cellDimensions = { width: merged.area.width, height: merged.area.height };
      const scale = fit(childDimensions, cellDimensions, merged.scale);
      child.setScale(scale.x, scale.y);

      // POSITION
      childDimensions = {
        height: (childBounds.height / childTransform.scaleY) * child.scaleY,
        width: (childBounds.width / childTransform.scaleX) * child.scaleX,
      };
      const pos = align(childDimensions, merged.area, merged.align);
      child.setPosition(pos.x + merged.offset.x, pos.y + merged.offset.y);
      child.x -= ((childBounds.x - thisTransform.tx) / childTransform.scaleX) * child.scaleX;
      child.y -= ((childBounds.y - thisTransform.ty) / childTransform.scaleY) * child.scaleY;

      // debugs content area considered paddings
      if (config && config.debug) {
        const { color = this._debugger.defaultStrokeColor } = config.debug;
        const { x, y, width, height } = merged.area;
        this._debugger.lineStyle(5, color, 1);
        this._debugger.strokeRect(x, y, width, height);
        this.bringToTop(this._debugger);
      }
    }

    cell.contents.push({ child, config });

    return this;
  }

  private _internalBuild(config: IGridConfig): void {
    this._grid = new Cell(config);

    if (config.debug) {
      if (this._debugger === undefined) {
        this._debugger = this.scene.add.graphics();
        this._debugger.defaultStrokeColor = config.debug.color !== undefined ? config.debug.color : 0xffffff;
        this.add(this._debugger);
      } else {
        this._debugger.clear();
      }
      this._debug(this._grid);
    }
  }

  private _debug(cell: Cell<ICellConfig>, lineWidth: number = 10): void {
    const { x: bx, y: by, width: bw, height: bh } = cell.bounds;
    const { x: px, y: py, width: pw, height: ph } = cell.contentArea;
    const { defaultStrokeColor } = this._debugger;

    this._debugger.lineStyle(lineWidth * 0.8, defaultStrokeColor, 1);
    this._debugger.strokeRect(px, py, pw, ph);
    this._debugger.lineStyle(lineWidth, defaultStrokeColor, 1);
    this._debugger.strokeRect(bx, by, bw, bh);

    cell.cells.forEach((el: Cell<ICellConfig>) => this._debug(el, lineWidth * 0.7));
  }
}
