import { useEffect, useState } from "react";

import { init, type A2UiStoreState } from "a2ui-core";

// 在模块加载时初始化全局 store 单例
const store = init();

export function App() {
  // 将 store 当前状态同步到 React 组件
  const [storeState, setStoreState] = useState<A2UiStoreState>(store.getState);

  useEffect(() => {
    // 订阅 store 变化，有更新时同步刷新页面显示
    const unsubscribe = store.subscribe((state) => {
      setStoreState(state);
    });

    return unsubscribe;
  }, []);

  return (
    <main style={{ padding: "24px", fontFamily: "monospace" }}>
      <h1>A2UI Playground</h1>
      <h2>Store 初始化状态</h2>
      {/* 将 store state 中的数据部分格式化输出，忽略 action 方法 */}
      <pre
        style={{
          background: "#f5f5f5",
          padding: "16px",
          borderRadius: "6px",
          overflow: "auto",
        }}
      >
        {JSON.stringify(
          {
            surfaceMap: storeState.surfaceMap,
            hydrateNodeMap: storeState.hydrateNodeMap,
            errorMap: storeState.errorMap,
          },
          null,
          2,
        )}
      </pre>
    </main>
  );
}
