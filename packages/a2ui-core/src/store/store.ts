import { createStore, type StoreApi } from "zustand/vanilla";

import type {
  A2UiError,
  A2UiStoreData,
  CreateSurfaceInput,
  HydrateNode,
  RemoveSurfaceOptions,
  Surface,
  UpdateSurfaceInput,
  UpsertErrorInput,
  UpsertHydrateNodeInput,
} from "./types";

const initialStoreData = (): A2UiStoreData => ({
  surfaceMap: {},
  hydrateNodeMap: {},
  errorMap: {},
});

export interface A2UiStoreState extends A2UiStoreData {
  createSurface: (input: CreateSurfaceInput) => Surface;
  updateSurface: (surfaceId: string, input: UpdateSurfaceInput) => Surface;
  getSurface: (surfaceId: string) => Surface | undefined;
  removeSurface: (surfaceId: string, options?: RemoveSurfaceOptions) => void;
  upsertHydrateNode: (input: UpsertHydrateNodeInput) => HydrateNode;
  getHydrateNode: (nodeId: string) => HydrateNode | undefined;
  removeHydrateNode: (nodeId: string) => void;
  listHydrateNodesBySurface: (surfaceId: string) => HydrateNode[];
  upsertError: (input: UpsertErrorInput) => A2UiError;
  getError: (errorId: string) => A2UiError | undefined;
  removeError: (errorId: string) => void;
  clearErrors: () => void;
  reset: () => void;
}

export type A2UiStore = StoreApi<A2UiStoreState>;

/**
 * 创建一个独立的 store 实例。
 * 测试场景或不想复用全局单例时，可以通过这个工厂方法拿到一份带可选初始数据的新实例。
 */
export function createA2UiStore(
  initialData?: Partial<A2UiStoreData>,
): A2UiStore {
  return createStore<A2UiStoreState>()((set, get) => ({
    ...initialStoreData(),
    ...initialData,
    createSurface: (input) => {
      const surface: Surface = {
        surfaceId: input.surfaceId,
        beginRender: input.beginRender ?? false,
        rootNodeId: input.rootNodeId,
      };

      set((state) => ({
        surfaceMap: {
          ...state.surfaceMap,
          [surface.surfaceId]: surface,
        },
      }));

      return surface;
    },
    updateSurface: (surfaceId, input) => {
      const currentSurface = get().surfaceMap[surfaceId];

      if (!currentSurface) {
        throw new Error(`Surface \"${surfaceId}\" does not exist.`);
      }

      const nextSurface: Surface = {
        ...currentSurface,
        ...input,
      };

      set((state) => ({
        surfaceMap: {
          ...state.surfaceMap,
          [surfaceId]: nextSurface,
        },
      }));

      return nextSurface;
    },
    getSurface: (surfaceId) => get().surfaceMap[surfaceId],
    removeSurface: (surfaceId, options) => {
      set((state) => {
        const surfaceMap = { ...state.surfaceMap };
        delete surfaceMap[surfaceId];

        if (!options?.removeNodes) {
          return { surfaceMap };
        }

        const hydrateNodeMap = Object.fromEntries(
          Object.entries(state.hydrateNodeMap).filter(
            ([, node]) => node.ownerSurfaceId !== surfaceId,
          ),
        );

        return {
          surfaceMap,
          hydrateNodeMap,
        };
      });
    },
    upsertHydrateNode: (input) => {
      const surface = get().surfaceMap[input.ownerSurfaceId];

      if (!surface) {
        throw new Error(
          `Cannot attach hydrate node to missing surface \"${input.ownerSurfaceId}\".`,
        );
      }

      const node: HydrateNode = {
        id: input.id,
        vnode: input.vnode,
        ownerSurfaceId: input.ownerSurfaceId,
        protocol: input.protocol,
      };

      set((state) => ({
        hydrateNodeMap: {
          ...state.hydrateNodeMap,
          [node.id]: node,
        },
        surfaceMap: surface.rootNodeId
          ? state.surfaceMap
          : {
              ...state.surfaceMap,
              [surface.surfaceId]: {
                ...surface,
                rootNodeId: node.id,
              },
            },
      }));

      return node;
    },
    getHydrateNode: (nodeId) => get().hydrateNodeMap[nodeId],
    removeHydrateNode: (nodeId) => {
      set((state) => {
        const targetNode = state.hydrateNodeMap[nodeId];

        if (!targetNode) {
          return {};
        }

        const hydrateNodeMap = { ...state.hydrateNodeMap };
        delete hydrateNodeMap[nodeId];

        const ownerSurface = state.surfaceMap[targetNode.ownerSurfaceId];
        const surfaceMap =
          ownerSurface?.rootNodeId === nodeId
            ? {
                ...state.surfaceMap,
                [ownerSurface.surfaceId]: {
                  ...ownerSurface,
                  rootNodeId: undefined,
                },
              }
            : state.surfaceMap;

        return {
          hydrateNodeMap,
          surfaceMap,
        };
      });
    },
    listHydrateNodesBySurface: (surfaceId) =>
      Object.values(get().hydrateNodeMap).filter(
        (node) => node.ownerSurfaceId === surfaceId,
      ),
    upsertError: (input) => {
      const error: A2UiError = {
        id: input.id,
        type: input.type,
        content: input.content,
      };

      set((state) => ({
        errorMap: {
          ...state.errorMap,
          [error.id]: error,
        },
      }));

      return error;
    },
    getError: (errorId) => get().errorMap[errorId],
    removeError: (errorId) => {
      set((state) => {
        const errorMap = { ...state.errorMap };
        delete errorMap[errorId];
        return { errorMap };
      });
    },
    clearErrors: () => {
      set({ errorMap: {} });
    },
    reset: () => {
      set(initialStoreData());
    },
  }));
}

let storeSingleton: A2UiStore | undefined;

/**
 * 重新初始化全局 store 单例，并返回新的实例。
 * 这是运行时显式启动 store 的入口。
 */
export function initStore(initialData?: Partial<A2UiStoreData>): A2UiStore {
  storeSingleton = createA2UiStore(initialData);
  return storeSingleton;
}

/**
 * 返回全局 store 单例。
 * 如果运行时还没有主动调用 initStore，会在这里按默认初始状态懒加载创建。
 */
export function getA2UiStore(): A2UiStore {
  storeSingleton ??= initStore();
  return storeSingleton;
}
