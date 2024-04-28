import { Vector3 } from "three";

export type Junction = {
  position: Vector3;
  rotation: Vector3;
};

export type Plant = {
  level: number;
  junction: Junction;
};
