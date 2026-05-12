import type { A2UiRenderMap } from "a2ui-core";

export type A2UiProtocol = Record<string, unknown>;

export interface A2UiRendererProps {
  protocol?: A2UiProtocol;
}

interface TextComponentProps {
  text?: {
    literalString?: string;
    path?: string;
  };
  usageHint?: string;
}

interface StackComponentProps {
  distribution?: string;
  alignment?: string;
  children?: unknown;
}

interface ButtonComponentProps {
  primary?: boolean;
  children?: unknown;
}

function Text(props: TextComponentProps) {
  return (
    <span data-usage-hint={props.usageHint}>
      {props.text?.literalString ?? ""}
    </span>
  );
}

function Row(props: StackComponentProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 12,
        justifyContent: mapDistribution(props.distribution),
        alignItems: mapAlignment(props.alignment),
      }}
    >
      {props.children as React.ReactNode}
    </div>
  );
}

function Column(props: StackComponentProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        justifyContent: mapDistribution(props.distribution),
        alignItems: mapAlignment(props.alignment),
      }}
    >
      {props.children as React.ReactNode}
    </div>
  );
}

function Button(props: ButtonComponentProps) {
  return (
    <button
      type="button"
      style={{
        border: "none",
        borderRadius: 8,
        padding: "10px 16px",
        background: props.primary ? "#1f6feb" : "#d0d7de",
        color: props.primary ? "#fff" : "#24292f",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {props.children as React.ReactNode}
    </button>
  );
}

export const renderMap: A2UiRenderMap = {
  Text: (props: Record<string, unknown>) => (
    <Text {...(props as TextComponentProps)} />
  ),
  Row: (props: Record<string, unknown>) => (
    <Row {...(props as StackComponentProps)} />
  ),
  Column: (props: Record<string, unknown>) => (
    <Column {...(props as StackComponentProps)} />
  ),
  Button: (props: Record<string, unknown>) => (
    <Button {...(props as ButtonComponentProps)} />
  ),
};

function mapDistribution(
  value?: string,
): React.CSSProperties["justifyContent"] {
  switch (value) {
    case "spaceBetween":
      return "space-between";
    case "center":
      return "center";
    case "end":
      return "flex-end";
    case "start":
    default:
      return "flex-start";
  }
}

function mapAlignment(value?: string): React.CSSProperties["alignItems"] {
  switch (value) {
    case "center":
      return "center";
    case "end":
      return "flex-end";
    case "stretch":
      return "stretch";
    case "start":
    default:
      return "flex-start";
  }
}

export function A2UiRenderer(_props: A2UiRendererProps) {
  return null;
}
