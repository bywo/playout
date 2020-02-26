import React, { useState, useMemo, useEffect } from "react";
import {
  Library,
  isComponentDesc,
  ElementRenderer,
  dereference,
  ElementDesc,
  Child,
  value
} from "../lib";
import Tree from "./Tree";
import Pane from "./Pane";
import Canvas from "./Canvas";
import StyleEditor from "./StyleEditor";

import produce from "immer";
const _ = require("lodash");

export default function Editor() {
  const [state, setState] = useState<Library>(() => ({
    components: {
      Button: {
        type: "component",
        component: {
          type: "componentDesc",
          render: {
            type: "elementDesc",
            elementType: "div",
            style: {
              background: { type: "value", value: "rgba(87,125,155,1)" },
              borderRadius: { type: "value", value: "100px" },
              display: { type: "value", value: "inline-block" },
              padding: { type: "value", value: "10px 20px" },
              color: { type: "value", value: "white" }
            },
            children: [
              { type: "dereference", target: "props", key: "children" }
            ]
          }
        },
        examples: {
          A: { children: "hello world" },
          B: { children: "sup baby" }
        }
      },
      component1: {
        type: "component",
        component: {
          type: "componentDesc",
          render: { type: "elementDesc", elementType: "div" }
        },
        examples: { A: {} }
      }
    }
  }));
  const [stateJson, setStateJson] = useState(() => JSON.stringify(state));

  const [selected, setSelected] = useState<string | null>(null);
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<number[]>([]);

  useEffect(() => {
    setStateJson(JSON.stringify(state));
  }, [state]);

  const componentDesc = selected
    ? state.components[selected].component
    : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100vh" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "33%",
          background: "#eee",
          borderRight: "solid 1px #ccc"
        }}
      >
        <Pane title="Components">
          {state &&
            state.components &&
            Object.keys(state.components)
              .filter(name => isComponentDesc(state.components[name].component))
              .map(name => (
                <div
                  style={{
                    padding: 4,
                    borderTop: "solid 1px #ddd",
                    background: name === selected ? "#ccc" : "transparent"
                  }}
                  onClick={() => {
                    setSelected(name);
                    setSelectedExample(
                      Object.keys(state.components[name].examples)[0]
                    );
                    setSelectedNode([]);
                  }}
                >
                  {name}
                </div>
              ))}
          <button
            onClick={() => {
              setState(
                produce(state, lib => {
                  let componentName = _.uniqueId("component");
                  while (lib.components.hasOwnProperty(componentName)) {
                    componentName = _.uniqueId("component");
                  }
                  lib.components[componentName] = {
                    type: "component",
                    component: {
                      type: "componentDesc",
                      render: {
                        type: "elementDesc",
                        elementType: "div"
                      }
                    },
                    examples: {
                      A: {}
                    }
                  };
                })
              );
            }}
          >
            New component
          </button>
        </Pane>
        {selected && componentDesc && (
          <Pane title="Tree">
            <Tree
              library={state}
              selected={componentDesc}
              updateTree={(tree: ElementDesc) => {
                setState(
                  produce(state, lib => {
                    const componentDesc = selected
                      ? lib.components[selected].component
                      : undefined;

                    if (isComponentDesc(componentDesc)) {
                      componentDesc.render = tree;
                    }
                  })
                );
              }}
            />
          </Pane>
        )}
        {selected && isComponentDesc(componentDesc) && selectedNode && (
          <Pane title="Style">
            <StyleEditor
              setStyle={s => {
                const nextLib = produce(state, lib => {
                  const componentDesc = selected
                    ? lib.components[selected].component
                    : undefined;

                  if (isComponentDesc(componentDesc) && selectedNode) {
                    let cur = componentDesc.render;
                    for (const index of selectedNode) {
                      if (!cur.children) {
                        throw new Error("invalid selected node");
                      }
                      const child = cur.children[index];
                      if (typeof child === "string") {
                        throw new Error("can't edit style of string");
                      }
                      if (child.type === "dereference") {
                        throw new Error("invalid selected node (deref)");
                      }
                      cur = child;
                    }

                    cur.style = s;
                  }
                });

                setState(nextLib);
              }}
              library={state}
              componentDesc={componentDesc}
              selectedNode={selectedNode}
            />
          </Pane>
        )}
        <Pane title="Raw">
          <textarea
            onChange={e => setStateJson(e.target.value)}
            value={stateJson}
          ></textarea>
          <button onClick={() => setState(JSON.parse(stateJson))}>Load</button>
        </Pane>
      </div>
      <div
        style={{
          background: "#eee",
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Canvas>
          {selected && selectedExample && (
            <ElementRenderer
              library={state}
              element={selected}
              props={state.components[selected].examples[selectedExample]}
            />
          )}
        </Canvas>
      </div>
    </div>
  );
}
