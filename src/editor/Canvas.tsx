import React, { ReactNode, useState, useEffect, useLayoutEffect } from "react";

export default function Canvas({ children }: { children: ReactNode }) {
  const [dimensions, setDimensions] = useState([400, 200]);
  const [initialDimensions, setInitialDimensions] = useState([400, 200]);
  const [trackingMouse, setTrackingMouse] = useState(false);
  const [downCoords, setDownCoords] = useState<[number, number]>([0, 0]);

  useLayoutEffect(() => {
    if (trackingMouse) {
      const moveListener = (e: MouseEvent) => {
        const xDiff = e.pageX - downCoords[0];
        const yDiff = e.pageY - downCoords[1];
        setDimensions([
          initialDimensions[0] + xDiff * 2,
          initialDimensions[1] + yDiff * 2
        ]);
        return false;
      };
      const upListener = (e: MouseEvent) => {
        const xDiff = e.pageX - downCoords[0];
        const yDiff = e.pageY - downCoords[1];
        setDimensions([
          initialDimensions[0] + xDiff * 2,
          initialDimensions[1] + yDiff * 2
        ]);
        setTrackingMouse(false);
      };

      document.addEventListener("mousemove", moveListener);
      document.addEventListener("mouseup", upListener);

      return () => {
        document.removeEventListener("mousemove", moveListener);
        document.removeEventListener("mouseup", upListener);
      };
    }
  }, [trackingMouse]);

  return (
    <div
      style={{
        margin: "auto auto",
        background: "white",
        boxShadow: "0 0 0 1px black",
        width: dimensions[0],
        height: dimensions[1],
        position: "relative"
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: -5,
          right: -5,
          background: "rgba(0, 0, 0, 0.5)",
          width: 10,
          height: 10
        }}
        onMouseDown={e => {
          setInitialDimensions(dimensions);
          setDownCoords([e.pageX, e.pageY]);
          setTrackingMouse(true);
        }}
      ></div>
      {children}
    </div>
  );
}
