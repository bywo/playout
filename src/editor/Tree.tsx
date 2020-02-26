import React from "react";
import {
  Library,
  isComponentDesc,
  ElementDesc,
  ComponentDesc,
  Child
} from "../lib";
import produce from "immer";
const _ = require("lodash");

export default function Tree({
  library,
  selected,
  updateTree
}: {
  library: Library;
  selected: ComponentDesc | React.SFC<any>;
  updateTree: (tree: ElementDesc) => void;
}) {
  const selectedComponent =
    library && library.components && selected ? selected : null;
  if (!selectedComponent) {
    return <div>"Select a component"</div>;
  }
  if (isComponentDesc(selectedComponent)) {
    return (
      <TreeNode
        library={library}
        tree={selectedComponent.render}
        position={[]}
        updateTree={(tree: Child) => {
          if (typeof tree === "string") {
            throw new Error("root cannot be string");
          }

          if (tree.type === "dereference") {
            throw new Error("root cannot be deref");
          }

          updateTree(tree);
        }}
      />
    );
  }
  return <div>"Built-in component"</div>;
}

function TreeNode({
  library,
  tree,
  position,
  updateTree
}: {
  library: Library;
  tree: Child;
  position: number[];
  updateTree: (tree: Child) => void;
}) {
  if (typeof tree === "string") {
    return (
      <div style={{ color: "gray", fontSize: "12px", padding: 5 }}>
        "{tree}"
      </div>
    );
  }

  if (tree.type === "dereference") {
    return (
      <div style={{ color: "gray", fontSize: "12px", padding: 5 }}>
        {`{`} {tree.target}.{tree.key} {`}`}
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          fontSize: "12px",
          padding: 5,
          boxShadow: "inset 0 0 0 1px black"
        }}
      >
        {tree.elementType}
      </div>
      <div style={{ marginLeft: 10 }}>
        <div
          style={{ height: 4, background: "purple" }}
          onClick={() => {
            updateTree(
              produce(tree, t => {
                t.children = [
                  "testing" + _.uniqueId(),
                  ...(t.children ? t.children : [])
                ];
              })
            );
          }}
        ></div>
        {tree.children?.map((child, i) => (
          <>
            <TreeNode
              library={library}
              tree={child}
              position={[...position, i]}
              updateTree={updatedTree => {
                updateTree(
                  produce(tree, t => {
                    const { children } = t;
                    if (children) {
                      children[i] = updatedTree;
                    }
                  })
                );
              }}
            />
            <div
              style={{ height: 4, background: "purple" }}
              onClick={() => {
                updateTree(
                  produce(tree, t => {
                    const before = t.children ? t.children.slice(0, i + 1) : [];
                    const after = t.children ? t.children.slice(i + 1) : [];
                    t.children = [
                      ...before,
                      "testing" + _.uniqueId(),
                      ...after
                    ];
                  })
                );
              }}
            ></div>
          </>
        ))}
      </div>
    </div>
  );
}
