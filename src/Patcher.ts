import { union } from './utils/Utils';

/**
 * Phaser.GameObject.Container has bug when calculating bounds of inner Container,
 * thats why we defined new property on Container that calculate bounds for our need.
 */
// @ts-ignore
Phaser.GameObjects.Container.prototype.__getBounds__ = function() {
  let output;

  switch (this.list.length) {
    case 0:
      const b = this.getBounds();
      const t = this.getWorldTransformMatrix();
      output = new Phaser.Geom.Rectangle(t.tx, t.ty, b.width, b.height);
      break;
    default:
      const first = this.list[0];
      // @ts-ignore
      output = first.__getBounds__ ? first.__getBounds__() : first.getBounds ? first.getBounds() : output;
      for (let i = 1; i < this.list.length; i += 1) {
        const next = this.list[i];
        // @ts-ignore
        const childBounds = next.__getBounds__ ? next.__getBounds__() : next.getBounds ? next.getBounds() : output;
        output = union(output, childBounds);
      }
      break;
  }

  return output;
};
