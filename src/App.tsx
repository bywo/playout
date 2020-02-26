import React, { useState, Component, ReactElement } from "react";
import "./App.css";
import Normal from "./Normal";
import Interpreted from "./Interpreted";
import Editor from "./editor/Editor";

// function App() {
//   const [show, setShow] = useState(true);
//   return (
//     <div /*onClick={() => setShow(!show)}*/>
//       {show && <Normal />}
//       <Interpreted />
//     </div>
//   );
// }

function App() {
  return <Editor />;
}

export default App;
