import { expect } from "chai";

// 从源码直接引入 store 的初始化方法和单例访问方法
import { getA2UiStore, initStore } from "../src/store/store";

// 测试套件：验证 initStore 的初始化行为
describe("initStore", () => {
  // 初始化后应返回一个全部 map 为空的 store，并且与 getA2UiStore 返回同一个单例
  it("creates a fresh singleton with empty store maps", () => {
    const store = initStore();
    const state = store.getState();
    expect(store).to.equal(getA2UiStore());
    expect(state.surfaceMap).to.deep.equal({});
    expect(state.hydrateNodeMap).to.deep.equal({});
    expect(state.errorMap).to.deep.equal({});
  });

  // 再次调用 initStore 应重置单例，不保留之前的状态
  it("replaces a dirty singleton with a new store instance", () => {
    const firstStore = initStore();
    firstStore.getState().createSurface({ surfaceId: "surface-1" });
    const secondStore = initStore();
    expect(firstStore).to.not.equal(secondStore);
    expect(secondStore.getState().surfaceMap).to.deep.equal({});
  });
});
