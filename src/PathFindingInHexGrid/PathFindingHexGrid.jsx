import { useRef, useEffect, useState } from "react";
// import { create } from "tar";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../Pictures/PFV_adobe_express.svg";
import startImg from "../Pictures/green_hex_adobe_express.svg";
import endImg from "../Pictures/red_hex_adobe_express.svg";
import pathImg from "../Pictures/lime_hex_adobe_express.svg";
import wallImg from "../Pictures/brown_hex_adobe_express.svg";
import unvisitedImg from "../Pictures/grey_hex_adobe_express.svg";
import visitedImg from "../Pictures/orange_hex_adobe_express.svg";
import { clone, cloneDeep } from "lodash";
import Button from "react-bootstrap/Button";
import { Container, Row, Col } from "react-bootstrap";
import Footer from "./Footer";

import "./HexGrid.css";
import {
  dijkstra,
  getNodesInShortestPathOrderDijstra,
} from "../Algorithms/Dijstra";
import { getNodesInShortestPathOrderAstar, Astar } from "../Algorithms/Astar";

import {
  BreadthFirstSearch,
  getNodesInShortestPathOrderBFS,
} from "../Algorithms/BreadthFirstSearch";

const START_NODE_ROW = 6;
const START_NODE_COL = -10;
const FINISH_NODE_ROW = -8;
const FINISH_NODE_COL = 38;

