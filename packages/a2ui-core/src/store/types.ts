export interface Surface {
  surfaceId: string;
  beginRender: boolean;
  rootNodeId?: string;
}

export interface HydrateNode {
  id: string;
  vnode: unknown;
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
}

export interface CreateSurfaceInput {
  surfaceId: string;
  beginRender?: boolean;
  rootNodeId?: string;
}

export interface UpdateSurfaceInput {
  beginRender?: boolean;
  rootNodeId?: string;
}

export interface RemoveSurfaceOptions {
  removeNodes?: boolean;
}

export interface UpsertHydrateNodeInput {
  id: string;
  vnode: unknown;
  ownerSurfaceId: string;
  protocol: string;
}

export interface UpsertErrorInput {
  id: string;
  type: ErrorType;
  content: string;
}
