export function union(rectA: Phaser.Geom.Rectangle, rectB: Phaser.Geom.Rectangle): Phaser.Geom.Rectangle {
  const x = Math.min(rectA.x, rectB.x);
  const y = Math.min(rectA.y, rectB.y);
  const w = Math.max(rectA.right, rectB.right) - x;
  const h = Math.max(rectA.bottom, rectB.bottom) - y;

  return new Phaser.Geom.Rectangle(x, y, w, h);
}
