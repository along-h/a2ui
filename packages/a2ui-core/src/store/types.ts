export type A2UiRenderFunction = (props: Record<string, unknown>) => unknown;

export type A2UiRenderMap = Record<string, A2UiRenderFunction>;

export interface Surface {
  surfaceId: string;
  beginRender: boolean;
  rootNode?: HydrateNode;
}

export interface HydrateNode {
  id: string;
  _vnode: unknown;
  ownerSurfaceId: string;
  protocol: string;
}

export enum ErrorType {
  PARSE_ERROR = "PARSE_ERROR",
}

export interface A2UiError {
  id: string;
  type: ErrorType;
  content: string;
}

export interface A2UiStoreData {
  surfaceMap: Record<string, Surface>;
  hydrateNodeMap: Record<string, HydrateNode>;
  errorMap: Record<string, A2UiError>;
  renderMap: A2UiRenderMap;
}

export interface CreateSurfaceInput {
  surfaceId: string;
  beginRender?: boolean;
  rootNode?: HydrateNode;
}

export interface UpdateSurfaceInput {
  beginRender?: boolean;
  rootNode?: HydrateNode;
}

export interface RemoveSurfaceOptions {
  removeNodes?: boolean;
}

export interface UpsertHydrateNodeInput {
  id: string;
  _vnode: unknown;
  ownerSurfaceId: string;
  protocol: string;
}

export interface UpsertErrorInput {
  id: string;
  type: ErrorType;
  content: string;
}
