import { getA2UiStore } from "../store/store";
import type { A2UiStoreState } from "../store/store";
import type { A2UiRenderMap } from "../store/types";
import type { A2UiVNode } from "../vnode";

interface BeginRenderingMessage {
  beginRendering: {
    surfaceId: string;
    root: string;
    catalogId?: string;
    styles?: Record<string, unknown>;
  };
}

interface SurfaceComponent {
  id: string;
  component: Record<string, unknown>;
  weight?: number;
}

interface ParsedComponent {
  type: string;
  props: Record<string, unknown>;
}

interface SurfaceUpdateMessage {
  surfaceUpdate: {
    surfaceId: string;
    components: SurfaceComponent[];
  };
}

interface DataModelEntry {
  key: string;
  valueString?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
  valueMap?: Array<{
    key: string;
    valueString?: string;
    valueNumber?: number;
    valueBoolean?: boolean;
  }>;
}

interface DataModelUpdateMessage {
  dataModelUpdate: {
    surfaceId: string;
    path?: string;
    contents: DataModelEntry[];
  };
}

interface DeleteSurfaceMessage {
  deleteSurface: {
    surfaceId: string;
  };
}

export type A2UiServerToClientMessage =
  | BeginRenderingMessage
  | SurfaceUpdateMessage
  | DataModelUpdateMessage
  | DeleteSurfaceMessage;

export type A2UiProtocol = A2UiServerToClientMessage[];

export function parseProtocol(input: string): A2UiProtocol {
  const messages = parseMessages(input);
  const store = getA2UiStore().getState();

  for (const message of messages) {
    if ("surfaceUpdate" in message) {
      handleSurfaceUpdate(message, store);
      continue;
    }

    if ("beginRendering" in message) {
      handleBeginRendering(message, store);
      continue;
    }

    if ("dataModelUpdate" in message) {
      handleDataModelUpdate(message);
      continue;
    }

    if ("deleteSurface" in message) {
      handleDeleteSurface(message, store);
    }
  }

  return messages;
}

function parseMessages(input: string): A2UiProtocol {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmedInput) as unknown;

    if (Array.isArray(parsed)) {
      return parsed as A2UiProtocol;
    }

    if (isMessage(parsed)) {
      return [parsed];
    }
  } catch {
    return parseJsonLines(trimmedInput);
  }

  throw new Error(
    "A2UI protocol payload must be a message, message array, or JSONL.",
  );
}

function parseJsonLines(input: string): A2UiProtocol {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line) => {
    const parsed = JSON.parse(line) as unknown;

    if (!isMessage(parsed)) {
      throw new Error(
        "Each JSONL line must be one valid A2UI server-to-client message.",
      );
    }

    return parsed;
  });
}

function handleBeginRendering(
  message: BeginRenderingMessage,
  store: A2UiStoreState,
): void {
  const {
    beginRendering: { surfaceId, root },
  } = message;
  const rootNode = store.getHydrateNode(root);
  const existingSurface = store.getSurface(surfaceId);

  if (!existingSurface) {
    store.createSurface({
      surfaceId,
      beginRender: true,
      rootNode,
    });
    return;
  }

  store.updateSurface(surfaceId, {
    beginRender: true,
    rootNode,
  });
}

function handleSurfaceUpdate(
  message: SurfaceUpdateMessage,
  store: A2UiStoreState,
): void {
  const {
    surfaceUpdate: { surfaceId, components },
  } = message;

  if (!store.getSurface(surfaceId)) {
    store.createSurface({ surfaceId });
  }

  for (const componentEntry of components) {
    const parsedComponent = parseComponent(componentEntry.component);
    const renderedComponent = renderComponentInstance(
      parsedComponent,
      store.renderMap,
    );

    store.upsertHydrateNode({
      id: componentEntry.id,
      ownerSurfaceId: surfaceId,
      _vnode: renderedComponent ?? toVNode(parsedComponent),
      protocol: JSON.stringify(componentEntry),
    });
  }
}

function handleDataModelUpdate(_message: DataModelUpdateMessage): void {}

function handleDeleteSurface(
  message: DeleteSurfaceMessage,
  store: A2UiStoreState,
): void {
  const {
    deleteSurface: { surfaceId },
  } = message;

  store.removeSurface(surfaceId, { removeNodes: true });
}

function parseComponent(component: Record<string, unknown>): ParsedComponent {
  const [type, rawProps] = Object.entries(component)[0] ?? [];

  if (!type) {
    throw new Error(
      "A2UI component payload must contain one component type key.",
    );
  }

  return {
    type,
    props: (rawProps ?? {}) as Record<string, unknown>,
  };
}

function toVNode(component: ParsedComponent): A2UiVNode {
  return {
    type: component.type,
    props: component.props,
  };
}

function renderComponentInstance(
  component: ParsedComponent,
  renderMap: A2UiRenderMap,
): unknown {
  const render = renderMap[component.type];

  if (!render) {
    return undefined;
  }

  return render(component.props);
}

function isMessage(value: unknown): value is A2UiServerToClientMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const raw = value as Record<string, unknown>;
  const keys = [
    "beginRendering",
    "surfaceUpdate",
    "dataModelUpdate",
    "deleteSurface",
  ].filter((key) => key in raw);

  return keys.length === 1;
}
