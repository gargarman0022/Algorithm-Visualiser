/* VARIABLES */

let data = []; /* array used for storing the dom-objects/data-points added */
let x = [];
let y = [];
let edges = [];
let noOfDataPoints = 0;
let pressed = false;
let st = { x: 0, y: 0 };
let en = { x: 0, y: 0 };
let startNode = 0;
let endNode = 0;
const maxNodes = 50;
const upperLayer = document.querySelector(".upperLayer");
const lowerLayer = document.querySelector(".lowerLayer");
const upperLayerContext = upperLayer.getContext("2d");
const lowerLayerContext = lowerLayer.getContext("2d");
let rect = upperLayer.getBoundingClientRect();

/* FUNCTIONS */

/* Function for setting the height and width of the canvas.
Setting height and width using CSS causes the images to blur out somehow. Therefore had to use this way for setting up using height and width attributes of the canvas tag */
function setUpCanvas() {
  /* clearing up the screen */
  clear();
  /* Set display size (vw/vh). */
  var sizeWidth = (80 * window.innerWidth) / 100,
    sizeHeight = window.innerHeight;
  //Setting the canvas site and width to be responsive
  upperLayer.width = sizeWidth;
  upperLayer.height = sizeHeight;
  upperLayer.style.width = sizeWidth;
  upperLayer.style.height = sizeHeight;
  lowerLayer.width = sizeWidth;
  lowerLayer.height = sizeHeight;
  lowerLayer.style.width = sizeWidth;
  lowerLayer.style.height = sizeHeight;
  rect = upperLayer.getBoundingClientRect();
}

/* Call by reference like setUpCanvas not setUpCanvas(), setUpCanvas() was not working */
window.onload = setUpCanvas;
window.onresize = setUpCanvas;

/* Setting width and color of line on upper layer */
function upperLayerLineAttributes(width, color) {
  upperLayerContext.lineWidth = width;
  upperLayerContext.strokeStyle = color;
}

/* Setting width and color of line on lower layer */
function lowerLayerLineAttributes(width, color) {
  lowerLayerContext.lineWidth = width;
  lowerLayerContext.strokeStyle = color;
}

/* Clearing upper layer */
function clearCanvas() {
  upperLayerContext.clearRect(0, 0, upperLayer.width, upperLayer.height);
}
/* Drawing line on the upper layer */
function drawLineUpperLayer(st, en) {
  upperLayerContext.beginPath();
  upperLayerContext.moveTo(st.x, st.y);
  upperLayerContext.lineTo(en.x, en.y);
  upperLayerContext.stroke();
}

/* Drawing line on the lower layer */
function drawLineLowerLayer(st, en) {
  lowerLayerContext.beginPath();
  lowerLayerContext.moveTo(st.x, st.y);
  lowerLayerContext.lineTo(en.x, en.y);
  lowerLayerContext.stroke();
}
/* Finding coordinates of a node for drawing */
function realCoordinates(nodeIndex) {
  return { x: x[nodeIndex] + 20 - rect.left, y: y[nodeIndex] + 20 - rect.top };
}
/* adds nodes to the edge list and draws permanent line between them on the lower layer*/
function addEdge(i, j) {
  if (i === j) return;
  edges.push([i, j]);
  st = realCoordinates(i);
  en = realCoordinates(j);
  drawLineLowerLayer(st, en);
}

/* Changes color and border of the node */
function modifyNode(node) {
  data[node].style.backgroundColor = `#fcf6f5ff`;
  data[node].style.border = `2px solid #edc2d8ff`;
}

/* Used for drawing the final line after the animation */
function modifyEdge(i, j) {
  if (i === j) return;
  st = realCoordinates(i);
  en = realCoordinates(j);
  drawLineLowerLayer(st, en);
}

