import { useTexture } from "@react-three/drei";
import { FC } from "react";
import { RepeatWrapping, Vector3 } from "three";

type FlowerProps = {
  position: Vector3;
  status: "blooming" | "senescense";
};

const Flower: FC<FlowerProps> = ({ position, status }) => {
  const [colorMap] = useTexture(["/textures/flower.jpg"]);
  colorMap.repeat.set(2, 2);
  colorMap.wrapS = colorMap.wrapT = RepeatWrapping;

  return (
    <mesh position={position} scale={[1, 1, 1]}>
      <sphereGeometry args={[0.2, 10]} />
      <meshStandardMaterial
        map={colorMap}
        color={status === "blooming" ? "#ffffff" : "#999900"}
      />
    </mesh>
  );
};

export default Flower;
