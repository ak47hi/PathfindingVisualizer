//---------------------------dijstras-------------------------
//------------------------------------------------------------
// Performs Dijkstra's algorithm; returns *all* nodes in the order
// in which they were visited. Also makes nodes point back to their
// previous node, effectively allowing us to compute the shortest path
// by backtracking from the finish node.
// import { useState } from "react";

const hexProps = {
  hexSize: 20,
  hexOrigin: { x: 300, y: 300 },
};

const canvasState = {
  canvasSize: {
    canvasWidth: window.innerWidth,
    canvasHeight: window.innerHeight - 126 - 40,
  },
  hexParams: GetHexParameters(),
};

function GetHexParameters() {
  let hexHeight = hexProps.hexSize * 2;
  let hexWidth = (Math.sqrt(3) / 2) * hexHeight;
  let vertDist = (hexHeight * 3) / 4;
  let horizDist = hexWidth;
  return { hexHeight, hexWidth, vertDist, horizDist };
}
// import canvasState from "../PathFindingInHexGrid/PathFindingHexGrid";
export function Astar(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  startNode.distance = 0;
  // console.log(getHeuristicDistance(startNode, finishNode));
  startNode.heuristicDistance = getHeuristicDistance(startNode, finishNode);
  startNode.totalDistance = 0 + startNode.heuristicDistance;
  const unvisitedNodes = getAllNodes(grid);
  while (!!unvisitedNodes.length) {
    sortNodesByDistance(unvisitedNodes);
    const closestNode = unvisitedNodes.shift();
    if (closestNode.isWall) {
      continue;
    }
    if (closestNode.distance === Infinity) return visitedNodesInOrder;
    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);
    if (closestNode === finishNode) return visitedNodesInOrder;
    updateUnvisitedNeighbors(closestNode, grid, finishNode);
  }
}

function sortNodesByDistance(unvisitedNodes) {
  unvisitedNodes.sort((nodeA, nodeB) => {
    if (nodeA.totalDistance === nodeB.totalDistance) {
      return 0;
    }
    return nodeA.totalDistance < nodeB.totalDistance ? -1 : 1;
  });
}

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

function getHeuristicDistance(node, finishNode) {
  const qDistance = Math.abs(node.q - finishNode.q);
  const rDistance = Math.abs(node.r - finishNode.r);
  const sDistance = Math.abs(-node.q - node.r - (-finishNode.q - finishNode.r));
  return Math.max(qDistance, rDistance, sDistance);
}

function updateUnvisitedNeighbors(node, grid, finishNode) {
  const unvisitedNeighbors = getHexUnvisitedNeighbors(node, grid);
  // console.log(unvisitedNeighbors);
  for (const neighbor of unvisitedNeighbors) {
    let avgDistance = getHeuristicDistance(neighbor, finishNode);
    if (
      !neighbor.isVisited &&
      node.distance + 1 + avgDistance < neighbor.distance
    ) {
      neighbor.distance = node.distance + 1;
      neighbor.heuristicDistance = avgDistance;
      neighbor.totalDistance = node.distance + 1 + avgDistance;
      neighbor.previousNode = node;
    }
  }
}

function getHexUnvisitedNeighbors(h, grid) {
  const neighbors = [];
  for (let k = 0; k <= 5; k++) {
    const { canvasWidth, canvasHeight } = canvasState.canvasSize;
    const { hexHeight, hexWidth, vertDist, horizDist } = canvasState.hexParams;
    const { q, r, s } = GetCubeNeighbor(Hex(h.q, h.r, h.s), k);
    const { x, y } = HexToPixel(Hex(q, r));
    if (
      x > hexWidth / 2 &&
      x < canvasWidth - hexWidth / 2 &&
      y > hexHeight / 2 &&
      y < canvasHeight - hexHeight / 2
    ) {
      const { i, j } = findNodeIndexInGrid(r, q, grid);
      neighbors.push(grid[i][j]);
    }
  }

  return neighbors.filter((neighbor) => !neighbor.isVisited);
}

//------------------------------------------------------------------------------------//
// HELPER FUNCTION TO GET THE ARIAL COORDINATES Q, R, AND S
function findNodeIndexInGrid(r, q, grid) {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j].q == q && grid[i][j].r == r) {
        return { i: i, j: j };
      }
    }
  }
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

function HexToPixel(hex) {
  let hexOrigin = hexProps.hexOrigin;
  let x =
    hexProps.hexSize * (Math.sqrt(3) * hex.q + (Math.sqrt(3) / 2) * hex.r) +
    hexOrigin.x;
  let y = hexProps.hexSize * ((3 / 2) * hex.r) + hexOrigin.y;
  return Point(x, y);
}

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

//------------------------------------------------------------------------------------//

function getAllNodes(grid) {
  const nodes = [];
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      nodes.push(grid[i][j]);
      // console.log(grid[i][j]);
    }
  }
  return nodes;
}

// Backtracks from the finishNode to find the shortest path.
// Only works when called *after* the dijkstra method above.
export function getNodesInShortestPathOrderAstar(finishNode) {
  const nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}