/* Function for animating the line  */
async function animateLine(i, j) {
  if (i === j) return;
  let st = realCoordinates(i);
  let en = realCoordinates(j);
  let dx = (en.x - st.x) / 200;
  let dy = (en.y - st.y) / 200;
  for (let i = 1; i < 200; i++) {
    await sleep(1);
    en = { x: st.x + dx * i, y: st.y + dy * i };
    drawLineUpperLayer(st, en);
  }
  clearCanvas();
  modifyEdge(i, j);
}
/* Function for stopping for some set duration in an async function */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* Starts the algorithm */
async function startVisualisation(e) {
  upperLayerLineAttributes(5, `#edc2d8ff`);
  lowerLayerLineAttributes(5, `#edc2d8ff`);
  let used = [];
  for (let i = 0, l = edges.length, u, v; i < l; i++) {
    if (!used[i]) {
      used[i] = true;
      u = edges[i][0];
      v = edges[i][1];
      modifyNode(u);
      await sleep(1000);
      modifyNode(v);
      await sleep(1000);
      await animateLine(u, v);
      await sleep(1000);
      for (let j = i + 1; j < l; j++) {
        if (
          edges[j][0] === u ||
          edges[j][1] === u ||
          edges[j][0] === v ||
          edges[j][1] === v
        ) {
          used[j] = true;
        }
      }
    }
  }
}

/* Setting up the mouse down event on a node */
function OnMouseDown(e) {
  pressed = true;
  startNode = parseInt(this.id);
  st = realCoordinates(startNode);
}
/* Setting up the mouse up event on a node */
function OnMouseUp(e) {
  pressed = false;
  endNode = parseInt(this.id);
  addEdge(startNode, endNode);
  clearCanvas();
}

/* Setting up mouse move event on Upperlayer, e.x - rect.left and e.y-rect.top are the real coordinates of the point */
function OnMouseMove(e) {
  if (!pressed) return;
  en = { x: e.x - rect.left, y: e.y - rect.top };
  clearCanvas();
  drawLineUpperLayer(st, en);
}

/* function for clearing up the data points */
function clear(event) {
  data.forEach(function (point) {
    point.remove();
  });
  upperLayerContext.clearRect(0, 0, upperLayer.width, upperLayer.height);
  lowerLayerContext.clearRect(0, 0, lowerLayer.width, lowerLayer.height);
  noOfDataPoints = 0;
  data = [];
  edges = [];
  x = [];
  y = [];
  lowerLayerLineAttributes(4, `black`);
  upperLayerLineAttributes(4, `black`);
  pressed = false;
}

/* EVENTS */

/* adding a data point */
upperLayer.addEventListener("click", function (e) {
  if (noOfDataPoints == maxNodes) return;
  /* Hacky fix for setting the width of the line in start */
  lowerLayerLineAttributes(4, `black`);
  upperLayerLineAttributes(4, `black`);
  noOfDataPoints++;
  let element = document.createElement(`div`); /* Creating a new data point */
  element.setAttribute(
    "class",
    "circle"
  ); /* adding the class of circle to the data point */
  element.setAttribute("id", noOfDataPoints - 1); /* setting id of the node */
  /* assigning coordinates to the data point as well as the background color */
  element.style.top = `${e.y - 20}px`;
  element.style.left = `${e.x - 20}px`;
  element.style.backgroundColor = `#6c757d`;
  x.push(e.x - 20);
  y.push(e.y - 20);
  /* adding the data point to the document */
  document.body.appendChild(element);
  /* adding the event handlers to the nodes */
  element.onmousedown = OnMouseDown;
  element.onmouseup = OnMouseUp;
  element.onmousemove = OnMouseMove;
  /* adding the data point to the data array to be used later on in the main algorithm */
  data.push(element);
});

/* adding the event listener */
document.querySelector(".clear").addEventListener("click", clear);

/* adding the event listener */
document.querySelector(".start").addEventListener("click", startVisualisation);
/* adding the event listener */
upperLayer.addEventListener("mouseup", function (e) {
  pressed = false;
  clearCanvas();
});

/* adding the event listener */
upperLayer.addEventListener("mousemove", OnMouseMove);
