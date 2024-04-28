import { assign, setup, ActorRefFrom, raise } from "xstate";
import { Shape, Vector3 } from "three";
import sample from "lodash/sample";
import sampleSize from "lodash/sampleSize";
import shuffle from "lodash/shuffle";
import { Junction, Plant } from "../../types/plant";
import { randomShape } from "../../lib/plant";

type PlantContext = {
  plant: Plant;
  shape: Shape;
  junctions: Junction[];
  flowers: Vector3[];
  currentFlowers: Vector3[];
  branches: ActorRefFrom<typeof plantMachine>[];
  growCount: number;
};

type PlantInput = {
  plant: Plant;
};

export const plantMachine = setup({
  types: {
    context: {} as PlantContext,
    input: {} as PlantInput,
    events: {} as { type: "GROW" } | { type: "GAME_OVER" },
  },
  schemas: {
    events: {
      START: {
        type: "object",
        properties: {},
      },
      GAME_OVER: {
        type: "object",
        properties: {},
      },
      SELL: {
        type: "object",
        properties: {},
      },
      PLANT: {
        type: "object",
        properties: {},
      },
      THRASH: {
        type: "object",
        properties: {},
      },
    },
  },
  actions: {
    seedFlowers: assign(({ context: { flowers } }) => {
      const currentFlowers = sampleSize(
        shuffle(flowers),
        4 + Math.ceil(Math.random() * 4)
      );
      return { currentFlowers };
    }),
    growBranch: ({ context: { branches } }) => {
      const branch = sample(branches);
      if (branch) {
        branch.send({ type: "GROW" });
      }
    },
    createBranch: assign(({ spawn, context }) => {
      const junctions = [...context.junctions];
      const junction = junctions.pop();
      if (junction) {
        const plant: Plant = {
          level: context.plant.level + 1,
          junction,
        };
        const branch = spawn(plantMachine, { input: { plant } });
        return { branches: [...context.branches, branch], junctions };
      }
      return {};
    }),
    raiseGrow: raise({ type: "GROW" }),
    consumeGrow: assign(({ context }) => {
      return { growCount: context.growCount + 1 };
    }),
  },
  guards: {
    shouldCreateBranch: ({ context }) => {
      return (
        context.junctions.length > 0 &&
        (context.branches.length === 0 || Math.random() > 0.5)
      );
    },
    isRoot: ({ context }) => {
      return context.plant.level === 0;
    },
    isDead: ({ context }) => {
      return context.growCount > 50;
    },
  },
}).createMachine({
  context: ({ input: { plant } }) => {
    const { shape, junctions, flowers } = randomShape();
    return {
      plant,
      branches: [],
      shape,
      junctions,
      flowers,
      currentFlowers: [],
      growCount: 0,
    };
  },
  id: "plant",
  type: "parallel",
  states: {
    flowering: {
      initial: "check",
      states: {
        check: {
          entry: "seedFlowers",
          always: [
            {
              guard: "isRoot",
              target: "none",
            },
            { target: "stopped" },
          ],
        },
        stopped: {},
        none: {
          meta: {
            floweringVisible: false,
            floweringStatus: "none",
          },
          after: {
            10000: [
              {
                guard: "isDead",
                target: "stopped",
              },
              {
                target: "blooming",
              },
            ],
          },
        },
        blooming: {
          meta: {
            floweringVisible: true,
            floweringStatus: "blooming",
          },
          after: {
            3000: [
              {
                target: "senescence",
              },
            ],
          },
        },
        senescence: {
          meta: {
            floweringVisible: true,
            floweringStatus: "senescence",
          },
          after: {
            2000: [
              {
                target: "none",
              },
            ],
          },
        },
      },
    },
    condition: {
      initial: "check",
      states: {
        check: {
          always: {
            guard: "isRoot",
            target: "alive",
          },
        },
        alive: {
          after: {
            1000: [
              {
                guard: "isDead",
                target: "dead",
              },
              {
                reenter: true,
                target: "alive",
                actions: [
                  {
                    type: "consumeGrow",
                  },
                  {
                    type: "raiseGrow",
                  },
                ],
              },
            ],
          },
        },
        dead: {},
      },
    },
    age: {
      initial: "seed",
      states: {
        seed: {
          meta: {
            scaleFactor: 0.3,
          },
          on: {
            GROW: {
              target: "baby",
            },
          },
        },
        baby: {
          meta: {
            scaleFactor: 0.6,
          },
          on: {
            GROW: {
              target: "adult",
            },
          },
        },
        adult: {
          meta: {
            scaleFactor: 1,
          },
          on: {
            GROW: [
              { actions: "createBranch", guard: "shouldCreateBranch" },
              { actions: "growBranch" },
            ],
          },
        },
      },
    },
  },
});
