import { ActorRefFrom } from "xstate";
import { plantMachine } from "../../machines/plant";
import { FC, Suspense } from "react";
import merge from "lodash/merge";
import { useSelector } from "@xstate/react";
import { animated, config, useSpring } from "@react-spring/three";
import Branch from "./Branch";
import Flower from "./Flower";

type PlantProps = {
  plantMachine: ActorRefFrom<typeof plantMachine>;
  floweringVisible?: boolean;
  floweringStatus?: "blooming" | "senescence";
  forceDead?: boolean;
};

const Plant: FC<PlantProps> = ({
  plantMachine,
  floweringVisible,
  floweringStatus,
  forceDead,
}) => {
  const { branches, shape, plant, meta, flowers, dead } = useSelector(
    plantMachine,
    (snapshot) => ({
      dead: snapshot.matches({ condition: "dead" }),
      branches: snapshot.context.branches,
      flowers: snapshot.context.currentFlowers,
      shape: snapshot.context.shape,
      plant: snapshot.context.plant,
      meta: merge({}, ...Object.values(snapshot.getMeta())),
    })
  );

  const scaleFactor = meta?.scaleFactor || 1;

  const springs = useSpring({
    from: { scale: 0 },
    to: { scale: 0.7 * scaleFactor }, // TODO get from plant level
    config: config.wobbly,
  });

  const plantFloweringVisible = floweringVisible || meta?.floweringVisible;
  const plantFloweringStatus = floweringStatus || meta?.floweringStatus;
  const plantForceDead = forceDead === undefined ? dead : forceDead;

  return (
    <animated.group
      position={plant.junction.position.toArray()}
      rotation={plant.junction.rotation.toArray()}
      scale={springs.scale}
    >
      <Suspense>
        <Branch shape={shape} dead={plantForceDead} />
      </Suspense>
      <Suspense>
        {plantFloweringVisible && (
          <group>
            {flowers.map((flower) => (
              <Flower
                key={`${flower.x}_${flower.y}_${flower.z}`}
                position={flower}
                status={plantFloweringStatus}
              />
            ))}
          </group>
        )}
      </Suspense>
      <group>
        {branches.map((branch) => (
          <Plant
            key={branch.id}
            plantMachine={branch}
            floweringStatus={plantFloweringStatus}
            floweringVisible={plantFloweringVisible}
            forceDead={plantForceDead}
          />
        ))}
      </group>
    </animated.group>
  );
};

export default Plant;
