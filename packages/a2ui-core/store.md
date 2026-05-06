
1. 维护原始协议
2. . surface管理
3. 组件节点 - hydrateNodeMap
4. . Error

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
  /**JSON协议*/
  protocal: string;
}

enum ErrorType {
  PARE_ERROR,
}

interface A2UiError {
  type: ErrorType;
  content: string;
}

store里面还有对surfaceMap，HydrateNodeMap，ErrorMap的更新、删除、查找、添加操作

为了解除对react的依赖
store 通过zustand/vanilla 实现状态管理
store是一个全局单例的状态，需要导出一个方法可以拿到store实例
