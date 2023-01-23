import { useState } from "react";
// import reactLogo from "./assets/react.svg";
import PathFindingHexGrid from "./PathFindingInHexGrid/PathFindingHexGrid";
// import Canvas from "./PathfindingVisualizer/Canvas";
// import SquareGrid from "./PathfindingVisualizer/chatgpt";
// import PathfindingVisualizer from "./PathfindingVisualizer/PathfindingVisualizer";
// import "./App.css";
// import Footer from "./PathFindingInHexGrid/Footer";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <PathFindingHexGrid />

      {/* <Canvas /> */}
      {/* <Footer /> */}
      {/* <SquareGrid /> */}
      {/* <PathfindingVisualizer /> */}
    </div>
  );
}

export default App;
