export interface A2UiVNode {
  type: string;
  props?: Record<string, unknown>;
  children?: A2UiVNode[];
}
