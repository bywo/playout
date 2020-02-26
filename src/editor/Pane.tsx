import React from "react";

export default function Pane({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ borderBottom: "solid 1px #666" }}>
      <div
        style={{
          padding: 4,
          fontSize: "12px",
          borderBottom: "solid 1px #666",
          background: "#e3e3e3"
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
