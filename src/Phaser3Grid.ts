import { align, Cell, fit, Grid, GridAlign, GridScale, IContent, IContentConfig, IGridConfig } from '.';
import { union } from './utils/Utils';

// @ts-ignore
Phaser.GameObjects.Container.prototype.__getBounds__ = function() {
  let output;
  const b = this.getBounds();
  const t = this.getWorldTransformMatrix();
  output = new Phaser.Geom.Rectangle(t.tx, t.ty, b.width, b.height);

  if (this.list.length === 0) {
    return output;
  }

  const first = this.list[0];
  // @ts-ignore
  output = first.__getBounds__ ? first.__getBounds__() : first.getBounds ? first.getBounds() : output;

  for (let i = 1; i < this.list.length; i += 1) {
    const next = this.list[i];
    // @ts-ignore
    const childBounds = next.__getBounds__ ? next.__getBounds__() : next.getBounds ? next.getBounds() : output;
    output = union(output, childBounds);
  }

  return output;
};

export class Phaser3Grid extends Phaser.GameObjects.Container {
  private $grid!: Grid;
  private $gridDebugger!: Phaser.GameObjects.Graphics;

  public build(config: IGridConfig): void {
    this._build(config);
  }

  public rebuild(config?: IGridConfig): void {
    const cellsContentsMap = this.$grid.getCells().map(cell => {
      return { cellName: cell.name, cellContents: cell.contents };
    });

    if (this.$gridDebugger) {
      this.$gridDebugger.destroy();
    }
    // @ts-ignore
    this._build(config || this.$grid.config);

    cellsContentsMap.forEach(c => {
      const { cellName, cellContents } = c;
      cellContents.forEach((cellContent: IContent) => {
        const { config: childConfig, child } = cellContent;
        this.setChild(cellName, child, childConfig);
      });
    });
  }

  public setChild(
    cellName: string | undefined,
    child: Phaser.GameObjects.Container | Phaser.GameObjects.Image | Phaser.GameObjects.Sprite,
    config?: IContentConfig,
  ): this {
    this.add(child);

    const cell: Cell | undefined = this.$grid.getCellByName(cellName);
    if (cell === undefined) {
      throw new Error(`No cell found with name ${cellName}`);
    }

    child.setPosition(0);
    child.setScale(1);

    if (child instanceof Phaser3Grid) {
      config = config || {};
      config.scale = GridScale.None;
      config.align = GridAlign.LeftTop;

      child.$grid.config.bounds = {
        height: cell.bounds.height,
        width: cell.bounds.width,
        x: cell.bounds.x,
        y: cell.bounds.y,
      };
      child.rebuild();
    } else {
      const thisTransform = this.getWorldTransformMatrix();
      const childTransform = child.getWorldTransformMatrix();
      // @ts-ignore
      const childBounds = child.__getBounds__ ? child.__getBounds__() : child.getBounds();

      // MERGE
      // ______________
      const merged = this.$grid.mergeConfigs(cell, config);

      // SCALE
      // ______________
      let childDimensions = {
        width: childBounds.width / childTransform.scaleX,
        height: childBounds.height / childTransform.scaleY,
      };
      const cellDimensions = { width: merged.padding.width, height: merged.padding.height };
      const scale = fit(childDimensions, cellDimensions, merged.scale);
      child.setScale(scale.x, scale.y);

      // POSITION
      // ______________
      childDimensions = {
        height: (childBounds.height / childTransform.scaleY) * child.scaleY,
        width: (childBounds.width / childTransform.scaleX) * child.scaleX,
      };
      const pos = align(childDimensions, merged.padding, merged.align);
      child.setPosition(pos.x + merged.offset.x, pos.y + merged.offset.y);
      child.x -= ((childBounds.x - thisTransform.tx) / childTransform.scaleX) * child.scaleX;
      child.y -= ((childBounds.y - thisTransform.ty) / childTransform.scaleY) * child.scaleY;

      // DEBUG
      // ______________
      if (config && config.debug && this.$gridDebugger) {
        const { color = this.$gridDebugger.defaultStrokeColor } = config.debug;
        const { x, y, width, height } = merged.padding;
        this.$gridDebugger.lineStyle(5, color, 1);
        this.$gridDebugger.strokeRect(x, y, width, height);
      }
    }

    cell.contents.push({ child, config });

    return this;
  }

  private _build(config: IGridConfig): void {
    this.$grid = new Grid(config);

    if (config.debug) {
      this.$gridDebugger = this.scene.add.graphics();
      this.$gridDebugger.defaultStrokeColor = config.debug.color || 0xffffff;
      this.add(this.$gridDebugger);
      this._debug(this.$grid);
    }
  }

  private _debug(cell: Cell | Grid, lineWidth: number = 10): void {
    const { x: bx, y: by, width: bw, height: bh } = cell.bounds;
    const { x: px, y: py, width: pw, height: ph } = cell.padding;
    const { $gridDebugger: gr } = this;

    gr.lineStyle(lineWidth * 0.8, gr.defaultStrokeColor, 1);
    gr.strokeRect(px, py, pw, ph);

    gr.lineStyle(lineWidth, gr.defaultStrokeColor, 1);
    gr.strokeRect(bx, by, bw, bh);

    cell.cells.forEach(el => this._debug(el, lineWidth * 0.7));
  }
}
