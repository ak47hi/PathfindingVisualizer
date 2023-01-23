import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";

function Footer({ selectedAlgorithm }) {
  // console.log(selectedAlgorithm);
  // console.log(selectedAlgorithm == "BFS");
  let text = "Select an algorithm";
  // const [, updateText] = useState("Select an algorithm.");
  if (selectedAlgorithm == "BFS") {
    text =
      "BFS algorithm works by traversing the graph level by level, visiting all the vertices in the current level before moving on to the next level, using a queue data structure to keep track of the vertices to be visited.";
  }
  if (selectedAlgorithm == "Dijstra's") {
    text =
      "Dijkstras algorithm works by initializing a priority queue with the starting vertex, and repeatedly visiting the vertex with the smallest tentative distance (and marking it as visited) and updating the tentative distances of its neighbors.";
  }
  if (selectedAlgorithm == "A*") {
    text =
      "A* algorithm works by combining the strengths of Dijkstra's algorithm and a heuristic function, where it uses the heuristic function to guide the search towards the goal while keeping track of the actual cost from the starting point, using a priority queue to prioritize the vertices to be visited.";
  }

  return (
    <Container
      fluid
      className="bg-black text-white py-0"
      style={{ position: "absolute", bottom: 0, width: "100%" }}
    >
      <Row>
        <Col>
          <p className="text-center">{text}</p>
        </Col>
      </Row>
    </Container>
  );
}

export default Footer;
