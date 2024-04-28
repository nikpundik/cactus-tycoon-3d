import { setup, ActorRefFrom, assign } from "xstate";
import { plantMachine } from "../plant";
import { Plant } from "../../types/plant";
import { Vector3 } from "three";

type GameContext = {
  plants: ActorRefFrom<typeof plantMachine>[];
  money: number;
  positions: {
    index: number;
    enabled: boolean;
    position: Vector3;
    plant: ActorRefFrom<typeof plantMachine> | null;
  }[];
};

const initialContext: GameContext = {
  plants: [],
  money: 1000,
  positions: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => ({
    index,
    enabled: true,
    position: new Vector3(
      -5 + (index % 3) * 5,
      0,
      -5 + Math.floor(index / 3) * 5
    ),
    plant: null,
  })),
};

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as
      | { type: "START" }
      | { type: "GAME_OVER" }
      | { type: "SELL" }
      | { type: "PLANT"; index: number }
      | { type: "THRASH" }
      | { type: "DEBUG_GROW" },
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
    grow: ({ context }) => {
      context.plants.forEach((plant) => {
        plant.send({ type: "GROW" });
      });
    },
    plant: assign(({ context, spawn }, { index }: { index: number }) => {
      const positions = [...context.positions];
      if (positions[index]) {
        const plant: Plant = {
          level: 0,
          junction: {
            position: positions[index].position,
            rotation: new Vector3(0, 0, 0),
          },
        };
        const branch = spawn(plantMachine, { input: { plant } });
        positions[index].plant = branch;
      }
      return {
        money: context.money - 1,
        positions,
      };
    }),
  },
}).createMachine({
  context: { ...initialContext },
  id: "game",
  initial: "splash",
  states: {
    splash: {
      on: {
        START: {
          target: "game",
        },
      },
      after: {
        1000: {
          target: "game",
        },
      },
    },
    game: {
      on: {
        DEBUG_GROW: {
          actions: { type: "grow" },
        },
        GAME_OVER: {
          target: "over",
        },
        PLANT: {
          actions: {
            type: "plant",
            params: ({ event }) => ({ index: event.index }),
          },
        },
        SELL: {
          target: "game",
        },
        THRASH: {
          target: "game",
        },
      },
    },
    over: {
      after: {
        "5000": {
          target: "splash",
        },
      },
    },
  },
});