export default function Canvas() {
  const canvasRef = useRef(null);
  const canvasCoord = useRef(null);
  const [currentHex, setCurrentHex] = useState({
    q: 0,
    r: 0,
    s: 0,
  });

  const createNode = (q, r) => {
    return {
      q,
      r,
      isStart: r === START_NODE_ROW && q === START_NODE_COL,
      isFinish: r === FINISH_NODE_ROW && q === FINISH_NODE_COL,
      distance: Infinity,
      heuristicDistance: Infinity,
      totalDistance: Infinity,
      isVisited: false,
      isWall: false,
      previousNode: null,
    };
  };

  const hexProps = {
    hexSize: 20,
    hexOrigin: { x: 300, y: 300 },
  };

  const [canvasState, setCanvasState] = useState({
    canvasSize: {
      canvasWidth: window.innerWidth,
      canvasHeight: window.innerHeight - 126 - 40,
    },
    hexParams: GetHexParameters(),
  });

  const [gridMap, setGridMap] = useState({
    grid: getInitialGrid(),
    mouseIsPressed: false,
  });

  const [wallSet, setWallSet] = useState(new Set());

  const [selectedAlgorithm, setSelectedAlgorithm] = useState("BFS");

  const [startHex, updateStartNode] = useState({
    q: START_NODE_COL,
    r: START_NODE_ROW,
    clicked: false,
  });
  const [finishHex, updateFinishNode] = useState({
    q: FINISH_NODE_COL,
    r: FINISH_NODE_ROW,
    clicked: false,
  });

  const [reRenderBool, updateReRenderBool] = useState(false);
  // CREATING NODE

  // THIS USEEFFECT GETS CALLED TO JUST DRAW THE INITIAL GRID OF HEXAGON ON THE CANVAS
  // AFTER FIRST RENDER - ONLY ONCE

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext("2d");
    DrawHexagons(context);
    // setGridMap({ ...gridMap, grid: grid });
    if (!context) {
      return;
    }
    console.log("change");
    // console.log(grid);

    // to Fill the Finish Node with a color
    FillHexColor(
      context,
      HexToPixel(
        Hex(
          FINISH_NODE_COL,
          FINISH_NODE_ROW,
          -FINISH_NODE_ROW - FINISH_NODE_COL
        )
      ),
      "red",
      2
    );
    // to Fill the End Node with a color
    FillHexColor(
      context,
      HexToPixel(
        Hex(START_NODE_COL, START_NODE_ROW, -START_NODE_COL - START_NODE_ROW)
      ),
      "green",
      2
    );
  }, []);

  useEffect(() => {
    const canvasSecondCurrent = canvasCoord.current;
    const ctx = canvasSecondCurrent.getContext("2d");
    // const { canvasWidth, canvasHeight } = canvasState.canvasSize;
    const { canvasWidth, canvasHeight } = canvasState.canvasSize;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext("2d");
    DrawHexagons(context);
    // setGridMap({ ...gridMap, grid: grid });
    if (!context) {
      return;
    }
    console.log("change");
    // console.log(grid);

    // to Fill the Finish Node with a color
    FillHexColor(
      context,
      HexToPixel(Hex(finishHex.q, finishHex.r, -finishHex.r - finishHex.q)),
      "red",
      2
    );
    // to Fill the End Node with a color
    FillHexColor(
      context,
      HexToPixel(Hex(startHex.q, startHex.r, -startHex.q - startHex.r)),
      "green",
      2
    );

    console.log("change wallset");
    for (let wallNode of wallSet) {
      FillHexColor(ctx, wallNode, "Brown", 1);
    }
  }, [selectedAlgorithm, window.innerWidth]);

  useEffect(() => {
    const canvasSecondCurrent = canvasCoord.current;
    const ctx = canvasSecondCurrent.getContext("2d");
    // const { canvasWidth, canvasHeight } = canvasState.canvasSize;
    const { canvasWidth, canvasHeight } = canvasState.canvasSize;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext("2d");
    DrawHexagons(context);
    // setGridMap({ ...gridMap, grid: grid });
    if (!context) {
      return;
    }
    console.log("change");
    // console.log(grid);

    // to Fill the Finish Node with a color
    FillHexColor(
      context,
      HexToPixel(Hex(finishHex.q, finishHex.r, -finishHex.r - finishHex.q)),
      "red",
      2
    );
    // to Fill the End Node with a color
    FillHexColor(
      context,
      HexToPixel(Hex(startHex.q, startHex.r, -startHex.q - startHex.r)),
      "green",
      2
    );

    console.log("change wallset");
    for (let wallNode of wallSet) {
      FillHexColor(ctx, wallNode, "Brown", 1);
    }
  }, [startHex, finishHex, reRenderBool, window.innerWidth]);
  // THIS USEEFFECT GETS CALLED TO JUST DRAW THE INITIAL

  // useEffect(() => {
  //   const canvasSecondCurrent = canvasCoord.current;
  //   const ctx = canvasSecondCurrent.getContext("2d");
  //   const { canvasWidth, canvasHeight } = canvasState.canvasSize;
  //   ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  // }, [currentHex]);

  // useEffect(() => {});
  // function findNodeIndexInGrid(r, q, grid) {
  //   for (let i = 0; i < grid.length; i++) {
  //     for (let j = 0; j < grid[i].length; j++) {
  //       if (grid[i][j].q == q && grid[i][j].r == r) {
  //         return { i: i, j: j };
  //       }
  //     }
  //   }
  // }
  const getNewGridWithWallToggled = (grid, r, q) => {
    // console.log(grid);
    const newGrid = grid.slice();
    const { i, j } = findNodeIndexInGrid(r, q, grid);
    const node = newGrid[i][j];
    const newNode = {
      ...node,
      isWall: !node.isWall,
    };
    newGrid[i][j] = newNode;
    return newGrid;
  };

  function handleMouseDown(event, canvasPosition, canvasID) {
    // console.log("in mouse Down");
    // console.log(event.clientlet offsetX = event.clientX, event.clientlet offsetY = event.clientY);
    event.preventDefault();
    event.stopPropagation();

    let context = canvasID.getContext("2d");
    let offsetX = event.clientX - canvasPosition.left;
    let offsetY = event.clientY - canvasPosition.top;

    const { q, r, s } = CubeRound(PixelToHex(Point(offsetX, offsetY)));
    const object = HexToPixel(Hex(q, r, s));
    // console.log(q, startHex.q);
    // console.log(r, startHex.r);
    if (q === startHex.q && r === startHex.r) {
      console.log("in start Node");
      updateStartNode({ ...startHex, clicked: true });
      console.log(cloneDeep(startHex));
      FillHexColor(context, Point(object.x, object.y), "Green", 1);
      // return;
      setGridMap({ ...gridMap, mouseIsPressed: true });
      return;
    }
    if (q === finishHex.q && r === finishHex.r) {
      console.log("in finish Node");
      updateFinishNode({ ...finishHex, clicked: true });
      console.log(cloneDeep(finishHex));
      FillHexColor(context, Point(object.x, object.y), "red", 1);
      // return;
      setGridMap({ ...gridMap, mouseIsPressed: true });
      return;
    }

    if (
      !Array.from(wallSet).some(
        (item) => item.x === object.x && item.y === object.y
      )
    ) {
      const newGrid = getNewGridWithWallToggled(gridMap.grid, r, q);
      setGridMap({ ...gridMap, grid: newGrid, mouseIsPressed: true });
      setWallSet(new Set([...wallSet, object]));
      FillHexColor(context, Point(object.x, object.y), "Brown", 1);
    }

    // console.log(gridMap.grid);
  }

  function handleMouseEnter(event, canvasPosition, canvasID) {
    // console.log("in mouse Enter");
    // console.log(event.clientlet offsetX = event.clientX, event.clientlet offsetY = event.clientY);

    if (!gridMap.mouseIsPressed) return;
    event.preventDefault();
    event.stopPropagation();
    let context = canvasID.getContext("2d");
    let offsetX = event.clientX - canvasPosition.left;
    let offsetY = event.clientY - canvasPosition.top;
    const { q, r, s } = CubeRound(PixelToHex(Point(offsetX, offsetY)));
    const object = HexToPixel(Hex(q, r, s));

    // if (q == start.q && r == start.r){

    // }
    // if (!wallSet.has({ x, y }))
    if (startHex.clicked == true) {
      updateStartNode({
        ...startHex,
        q: q,
        r: r,
      });
      console.log("trying to move the start node");
      FillHexColor(context, Point(object.x, object.y), "Green", 1);
      // updateStartGrid(prevStart, r, q);
      // setGridMap({ ...gridMap, grid: newGrid });
      return;
    }
    if (finishHex.clicked == true) {
      updateFinishNode({
        ...finishHex,
        q: q,
        r: r,
      });
      console.log("trying to move the finish node");
      FillHexColor(context, Point(object.x, object.y), "red", 1);
      // updateStartGrid(prevStart, r, q);
      // setGridMap({ ...gridMap, grid: newGrid });
      return;
    }
    if (
      !Array.from(wallSet).some(
        (item) => item.x === object.x && item.y === object.y
      )
    ) {
      const newGrid = getNewGridWithWallToggled(gridMap.grid, r, q);
      setGridMap({ ...gridMap, grid: newGrid, mouseIsPressed: true });
      setWallSet(new Set([...wallSet, object]));
      FillHexColor(context, Point(object.x, object.y), "Brown", 1);
      // updateStartGrid(prevStart,r,q)
    }
    // console.log(gridMap.grid);
  }

  function handleMouseUp() {
    // console.log("in mouse up");
    // console.log(event.clientlet offsetX = event.clientX, event.clientlet offsetY = event.clientY);
    console.log(startHex);
    console.log(finishHex);
    updateStartNode({ ...startHex, clicked: false });
    updateFinishNode({ ...finishHex, clicked: false });

    setGridMap({ ...gridMap, mouseIsPressed: false });
  }

  function updateStartGrid(prevStart, r, q) {
    grid = gridMap.grid;
    startNodeIndex = findNodeIndexInGrid(prevStart.r, prevStart.q, grid);
    prevStart = grid[startNodeIndex.i][startNodeIndex.j];
    prevStart.isStart = false;
    currentNodeIndex = findNodeIndexInGrid(r, q, grid);
    currStart = grid[currentNodeIndex.i][currentNodeIndex.j];
    currStart.isStart = true;
  }

  // To get the initial grid

  function getInitialGrid() {
    const grid = [];
    const { canvasWidth, canvasHeight } = canvasState.canvasSize;
    const { hexHeight, hexWidth, vertDist, horizDist } = canvasState.hexParams;
    const hexOrigin = hexProps.hexOrigin;
    let qLeftSide = Math.round(hexOrigin.x / horizDist);
    let qRightSide = Math.round((canvasWidth - hexOrigin.x) / horizDist);
    let rTopSide = Math.round(hexOrigin.y / vertDist);
    let rBottomSide = Math.round((canvasHeight - hexOrigin.y) / vertDist);
    // console.log(qLeftSide, qRightSide, rTopSide, rBottomSide);
    var p = 0;
    for (let r = 0; r <= rBottomSide; r++) {
      let row = [];
      if (r % 2 == 0 && r !== 0) {
        p++;
      }

      for (let q = -qLeftSide; q <= qRightSide; q++) {
        const { x, y } = HexToPixel(Hex(q - p, r));
        if (
          x > hexWidth / 2 &&
          x < canvasWidth - hexWidth / 2 &&
          y > hexHeight / 2 &&
          y < canvasHeight - hexHeight / 2
        ) {
          // DrawHex(context, Point(x, y));
          // DrawHexcoordinates(context, Point(x, y), Hex(q - p, r, -q - r + p));
          row.push(createNode(q - p, r));
        }
      }
      if (row.length != 0) {
        grid.push(row);
      }
    }
    var n = 0;
    for (let r = -1; r >= -rTopSide; r--) {
      let row = [];
      if (r % 2 !== 0) n++;
      for (let q = -qLeftSide; q <= qRightSide; q++) {
        const { x, y } = HexToPixel(Hex(q + n, r));
        if (
          x > hexWidth / 2 &&
          x < canvasWidth - hexWidth / 2 &&
          y > hexHeight / 2 &&
          y < canvasHeight - hexHeight / 2
        ) {
          // DrawHex(context, Point(x, y));
          // DrawHexcoordinates(context, Point(x, y), Hex(q + n, r, -q - n - r));
          row.push(createNode(q + n, r));
        }
      }
      if (row.length != 0) {
        grid.push(row);
      }
    }
    // console.log(grid);
    return grid;
  }

  // TO DRAW A GRID OF HEXAGONS ON THE CANVAS

  function DrawHexagons(context) {
    const grid = [];
    const { canvasWidth, canvasHeight } = canvasState.canvasSize;
    const { hexHeight, hexWidth, vertDist, horizDist } = canvasState.hexParams;
    const hexOrigin = hexProps.hexOrigin;
    let qLeftSide = Math.round(hexOrigin.x / horizDist);
    let qRightSide = Math.round((canvasWidth - hexOrigin.x) / horizDist);
    let rTopSide = Math.round(hexOrigin.y / vertDist);
    let rBottomSide = Math.round((canvasHeight - hexOrigin.y) / vertDist);
    // console.log(qLeftSide, qRightSide, rTopSide, rBottomSide);
    var p = 0;
    for (let r = 0; r <= rBottomSide; r++) {
      let row = [];
      if (r % 2 == 0 && r !== 0) {
        p++;
      }

      for (let q = -qLeftSide; q <= qRightSide; q++) {
        const { x, y } = HexToPixel(Hex(q - p, r));
        if (
          x > hexWidth / 2 &&
          x < canvasWidth - hexWidth / 2 &&
          y > hexHeight / 2 &&
          y < canvasHeight - hexHeight / 2
        ) {
          DrawHex(context, Point(x, y));
          FillHexColor(context, Point(x, y), `hsl(204, 8%, 76%)`, 1);
          // DrawHexcoordinates(context, Point(x, y), Hex(q - p, r, -q - r + p));
          row.push(createNode(q - p, r));
        }
      }
      if (row.length != 0) {
        grid.push(row);
      }
    }
    var n = 0;
    for (let r = -1; r >= -rTopSide; r--) {
      let row = [];
      if (r % 2 !== 0) n++;
      for (let q = -qLeftSide; q <= qRightSide; q++) {
        const { x, y } = HexToPixel(Hex(q + n, r));
        if (
          x > hexWidth / 2 &&
          x < canvasWidth - hexWidth / 2 &&
          y > hexHeight / 2 &&
          y < canvasHeight - hexHeight / 2
        ) {
          DrawHex(context, Point(x, y));
          FillHexColor(context, Point(x, y), `hsl(204, 8%, 76%)`, 1);

          // DrawHexcoordinates(context, Point(x, y), Hex(q + n, r, -q - n - r));
          row.push(createNode(q + n, r));
        }
      }
      if (row.length != 0) {
        grid.push(row);
      }
    }
    // console.log(grid);
    return grid;
  }

  // TO DRAW OR WRITE THE COORDINATES OF A HEXAGON WITHIN ITSELF ON A GRID OF HEXAGONS

  function DrawHexcoordinates(context, center, hex) {
    const ctx = context;
    ctx.fillText(hex.s, center.x - 6, center.y + 14);
    ctx.fillText(hex.r, center.x + 6, center.y + 4);
    ctx.fillText(hex.q, center.x - 10, center.y - 6);
  }

  function HexToPixel(hex) {
    let hexOrigin = hexProps.hexOrigin;
    let x =
      hexProps.hexSize * (Math.sqrt(3) * hex.q + (Math.sqrt(3) / 2) * hex.r) +
      hexOrigin.x;
    let y = hexProps.hexSize * ((3 / 2) * hex.r) + hexOrigin.y;
    return Point(x, y);
  }

  function PixelToHex(p) {
    const origin = hexProps.hexOrigin;
    let q =
      ((Math.sqrt(3) / 3) * (p.x - origin.x) - (1 / 3) * (p.y - origin.y)) /
      hexProps.hexSize;
    let r = ((2 / 3) * (p.y - origin.y)) / hexProps.hexSize;
    return Hex(q, r, -q - r);
  }

  function CubeDirection(direction) {
    const cubeDirections = [
      Hex(+1, 0, -1),
      Hex(+1, -1, 0),
      Hex(0, -1, +1),
      Hex(-1, 0, +1),
      Hex(-1, +1, 0),
      Hex(0, +1, -1),
    ];
    return cubeDirections[direction];
  }

  function CubeAdd(a, b) {
    return Hex(a.q + b.q, a.r + b.r, a.s + b.s);
  }

  function GetCubeNeighbor(h, direction) {
    return CubeAdd(h, CubeDirection(direction));
  }

  function CubeRound(cube) {
    var q = Math.round(cube.q);
    var r = Math.round(cube.r);
    var s = Math.round(cube.s);

    var q_diff = Math.abs(q - cube.q);
    var r_diff = Math.abs(r - cube.r);
    var s_diff = Math.abs(s - cube.s);

    if (q_diff > r_diff && q_diff > s_diff) {
      q = -r - s;
    } else if (r_diff > s_diff) {
      r = -q - s;
    } else {
      s = -q - r;
    }

    return Hex(q, r, s);
  }

  //  FUNCTION TO DRAW A HEXAGON

  function DrawHex(context, center, color, width) {
    for (let i = 0; i <= 5; i++) {
      let start = GetHexCorner(center, i);
      let end = GetHexCorner(center, i + 1);
      DrawLine(
        context,
        { x: start.x, y: start.y },
        { x: end.x, y: end.y },
        color,
        width
      );
    }
  }

  function GetHexParameters() {
    let hexHeight = hexProps.hexSize * 2;
    let hexWidth = (Math.sqrt(3) / 2) * hexHeight;
    let vertDist = (hexHeight * 3) / 4;
    let horizDist = hexWidth;
    return { hexHeight, hexWidth, vertDist, horizDist };
  }

  // DRAWS A STRAIGHT LINE OF HEXAGON WHEN GIVEN THE START AND END OF HEXAGON CORNERS

  function DrawLine(context, start, end, color, width) {
    const ctx = context;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.closePath();
  }

  function FillHexColor(context, center, color, width) {
    const ctx = context;
    ctx.fillStyle = color;
    ctx.beginPath();
    let start = GetHexCorner(center, 0);
    ctx.moveTo(start.x, start.y);
    for (let i = 1; i <= 5; i++) {
      let coordinates = GetHexCorner(center, i);
      ctx.strokeStyle = "black";
      ctx.lineWidth = width;
      ctx.lineTo(coordinates.x, coordinates.y);
    }
    ctx.closePath();
    ctx.fill();
  }
  // GETS THE CORNER OF A HEXAGON WHEN GIVEN THE CENTER OF THE HEXAGON AND THE NUMBER OF THE HEXAGON

  function GetHexCorner(center, i) {
    let angle_deg = 60 * i + 30;
    let angle_rad = (Math.PI / 180) * angle_deg;
    let x = center.x + hexProps.hexSize * Math.cos(angle_rad);
    let y = center.y + hexProps.hexSize * Math.sin(angle_rad);
    return Point(x, y);
  }

  // HELPER FUNCTION TO GET THE ARIAL COORDINATES Q, R, AND S

  function Hex(q, r, s) {
    return {
      q: q,
      r: r,
      s: s,
    };
  }

  // HELPER FUNCTION TO GET THE X, AND Y OF THE HEXAGONAL PLAIN

  function Point(x, y) {
    return {
      x: x,
      y: y,
    };
  }
  function DrawNeighbors(context, h) {
    for (let i = 0; i <= 5; i++) {
      const { q, r, s } = GetCubeNeighbor(Hex(h.q, h.r, h.s), i);
      const { x, y } = HexToPixel(Hex(q, r, s));
      DrawHex(context, Point(x, y), "red", 2);
    }
  }

  function findNodeIndexInGrid(r, q, grid) {
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j].q == q && grid[i][j].r == r) {
          return { i: i, j: j };
        }
      }
    }
  }

  // HANDLES THE MOUSE MOVE FUNCTION
  // THIS GETS CALLED EVERY TIME YOU MOVE THE MOUSE ON THE CANVAS
  // function HandleMouseMove(event, canvasPosition, canvasID) {
  //   let context = canvasID.getContext("2d");
  //   let offsetX = event.clientX - canvasPosition.left;
  //   let offsetY = event.clientY - canvasPosition.top;
  //   const { q, r, s } = CubeRound(PixelToHex(Point(offsetX, offsetY)));
  //   const { x, y } = HexToPixel(Hex(q, r, s));
  //   DrawNeighbors(context, Hex(q, r, s));

  //   // DrawHex(context, Point(x, y), "lime", 2);
  //   FillHexColor(context, Point(x, y), "lime", 1);

  //   // let center = Point(x, y);
  //   // let startTime;
  //   // let transitionDuration = 1000;
  //   // let color = "green";
  //   // let width = 2;
  //   // function AnimateHex(timestamp) {
  //   //   if (!startTime) startTime = timestamp;

  //   //   let progress = (timestamp - startTime) / transitionDuration;
  //   //   // Calculate the current color based on the progress
  //   //   let r = Math.round(255 * progress);
  //   //   let g = Math.round(255 * (1 - progress));
  //   //   let b = 0;
  //   //   let BgColor = `rgb(${r}, ${g}, ${b})`;

  //   //   for (let i = 0; i <= 5; i++) {
  //   //     let start = GetHexCorner(center, i);
  //   //     let end = GetHexCorner(center, i + 1);
  //   //     DrawLine(
  //   //       context,
  //   //       { x: start.x, y: start.y },
  //   //       { x: end.x, y: end.y },
  //   //       color,
  //   //       width
  //   //     );
  //   //   }
  //   //   context.closePath();
  //   //   context.fillStyle = BgColor;
  //   //   if (progress < 1) {
  //   //     // If the transition is not complete, request another animation frame
  //   //     requestAnimationFrame(AnimateHex);
  //   //   }
  //   // }
  //   // requestAnimationFrame(AnimateHex);

  //   console.log(`q : ${q}, r : ${r}, s: ${s},  x: ${x}, y: ${y}`);

  //   if (currentHex.q != q || currentHex.r != r || currentHex.s != s) {
  //     const handleChangeQRS = () => {
  //       setCurrentHex({ ...currentHex, q: q, r: r, s: s });
  //     };
  //     handleChangeQRS();
  //   }

  //   console.log(currentHex);
  // }

  // //---------------------------dijstras-------------------------
  // //------------------------------------------------------------
  // // Performs Dijkstra's algorithm; returns *all* nodes in the order
  // // in which they were visited. Also makes nodes point back to their
  // // previous node, effectively allowing us to compute the shortest path
  // // by backtracking from the finish node.
  // function dijkstra(grid, startHex, finishNode) {
  //   console.log(grid);
  //   const visitedNodesInOrder = [];
  //   startNode.distance = 0;
  //   const unvisitedNodes = getAllNodes(grid);
  //   // console.log(unvisitedNodes);
  //   while (!!unvisitedNodes.length) {
  //     sortNodesByDistance(unvisitedNodes);
  //     // console.log(unvisitedNodes);
  //     const closestNode = unvisitedNodes.shift();
  //     // console.log(closestNode);
  //     // If we encounter a wall, we skip it.
  //     if (closestNode.isWall) {
  //       // console.log(closestNode);
  //       continue;
  //     }
  //     // If the closest node is at a distance of infinity,
  //     // we must be trapped and should therefore stop.
  //     if (closestNode.distance === Infinity) return visitedNodesInOrder;
  //     closestNode.isVisited = true;
  //     // console.log(closestNode);
  //     visitedNodesInOrder.push(closestNode);
  //     if (closestNode === finishNode) return visitedNodesInOrder;
  //     updateUnvisitedNeighbors(closestNode, grid);
  //   }
  // }

  // function sortNodesByDistance(unvisitedNodes) {
  //   // console.log(unvisitedNodes);
  //   // const _ = require("lodash");

  //   unvisitedNodes.sort((nodeA, nodeB) => {
  //     if (nodeA.distance === nodeB.distance) {
  //       return 0;
  //     }
  //     return nodeA.distance < nodeB.distance ? -1 : 1;
  //   });
  // }

  // function updateUnvisitedNeighbors(node, grid) {
  //   // console.log(getHexUnvisitedNeighbors(node));
  //   const unvisitedNeighbors = getHexUnvisitedNeighbors(node, grid);
  //   for (const neighbor of unvisitedNeighbors) {
  //     if (!neighbor.isVisited && node.distance + 1 < neighbor.distance) {
  //       neighbor.distance = node.distance + 1;
  //       neighbor.previousNode = node;
  //     }
  //   }
  //   // console.log(unvisitedNeighbors);
  // }

  // function getHexUnvisitedNeighbors(h, grid) {
  //   // console.log(h);
  //   const neighbors = [];
  //   for (let k = 0; k <= 5; k++) {
  //     const { canvasWidth, canvasHeight } = canvasState.canvasSize;
  //     const { hexHeight, hexWidth, vertDist, horizDist } =
  //       canvasState.hexParams;
  //     const { q, r, s } = GetCubeNeighbor(Hex(h.q, h.r, h.s), k);
  //     const { x, y } = HexToPixel(Hex(q, r));
  //     if (
  //       x > hexWidth / 2 &&
  //       x < canvasWidth - hexWidth / 2 &&
  //       y > hexHeight / 2 &&
  //       y < canvasHeight - hexHeight / 2
  //     ) {
  //       const { i, j } = findNodeIndexInGrid(r, q, grid);
  //       // console.log(i, j);
  //       neighbors.push(grid[i][j]);
  //     }
  //     //   DrawHex(context, Point(x, y), "red", 2);
  //   }
  //   // console.log(neighbors.filter((neighbor) => !neighbor.isVisited));
  //   return neighbors.filter((neighbor) => !neighbor.isVisited);
  // }
  // //------------------------------------------------------------------------------------//
  // // HELPER FUNCTION TO GET THE ARIAL COORDINATES Q, R, AND S
  // function findNodeIndexInGrid(r, q, grid) {
  //   for (let i = 0; i < grid.length; i++) {
  //     for (let j = 0; j < grid[i].length; j++) {
  //       if (grid[i][j].q == q && grid[i][j].r == r) {
  //         return { i: i, j: j };
  //       }
  //     }
  //   }
  // }

  // // TO TEST IF A NODE IS A WALL
  // function testIsWall(grid) {
  //   // for (let i = 0; i < grid.length; i++) {
  //   //   for (let j = 0; j < grid[i].length; j++) {
  //   //     if (grid[i][j].isWall) {
  //   //       console.log(grid[i][j]);
  //   //     }
  //   //   }
  //   // }
  //   console.log(wallSet);
  // }
  // function Hex(q, r, s) {
  //   return {
  //     q: q,
  //     r: r,
  //     s: s,
  //   };
  // }

  // // HELPER FUNCTION TO GET THE X, AND Y OF THE HEXAGONAL PLAIN

  // function Point(x, y) {
  //   return {
  //     x: x,
  //     y: y,
  //   };
  // }

  // //------------------------------------------------------------------------------------//

  // function getAllNodes(grid) {
  //   const nodes = [];
  //   for (let i = 0; i < grid.length; i++) {
  //     for (let j = 0; j < grid[i].length; j++) {
  //       nodes.push(grid[i][j]);
  //     }
  //   }
  //   return nodes;
  // }

  // // Backtracks from the finishNode to find the shortest path.
  // // Only works when called *after* the dijkstra method above.
  // function getNodesInShortestPathOrder(finishNode) {
  //   const nodesInShortestPathOrder = [];
  //   let currentNode = finishNode;
  //   while (currentNode !== null) {
  //     nodesInShortestPathOrder.unshift(currentNode);
  //     currentNode = currentNode.previousNode;
  //   }
  //   return nodesInShortestPathOrder;
  // }
  //---------------------------------------------------------------------------------
  // function animateHex(timestamp, context, center, width) {
  //   if (!start) start = timestamp;
  //   const progress = timestamp - start;
  //   const color = `hsl(${50 + progress / 10}, 100%, 50%)`;
  //   ctx.fillStyle = color;
  //   const ctx = context;

  //   ctx.beginPath();
  //   let start = GetHexCorner(center, 0);
  //   ctx.moveTo(start.x, start.y);
  //   for (let i = 1; i <= 5; i++) {
  //     let coordinates = GetHexCorner(center, i);
  //     ctx.strokeStyle = color;
  //     ctx.lineWidth = width;
  //     ctx.lineTo(coordinates.x, coordinates.y);
  //   }
  //   ctx.closePath();
  //   ctx.fill();

  //   if (progress < 1000) {
  //     requestAnimationFrame((timestamp) =>
  //       animateHex(timestamp, context, center, width)
  //     );
  //   }
  // }

  function visualizeAlgorithm(canvasID) {
    const grid = cloneDeep(gridMap.grid);
    updateReRenderBool(!reRenderBool);
    console.log(grid);
    console.log(startHex.r, startHex.q);
    console.log(findNodeIndexInGrid(startHex.r, startHex.q, grid));
    console.log(selectedAlgorithm);
    const startNode =
      grid[findNodeIndexInGrid(startHex.r, startHex.q, grid).i][
        findNodeIndexInGrid(startHex.r, startHex.q, grid).j
      ];

    // console.log(startNode);

    const finishNode =
      grid[findNodeIndexInGrid(finishHex.r, finishHex.q, grid).i][
        findNodeIndexInGrid(finishHex.r, finishHex.q, grid).j
      ];
    // console.log(finishNode);
    let context = canvasID.getContext("2d");

    if (selectedAlgorithm === "A*") {
      const visitedNodesInOrder = Astar(grid, startNode, finishNode);
      const nodesInShortestPathOrder =
        getNodesInShortestPathOrderAstar(finishNode);
      console.log(JSON.parse(JSON.stringify(visitedNodesInOrder)));
      console.log(JSON.parse(JSON.stringify(nodesInShortestPathOrder)));

      AnimateDijstras(context, visitedNodesInOrder, nodesInShortestPathOrder);
    } else if (selectedAlgorithm === "Dijstra's") {
      const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
      const nodesInShortestPathOrder =
        getNodesInShortestPathOrderDijstra(finishNode);
      console.log(JSON.parse(JSON.stringify(visitedNodesInOrder)));
      console.log(JSON.parse(JSON.stringify(nodesInShortestPathOrder)));
      AnimateDijstras(context, visitedNodesInOrder, nodesInShortestPathOrder);
    } else if (selectedAlgorithm === "BFS") {
      const visitedNodesInOrder = BreadthFirstSearch(
        grid,
        startNode,
        finishNode
      );
      const nodesInShortestPathOrder =
        getNodesInShortestPathOrderBFS(finishNode);
      console.log(JSON.parse(JSON.stringify(visitedNodesInOrder)));
      console.log(JSON.parse(JSON.stringify(nodesInShortestPathOrder)));
      AnimateDijstras(context, visitedNodesInOrder, nodesInShortestPathOrder);
    } else {
      return;
    }
    // console.log(visitedNodesInOrder);
  }

  function AnimateDijstras(
    context,
    visitedNodesInOrder,
    nodesInShortestPathOrder
  ) {
    for (let k = 0; k < visitedNodesInOrder.length; k++) {
      if (k == visitedNodesInOrder.length - 1) {
        // console.log("last node");
        setTimeout(() => {
          AnimateHexNodesInOrder(context, nodesInShortestPathOrder);
        }, 50 * k);
      }
      setTimeout(() => {
        const object = HexToPixel(visitedNodesInOrder[k]);
        FillHexColor(
          context,
          Point(object.x, object.y),
          `hsl(280, 100%, 50%)`,
          1
        );
        // requestAnimationFrame((timestamp) =>
        //   animateHex(timestamp, context, Point(object.x, object.y), color, width)
        // );
        let start = null;
        function animateHex(timestamp, context, center, width) {
          if (!start) start = timestamp;
          const progress = timestamp - start;
          const color = `hsl(${280 + progress / 10}, 100%, 50%)`;
          const ctx = context;
          ctx.fillStyle = color;

          ctx.beginPath();
          let position = GetHexCorner(center, 0);
          ctx.moveTo(position.x, position.y);
          for (let i = 1; i <= 5; i++) {
            let coordinates = GetHexCorner(center, i);
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.lineTo(coordinates.x, coordinates.y);
          }
          ctx.closePath();
          ctx.fill();

          if (progress < 1000) {
            requestAnimationFrame((timestamp) =>
              animateHex(timestamp, ctx, center, width)
            );
          }
        }
        requestAnimationFrame((timestamp) =>
          animateHex(
            timestamp,
            context,
            HexToPixel(
              Hex(
                visitedNodesInOrder[k].q,
                visitedNodesInOrder[k].r,
                -visitedNodesInOrder[k].q - visitedNodesInOrder[k].r
              )
            ),
            1
          )
        );
      }, 50 * k);
    }
  }

  function AnimateHexNodesInOrder(context, nodesInOrder) {
    for (let k = 0; k < nodesInOrder.length; k++) {
      setTimeout(() => {
        const object = HexToPixel(nodesInOrder[k]);
        FillHexColor(
          context,
          Point(object.x, object.y),
          `hsl(50, 100%, 50%)`,
          1
        );
        // requestAnimationFrame((timestamp) =>
        //   animateHex(timestamp, context, Point(object.x, object.y), color, width)
        // );
        let start = null;
        function animateHex(timestamp, context, center, width) {
          if (!start) start = timestamp;
          const progress = timestamp - start;
          const color = `hsl(${50 + progress / 10}, 100%, 50%)`;
          const ctx = context;
          ctx.fillStyle = color;

          ctx.beginPath();
          let position = GetHexCorner(center, 0);
          ctx.moveTo(position.x, position.y);
          for (let i = 1; i <= 5; i++) {
            let coordinates = GetHexCorner(center, i);
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.lineTo(coordinates.x, coordinates.y);
          }
          ctx.closePath();
          ctx.fill();

          if (progress < 1000) {
            requestAnimationFrame((timestamp) =>
              animateHex(timestamp, ctx, center, width)
            );
          }
        }
        requestAnimationFrame((timestamp) =>
          animateHex(
            timestamp,
            context,
            HexToPixel(
              Hex(
                nodesInOrder[k].q,
                nodesInOrder[k].r,
                -nodesInOrder[k].q - nodesInOrder[k].r
              )
            ),
            1
          )
        );
      }, 50 * k);
    }
  }
  function handleChange(event) {
    setSelectedAlgorithm(event.target.value);
  }
  return (
    <div className="p-0">
      <nav className="navbar navbar-expand-lg navbar-light bg-black py-0">
        <a href="/" className="navbar-brand mb-0 ">
          <img
            className="d-inline-block align-top"
            src={logo}
            width="170"
            height="50"
          />
        </a>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <select
                className="form-control"
                value={selectedAlgorithm}
                onChange={handleChange}
              >
                <option value="BFS">BFS</option>
                <option value="Dijstra's">Dijkstra's</option>
                <option value="A*">A*</option>
              </select>
            </li>
          </ul>
        </div>
        <Button
          variant="secondary"
          onClick={() => visualizeAlgorithm(canvasCoord.current)}
        >
          Visualize
        </Button>
      </nav>

      <div className="mainGrid">
        <div>
          <ul className="d-flex flex-row justify-content-between bg-black">
            <li className="d-flex align-items-center text-white">
              <img
                src={startImg}
                alt="Image 1"
                className="pr-2"
                style={{ width: "50px", height: "50px" }}
              />
              <span className="d-block pl-2" />
              <span style={{ display: "block", paddingRight: "2px" }}>
                Start
              </span>
            </li>
            <li className="d-flex align-items-center text-white">
              <img
                src={endImg}
                alt="Image 2"
                className="pr-2"
                style={{ width: "50px", height: "50px" }}
              />
              <span className="d-block pl-2" />
              <span style={{ display: "block", paddingRight: "2px" }}>End</span>
            </li>
            <li className="d-flex align-items-center text-white">
              <img
                src={wallImg}
                alt="Image 3"
                className="pr-2"
                style={{ width: "50px", height: "50px" }}
              />
              <span className="d-block pl-2" />
              <span style={{ display: "block", paddingRight: "2px" }}>
                Wall
              </span>
            </li>
            <li className="d-flex align-items-center text-white">
              <img
                src={unvisitedImg}
                alt="Image 4"
                className="pr-2"
                style={{ width: "50px", height: "50px" }}
              />
              <span className="d-block pl-2" />
              <span style={{ display: "block", paddingRight: "2px" }}>
                Unvisited
              </span>
            </li>
            <li className="d-flex align-items-center text-white">
              <img
                src={visitedImg}
                alt="Image 5"
                className="pr-2"
                style={{ width: "50px", height: "50px" }}
              />
              <span className="d-block pl-2" />
              <span style={{ display: "block", paddingRight: "2px" }}>
                Visited
              </span>
            </li>
            <li
              className="d-flex align-items-center text-white"
              style={{ paddingRight: "10px" }}
            >
              <img
                src={pathImg}
                alt="Image 6"
                className="pr-2"
                style={{ width: "50px", height: "50px" }}
              />
              <span className="d-block pl-2" />
              <span style={{ display: "block", paddingRight: "2px" }}>
                Path
              </span>
            </li>
          </ul>
        </div>
        <canvas
          className="mx-auto d-block"
          id="rectangle"
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight - 126 - 40}
          style={{
            position: "absolute",
            // top: "50%",
            // left: "50%",
            // transform: "translate(-50%, -50%)",
          }}
          // style={{ display: None }}
        ></canvas>
        <canvas
          ref={canvasCoord}
          width={window.innerWidth}
          className="mx-auto d-block"
          height={window.innerHeight - 126 - 40}
          id="InvRectangle"
          style={{
            position: "absolute",
            // top: "50%",
            // left: "50%",
            // transform: "translate(-50%, -50%)",
          }}
          // onMouseMove={(e) => {
          //   HandleMouseMove(
          //     e,
          //     {
          //       left: canvasCoord.current.getBoundingClientRect().left,
          //       right: canvasCoord.current.getBoundingClientRect().right,
          //       top: canvasCoord.current.getBoundingClientRect().top,
          //     },
          //     canvasCoord.current
          //   );
          // }}
          onMouseDown={(e) => {
            handleMouseDown(
              e,
              {
                left: canvasCoord.current.getBoundingClientRect().left,
                right: canvasCoord.current.getBoundingClientRect().right,
                top: canvasCoord.current.getBoundingClientRect().top,
              },
              canvasCoord.current
            );
          }}
          onMouseMove={(e) => {
            handleMouseEnter(
              e,
              {
                left: canvasCoord.current.getBoundingClientRect().left,
                right: canvasCoord.current.getBoundingClientRect().right,
                top: canvasCoord.current.getBoundingClientRect().top,
              },
              canvasCoord.current
            );
          }}
          onMouseUp={() => handleMouseUp()}
          // onMouseLeave={() => handleMouseUp()}
        ></canvas>
      </div>
      <Footer selectedAlgorithm={selectedAlgorithm} />
    </div>
  );
}
