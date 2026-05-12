export const simpleLayoutMockMessages = [
  {
    surfaceUpdate: {
      surfaceId: "mock-simple-layout",
      components: [
        {
          id: "root",
          component: {
            Column: {
              children: {
                explicitList: ["title", "action_button"],
              },
              distribution: "center",
              alignment: "center",
            },
          },
        },
        {
          id: "title",
          component: {
            Text: {
              text: {
                literalString: "A2UI Layout Preview1",
              },
              usageHint: "h1",
            },
          },
        },
        {
          id: "action_button",
          component: {
            Button: {
              child: "button_label",
              primary: true,
              action: {
                name: "button_clicked",
              },
            },
          },
        },
        {
          id: "button_label",
          component: {
            Text: {
              text: {
                literalString: "Click Me",
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
      surfaceId: "mock-simple-layout",
      root: "root",
      catalogId:
        "https://a2ui.org/specification/v0_8/catalogs/minimal/minimal_catalog.json",
    },
  },
] as const;
