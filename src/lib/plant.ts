import { CatmullRomCurve3, Shape, Vector3 } from "three";
import sample from "lodash/sample";
import shuffle from "lodash/shuffle";
import { Junction } from "../types/plant";

type Point = { x: number; y: number };

const getRotation = (a: Point, b: Point) => {
  const m = -1 / ((b.y - a.y) / (b.x - a.x));
  let rz = Math.atan(m) - Math.PI / 2;
  if (Math.cos(rz) < 0) rz += Math.PI;
  return rz;
};

export const getRandomPoints = (a: Point, b: Point): Junction[] => {
  const points = [];
  const count = 3;
  const step = 1 / (count + 1);
  const rz = getRotation(a, b);
  for (let i = step; i < 1; i += step) {
    const x = a.x + (b.x - a.x) * i;
    const y = a.y + (b.y - a.y) * i;
    points.push({
      position: new Vector3(x, y, 0),
      rotation: new Vector3(
        -0.3 + Math.random() * 0.6,
        -0.3 + Math.random() * 0.6,
        rz
      ),
    });
  }
  return points;
};

export const randomShape = (): {
  shape: Shape;
  junctions: Junction[];
  flowers: Vector3[];
} => {
  const w = Math.random() * 0.5 + 0.5;
  const hw = w * 0.5;
  const h = Math.random() * 0.5 + 2;
  const hh = h * 0.5;
  const dw = Math.random() * 0.2 + 0.3;
  const r = () => Math.random() * 0.2 - 0.1;
  const shape = new Shape();

  const ax = -hw + r();
  const ay = 0 + r();
  const bx = hw + r();
  const by = 0 + r();
  const cx = hw + dw + r();
  const cy = hh + r();
  const dx = hw + r();
  const dy = h + r();
  const ex = -hw + r();
  const ey = h + r();
  const fx = -hw - dw + r();
  const fy = hh + r();

  const controlPoints = [
    new Vector3(ax, ay, 0),
    new Vector3(bx, by, 0),
    new Vector3(cx, cy, 0),
    new Vector3(dx, dy, 0),
    new Vector3(ex, ey, 0),
    new Vector3(fx, fy, 0),
    new Vector3(ax, ay, 0),
  ];

  const curve = new CatmullRomCurve3(controlPoints);
  const cpoints = curve.getPoints(100);

  const flowers = cpoints.filter((p) => p.y > 1);

  shape.moveTo(ax, ay);
  for (let i = 0; i < cpoints.length; i++) {
    const point = cpoints[i];
    shape.lineTo(point.x, point.y);
  }

  const junctions: Junction[] = shuffle<Junction>(
    [
      getRandomPoints({ x: cx, y: cy }, { x: dx, y: dy }),
      getRandomPoints({ x: ex, y: ey }, { x: dx, y: dy }),
      getRandomPoints({ x: fx, y: fy }, { x: ex, y: ey }),
    ].map(sample)
  );

  return { shape, junctions, flowers };
};
