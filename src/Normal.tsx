import React, { useState } from "react";
import { useIsomorphicLayoutEffect } from "react-use";
import xs, { Stream } from "xstream";
import fromEvent from "xstream/extra/fromEvent";

function useObservable<T>(observable$: Stream<T>, initialValue: T) {
  const [value, update] = useState<T | undefined>(initialValue);

  useIsomorphicLayoutEffect(() => {
    const s = observable$.subscribe({
      next: v => {
        update(v);
      }
    });
    return () => s.unsubscribe();
  }, [observable$]);

  return value;
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export default function Normal() {
  const [$index, set$index] = useState(() => xs.of(0));
  const index = useObservable($index, 0);

  useIsomorphicLayoutEffect(() => {
    const $keyEvents = fromEvent(document.body, "keydown").map(
      e => (e as KeyboardEvent).keyCode
    );

    const $index = xs
      .merge(
        $keyEvents.filter(n => n === 37).map(() => -1),
        $keyEvents.filter(n => n === 39).map(() => 1)
      )
      .fold((acc, n) => acc + n, 0)
      .map(n => mod(n, 2));

    set$index($index);
  }, []);

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Box selected={index === 0}></Box>
        <Box selected={index === 1}></Box>
      </div>
    </div>
  );
}

function Box({ selected }: { selected?: boolean }) {
  return (
    <div
      style={{
        width: 100,
        height: 100,
        background: selected ? "black" : "gray",
        transition: "background 700ms"
      }}
    />
  );
}
