import {
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  init,
  parseProtocol,
  simpleLayoutMockMessages,
  type A2UiStoreState,
  type HydrateNode,
} from "a2ui-core";
import { renderMap } from "a2ui-react";

// 在模块加载时初始化全局 store 单例
const store = init({ renderMap });

interface StoredComponentEntry {
  id: string;
  component: Record<string, unknown>;
}

export function App() {
  const didBootstrapRef = useRef(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [storeState, setStoreState] = useState<A2UiStoreState>(store.getState);

  useEffect(() => {
    const unsubscribe = store.subscribe((state) => {
      setStoreState(state);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (didBootstrapRef.current) {
      return;
    }

    didBootstrapRef.current = true;

    const jsonl = simpleLayoutMockMessages
      .map((message) => JSON.stringify(message))
      .join("\n");

    parseProtocol(jsonl);
  }, []);

  const previews = useMemo(() => {
    return Object.values(storeState.surfaceMap).map((surface) => {
      const rootId = surface.rootNode?.id;
      return {
        surfaceId: surface.surfaceId,
        beginRender: surface.beginRender,
        content: rootId
          ? renderNodeById(rootId, storeState.hydrateNodeMap)
          : null,
      };
    });
  }, [storeState]);

  const storeSnapshot = useMemo(
    () =>
      JSON.stringify(
        {
          surfaceMap: storeState.surfaceMap,
          hydrateNodeMap: storeState.hydrateNodeMap,
          errorMap: storeState.errorMap,
        },
        null,
        2,
      ),
    [storeState],
  );

  const showStoreDialog = () => {
    dialogRef.current?.showModal();
  };

  const closeStoreDialog = () => {
    dialogRef.current?.close();
  };

  return (
    <main style={{ padding: "24px", fontFamily: "monospace" }}>
      <h1>A2UI Playground</h1>
      <h2>React 预览</h2>
      <p>已加载 simpleLayoutMockMessages 并通过 parser 生成 _vnode。</p>

      <section
        style={{
          border: "1px solid #d0d7de",
          borderRadius: "8px",
          padding: "16px",
          background: "#f6f8fa",
          minHeight: "160px",
          marginBottom: "16px",
        }}
      >
        {previews.map((preview) => (
          <div key={preview.surfaceId} style={{ marginBottom: "16px" }}>
            <div style={{ fontWeight: 700, marginBottom: "8px" }}>
              Surface: {preview.surfaceId} (beginRender:{" "}
              {String(preview.beginRender)})
            </div>
            <div>{preview.content}</div>
          </div>
        ))}
      </section>

      <button type="button" onClick={showStoreDialog}>
        查看 Store 内容
      </button>

      <dialog
        ref={dialogRef}
        style={{ width: "min(900px, 90vw)", maxHeight: "80vh" }}
      >
        <h3>Store Snapshot</h3>
        <pre
          style={{
            background: "#f5f5f5",
            padding: "16px",
            borderRadius: "6px",
            overflow: "auto",
            maxHeight: "60vh",
          }}
        >
          {storeSnapshot}
        </pre>
        <form method="dialog">
          <button type="button" onClick={closeStoreDialog}>
            关闭
          </button>
        </form>
      </dialog>
    </main>
  );
}

function renderNodeById(
  nodeId: string,
  hydrateNodeMap: Record<string, HydrateNode>,
): React.ReactNode {
  const node = hydrateNodeMap[nodeId];

  if (!node) {
    return null;
  }

  const children = getChildNodeIds(node)
    .map((childId) => renderNodeById(childId, hydrateNodeMap))
    .filter(Boolean);

  const maybeElement = node._vnode;

  if (isValidElement(maybeElement)) {
    const element = maybeElement as React.ReactElement<{
      children?: React.ReactNode;
    }>;
    const nextChildren =
      children.length > 0 ? children : element.props.children;
    return cloneElement(element, { key: node.id }, nextChildren);
  }

  if (isVNodeLike(maybeElement)) {
    const fallbackChildren = children.length > 0 ? children : undefined;
    return (
      <div key={node.id}>
        {maybeElement.type}
        {fallbackChildren}
      </div>
    );
  }

  return null;
}

function getChildNodeIds(node: HydrateNode): string[] {
  const entry = parseStoredComponent(node);

  if (!entry) {
    return [];
  }

  const componentPayload = Object.values(entry.component)[0] as Record<
    string,
    unknown
  >;

  const childrenExplicitList = (
    componentPayload.children as { explicitList?: unknown }
  )?.explicitList;

  if (Array.isArray(childrenExplicitList)) {
    return childrenExplicitList.filter(
      (item): item is string => typeof item === "string",
    );
  }

  const child = componentPayload.child;

  return typeof child === "string" ? [child] : [];
}

function parseStoredComponent(
  node: HydrateNode,
): StoredComponentEntry | undefined {
  try {
    const parsed = JSON.parse(node.protocol) as unknown;

    if (!parsed || typeof parsed !== "object") {
      return undefined;
    }

    const raw = parsed as Record<string, unknown>;

    if (
      typeof raw.id !== "string" ||
      !raw.component ||
      typeof raw.component !== "object"
    ) {
      return undefined;
    }

    return {
      id: raw.id,
      component: raw.component as Record<string, unknown>,
    };
  } catch {
    return undefined;
  }
}

function isVNodeLike(
  value: unknown,
): value is { type: string; props?: Record<string, unknown> } {
  if (!value || typeof value !== "object") {
    return false;
  }

  const raw = value as Record<string, unknown>;
  return typeof raw.type === "string";
}
