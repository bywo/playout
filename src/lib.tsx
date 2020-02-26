import React, { ReactElement, useState } from "react";

interface Scope {
  props: Props;
  state: Props;
}

interface Equals {
  type: "equals";
  left: Dereference | Value;
  right: Dereference | Value;
}

interface Value {
  type: "value";
  value: number | string | boolean;
}

export function value(val: number | string | boolean): Value {
  return {
    type: "value",
    value: val
  };
}

interface PropsDesc {
  [k: string]: Equals | Conditional | Value;
}

type Props = { [k: string]: number | string | boolean };

interface Dereference {
  type: "dereference";
  target: "props" | "state" | Dereference;
  key: string;
}

export function dereference(
  target: "props" | "state" | Dereference,
  key: string
): Dereference {
  return {
    type: "dereference",
    target,
    key
  };
}

interface Conditional {
  type: "conditional";
  predicate: Dereference;
  true: Value;
  false: Value;
}

export interface StyleDesc {
  [k: string]: Conditional | Value;
}

interface Style {
  [k: string]: number | string | boolean;
}

export type Child = ElementDesc | Dereference | string;

export interface ElementDesc {
  type: "elementDesc";
  elementType: string;
  style?: StyleDesc;
  props?: PropsDesc;
  children?: Child[];
}

function processRender(library: Library, el: Child, scope: Scope) {
  console.log("processRender", el, scope);
  if (typeof el === "string") {
    return el;
  }

  if (el.type === "dereference") {
    const deref = el;
    const child = evaluate(el, scope) as any; // TODO: fix type
    return child;
  }

  const props = el.props && processProps(el.props, scope);
  const style = el.style && processStyles(el.style, scope);
  const children: ReactElement[] = el.children
    ? Array.isArray(el.children)
      ? el.children.map(c => processRender(library, c, scope))
      : [processRender(library, el.children, scope)]
    : [];

  return (
    <ElementRenderer
      library={library}
      element={el.elementType}
      props={{ ...props, style, children }}
    />
  );
}

export function ElementRenderer({
  library,
  element,
  props
}: {
  library: Library;
  element: string;
  props?: any;
}) {
  // figure out component type
  const component = library.components[element];

  const stateDesc =
    component && isComponentDesc(component) ? component.state || {} : {};
  const [state] = useState(stateDesc);

  if (component) {
    if (isComponentDesc(component.component)) {
      // create local scope (state, passed props)

      // evaluate props and styles before passing to children
      return processRender(library, component.component.render, {
        props,
        state
      });
    } else {
      return React.createElement(component.component, props);
    }
  }

  // native component (e.g. "div")
  return React.createElement(element, props);
}

function processProps(props: PropsDesc, scope: Scope) {
  const out: Props = {};
  for (const k of Object.keys(props)) {
    const val = props[k];
    out[k] = evaluate(val, scope);
  }

  return out;
}

function evaluate(
  ast: Conditional | Equals | Value | Dereference,
  scope: Scope
): string | number | boolean {
  if (ast.type === "conditional") {
    return evaluate(ast.predicate, scope)
      ? evaluate(ast.true, scope)
      : evaluate(ast.false, scope);
  } else if (ast.type === "equals") {
    return evaluate(ast.left, scope) == evaluate(ast.right, scope);
  } else if (ast.type === "dereference") {
    const target =
      ast.target === "props"
        ? scope.props
        : ast.target === "state"
        ? scope.state
        : evaluate(ast.target, scope);
    return (target as any)[ast.key];
  } else {
    return ast.value;
  }
}

function processStyles(style: StyleDesc, scope: Scope) {
  const out: Style = {};
  for (const k of Object.keys(style)) {
    const val = style[k];
    out[k] = evaluate(val, scope);
  }

  return out;
}

export interface ComponentDesc {
  type: "componentDesc";
  props?: {
    [k: string]: any;
  };
  state?: {
    [k: string]: any;
  };
  render: ElementDesc;
}

export function isComponentDesc(input: any): input is ComponentDesc {
  return input.type === "componentDesc";
}

interface Component {
  type: "component";
  component: React.SFC<any> | ComponentDesc;
  examples: {
    [k: string]: any;
  };
}

export interface Library {
  components: {
    [k: string]: Component;
  };
}
