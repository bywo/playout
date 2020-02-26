import React from "react";
import { Library, ComponentDesc, Child, StyleDesc, value } from "../lib";
import produce from "immer";

export default function StyleEditor({
  library,
  componentDesc,
  selectedNode,
  setStyle
}: {
  library: Library;
  componentDesc: ComponentDesc;
  selectedNode: number[];
  setStyle: (s: StyleDesc) => void;
}) {
  const node = traverseToNode(componentDesc.render, selectedNode);

  if (typeof node === "string") {
    return <div />;
  }

  if (node.type === "dereference") {
    return <div>Can't edit styles of deref</div>;
  }

  const style = node.style || {};

  return (
    <div>
      <BackgroundEditor style={style} updateStyle={setStyle} />
      {Object.keys(style)
        .filter(key => key !== "background")
        .map(key => {
          const val = style[key];
          let valEl;
          if (val.type === "value") {
            valEl = val.value;

            if (key === "background") {
              valEl = (
                <input
                  type="color"
                  value={val.value as any}
                  onChange={e => {
                    setStyle(
                      produce(style, style => {
                        style.background = value(e.target.value);
                      })
                    );
                  }}
                />
              );
            }
          }

          return (
            <div key={key}>
              {key}: {valEl}
            </div>
          );
        })}
    </div>
  );
}

function traverseToNode(el: Child, position: number[]): Child {
  if (position.length === 0) {
    return el;
  }

  if (typeof el === "string" || el.type !== "elementDesc") {
    throw new Error("invalid position");
  }

  const children = el.children;

  if (!children) {
    throw new Error("invalid position");
  }

  if (!Array.isArray(children)) {
    if (position[0] === 0) {
      return children;
    } else {
      throw new Error("invalid position");
    }
  }

  return traverseToNode(children[position[0]], position.slice(1));
}

const rgbaRegex = /rgba\((\d+),(\d+),(\d+),([0-9.]+)\)/;
function BackgroundEditor({
  style,
  updateStyle
}: {
  style: StyleDesc;
  updateStyle: (s: StyleDesc) => void;
}) {
  const background = style.background || value(""); // assuming rgba for now
  if (background.type === "conditional") {
    return <div>Can't edit a conditional yet</div>;
  }

  const { value: val } = background;
  if (typeof val !== "string") {
    throw new Error("Invalid background");
  }

  const matches = val.match(rgbaRegex) || ["", "0", "0", "0", "0"];

  const [, r, g, b, a] = matches;
  const red = parseInt(r, 10).toString(16);
  const green = parseInt(g, 10).toString(16);
  const blue = parseInt(b, 10).toString(16);
  const alpha = parseFloat(a);

  return (
    <div>
      Background
      <div>
        Color:
        <input
          type="color"
          value={`#${red}${green}${blue}`}
          onChange={e => {
            const hex = e.target.value;
            const red = parseInt(hex.slice(-6, -4), 16);
            const green = parseInt(hex.slice(-4, -2), 16);
            const blue = parseInt(hex.slice(-2), 16);
            let a = alpha;
            if (background.value === "") {
              // we were previously tranparent
              a = 1;
            }

            updateStyle(
              produce(style, style => {
                style.background = value(
                  `rgba(${red},${green},${blue},${alpha})`
                );
              })
            );
          }}
        />
      </div>
      <div>
        Opacity:
        <input
          type="number"
          value={alpha}
          step=".01"
          min="0"
          max="1"
          onChange={e => {
            const alpha = e.target.value;
            updateStyle(
              produce(style, style => {
                style.background = value(`rgba(${r},${g},${b},${alpha})`);
              })
            );
          }}
        ></input>
      </div>
    </div>
  );
}
