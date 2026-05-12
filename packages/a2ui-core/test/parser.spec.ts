import { expect } from "chai";

import { simpleTextMockMessages } from "../src/mock";
import { parseProtocol } from "../src/parser";
import { getA2UiStore, initStore } from "../src/store/store";

describe("parseProtocol", () => {
  const rootNodeId = simpleTextMockMessages[0].surfaceUpdate.components[0].id;
  const textProps =
    simpleTextMockMessages[0].surfaceUpdate.components[0].component.Text;

  beforeEach(() => {
    initStore();
  });

  it("handles surfaceUpdate message and creates hydrate nodes", () => {
    const surfaceUpdateLine = JSON.stringify(simpleTextMockMessages[0]);

    expect(() => parseProtocol(surfaceUpdateLine)).to.not.throw();

    const state = getA2UiStore().getState();
    const surface = state.surfaceMap["mock-simple-text"];
    const hydrateNode = state.hydrateNodeMap[rootNodeId];

    expect(surface.surfaceId).to.equal("mock-simple-text");
    expect(surface.beginRender).to.equal(false);
    expect(surface.rootNode).to.equal(hydrateNode);

    expect(hydrateNode).to.include({
      id: rootNodeId,
      ownerSurfaceId: "mock-simple-text",
    });
    expect(hydrateNode.protocol).to.equal(
      JSON.stringify(simpleTextMockMessages[0].surfaceUpdate.components[0]),
    );
    expect(hydrateNode._vnode).to.deep.equal({
      type: "Text",
      props: {
        text: {
          literalString: "Hello, A2UI!",
        },
        usageHint: "body",
      },
    });
  });

  it("renders component instance with renderMap when renderer exists", () => {
    initStore({
      renderMap: {
        Text: (props) => ({
          kind: "rendered-text",
          props,
        }),
      },
    });

    parseProtocol(JSON.stringify(simpleTextMockMessages[0]));

    const state = getA2UiStore().getState();
    expect(state.hydrateNodeMap[rootNodeId]?._vnode).to.deep.equal({
      kind: "rendered-text",
      props: textProps,
    });
  });

  it("handles beginRendering message and marks surface as renderable", () => {
    const beginRenderingLine = JSON.stringify(simpleTextMockMessages[1]);

    parseProtocol(beginRenderingLine);

    const state = getA2UiStore().getState();
    expect(state.surfaceMap["mock-simple-text"]).to.deep.equal({
      surfaceId: "mock-simple-text",
      beginRender: true,
      rootNode: undefined,
    });
  });

  it("handles dataModelUpdate message without breaking existing state", () => {
    const payload = {
      dataModelUpdate: {
        surfaceId: "mock-simple-text",
        path: "/",
        contents: [{ key: "greeting", valueString: "hello" }],
      },
    };

    parseProtocol(JSON.stringify(payload));

    const state = getA2UiStore().getState();
    expect(state.surfaceMap).to.deep.equal({});
    expect(state.hydrateNodeMap).to.deep.equal({});
  });

  it("handles deleteSurface message and removes surface with hydrate nodes", () => {
    const input = [
      simpleTextMockMessages[0],
      simpleTextMockMessages[1],
      {
        deleteSurface: {
          surfaceId: "mock-simple-text",
        },
      },
    ]
      .map((line) => JSON.stringify(line))
      .join("\n");

    parseProtocol(input);

    const state = getA2UiStore().getState();
    expect(state.surfaceMap["mock-simple-text"]).to.equal(undefined);
    expect(state.hydrateNodeMap[rootNodeId]).to.equal(undefined);
  });

  it("supports JSONL payload with multiple lines", () => {
    const jsonlInput = simpleTextMockMessages
      .map((line) => JSON.stringify(line))
      .join("\n");

    expect(() => parseProtocol(jsonlInput)).to.not.throw();

    const state = getA2UiStore().getState();
    expect(state.surfaceMap["mock-simple-text"]?.beginRender).to.equal(true);
    expect(state.surfaceMap["mock-simple-text"]?.rootNode).to.equal(
      state.hydrateNodeMap[rootNodeId],
    );
  });

  it("throws on invalid JSON input", () => {
    expect(() => parseProtocol("{")).to.throw();
  });
});
