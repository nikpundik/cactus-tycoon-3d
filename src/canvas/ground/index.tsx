import { FC } from "react";
import { useTexture } from "@react-three/drei";
import { RepeatWrapping } from "three";

const DesertGround: FC = () => {
  // Load desert ground texture
  const desertTexture = useTexture("/textures/desert.jpg");

  // Adjust texture repeat and offset for tiling
  desertTexture.wrapS = desertTexture.wrapT = RepeatWrapping;
  desertTexture.repeat.set(200, 200); // Adjust as needed

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial map={desertTexture} />
    </mesh>
  );
};

export default DesertGround;
