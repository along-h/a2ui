/**
 * Store设计
 *
 * 1. 维护原始协议
 * 2. surface管理
 * 3. 组件节点 - hydrateNodeMap
 * 4. Error
 */

interface A2UiStore {
  surfaceMap: Record<string, Surface>;
  hydrateNodeMap: Record<string, HydrateNode>;
}

interface Surface {
  surfaceId: string;
  beginrender: boolean;
  rootNode: HydrateNode;
}

interface HydrateNode {
  id: string;
  _vnode: ReactElement;
  /** 代表属于哪个surface */
  ownerSurfaceId: string;
  /** JSON协议 */
  protocal: string;
}

enum ErrorType {
  PARE_ERROR,
}

interface A2UiError {
  type: ErrorType;
  content: string;
}

//
