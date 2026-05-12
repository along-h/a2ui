export * from "./parser";
export * from "./mock";
export * from "./store";
export * from "./treebuilder";
export * from "./vnode";

// a2ui-core 对外的显式初始化入口，内部调用 createA2UiStore 创建全局单例
export { initStore as init } from "./store/store";
