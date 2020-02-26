import React, { useState } from "react";
import {
  ElementDesc,
  ElementRenderer,
  ComponentDesc,
  value,
  dereference,
  Library
} from "./lib";

export default function Interpreted() {
  return <ElementRenderer library={library} element="App" />;
}

const BoxDesc: ComponentDesc = {
  type: "componentDesc",
  props: {
    selected: false
  },
  render: {
    type: "elementDesc",
    elementType: "div",
    style: {
      width: value(100),
      height: value(100),
      background: {
        type: "conditional",
        predicate: { type: "dereference", target: "props", key: "selected" },
        true: value("black"),
        false: value("gray")
      }
    },
    children: [
      {
        type: "dereference",
        target: "props",
        key: "children"
      }
    ]
  }
};

// fold(combine(map(-1, key("left")), map(1, key("right"))), "add");
// const index = mod(2, )

// const $keyEvents = fromEvent(document.body, "keydown").map(
//   e => (e as KeyboardEvent).keyCode
// );

// const $index = xs
//   .merge(
//     $keyEvents.filter(n => n === 37).map(() => -1),
//     $keyEvents.filter(n => n === 39).map(() => 1)
//   )
//   .fold((acc, n) => acc + n, 0)
//   .map(n => mod(n, 2));

// merge(
//   map(
//     value(-1),
//     filter(equals(value(37)), map(deference("keyCode"), $keyDown))
//   ),
//   map(value(1), filter(equals(value(37)), map(deference("keyCode"), $keyDown)))
// );

const blah = {
  type: "combine",
  streams: [
    {
      type: "pipe",
      source: {
        type: "merge",
        streams: [
          {
            type: "pipe",
            source: "keydown",
            operators: [
              {
                type: "dereference",
                key: "keyCode"
              },
              {
                type: "equality",
                right: value(37)
              },
              {
                type: "map",
                predicate: value(-1)
              }
            ]
          },
          {
            type: "pipe",
            source: "keydown",
            operators: [
              {
                type: "dereference",
                key: "keyCode"
              },
              {
                type: "equality",
                right: value(39)
              },
              {
                type: "map",
                predicate: value(1)
              }
            ]
          }
        ]
      },
      operators: [
        {
          type: "fold",
          predicate: {
            type: "builtinFunction",
            name: "add"
          }
        }
      ]
    },
    {
      type: "value",
      value: 2
    }
  ],
  iterator: {
    type: "functionCall",
    function: {
      type: "builtinFunction",
      name: "mod"
    }
  }
};

const AppDesc: ComponentDesc = {
  type: "componentDesc",
  state: {
    index: 0
  },
  render: {
    type: "elementDesc",
    elementType: "Layout",
    props: {
      type: value("horizontal")
    },
    children: [
      {
        type: "elementDesc",
        elementType: "Box",
        props: {
          selected: {
            type: "equals",
            left: dereference("state", "index"),
            right: value(0)
          }
        },
        children: [dereference("state", "index")]
      },
      {
        type: "elementDesc",
        elementType: "Box",
        props: {
          selected: {
            type: "equals",
            left: dereference("state", "index"),
            right: value(1)
          }
        },
        children: ["B"]
      }
    ]
  }
};

const library: Library = {
  components: {
    Layout: {
      type: "component",
      component: function({
        type,
        children
      }: {
        type: "horizontal" | "vertical";
        children?: React.ReactChildren;
      }) {
        return (
          <div
            style={{
              display: "flex",
              flexDirection: type === "horizontal" ? "row" : "column"
            }}
          >
            {children}
          </div>
        );
      },
      examples: {}
    },

    Box: {
      type: "component",
      component: BoxDesc,
      examples: {}
    },

    App: {
      type: "component",
      component: AppDesc,
      examples: {}
    }
  }
};
