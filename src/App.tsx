import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sky, OrbitControls } from "@react-three/drei";
import { gameMachine } from "./machines/game";
import { useMachine } from "@xstate/react";
import Plant from "./canvas/plant";
import DesertGround from "./canvas/ground";

function Box(props) {
  const meshRef = useRef(null);
  const [hovered, setHover] = useState(false);
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.z += delta;
  });
  return (
    <mesh
      {...props}
      ref={meshRef}
      onClick={props.onClick}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

function Game() {
  const [snapshot, send] = useMachine(gameMachine);
  return (
    <>
      {snapshot.context.positions.map((position) =>
        position.plant ? (
          <Plant key={position.index} plantMachine={position.plant} />
        ) : (
          <Box
            key={position.index}
            onClick={() => {
              send({ type: "PLANT", index: position.index });
            }}
            position={position.position}
          />
        )
      )}
    </>
  );
}

function App() {
  return (
    <>
      <Canvas camera={{ position: [-11, 5, 8] }}>
        <ambientLight intensity={Math.PI / 2} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        <DesertGround />
        <Sky
          distance={450000}
          sunPosition={[0, 1, 0]}
          inclination={0}
          azimuth={0.25}
        />
        <Game />
        <OrbitControls />
      </Canvas>
    </>
  );
}

export default App;
