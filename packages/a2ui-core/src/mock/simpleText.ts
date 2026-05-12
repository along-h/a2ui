export const simpleTextMockMessages = [
  {
    surfaceUpdate: {
      surfaceId: "mock-simple-text",
      components: [
        {
          id: "text-component",
          component: {
            Text: {
              text: {
                literalString: "Hello, A2UI!",
              },
              usageHint: "body",
            },
          },
        },
      ],
    },
  },
  {
    beginRendering: {
      surfaceId: "mock-simple-text",
      root: "text-component",
      catalogId:
        "https://a2ui.org/specification/v0_8/catalogs/minimal/minimal_catalog.json",
    },
  },
] as const;
