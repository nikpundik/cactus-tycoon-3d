import { useTexture } from "@react-three/drei";
import { FC } from "react";
import { RepeatWrapping, Shape } from "three";

const options = {
  steps: 1,
  depth: 0.05,
  bevelEnabled: true,
  bevelThickness: 0.1,
  bevelSize: 0.1,
  bevelSegments: 5,
};

type BranchProps = {
  shape: Shape;
  dead: boolean;
};

const Branch: FC<BranchProps> = ({ shape, dead }) => {
  const [colorMap] = useTexture(["/textures/texture.jpg"]);
  colorMap.repeat.set(2, 2);
  colorMap.wrapS = colorMap.wrapT = RepeatWrapping;

  return (
    <mesh scale={[1, 1, 1]}>
      <extrudeGeometry args={[shape, options]}></extrudeGeometry>
      <meshStandardMaterial
        map={colorMap}
        color={dead ? "#aaaa00" : "#ffffff"}
      />
    </mesh>
  );
};

export default Branch;
