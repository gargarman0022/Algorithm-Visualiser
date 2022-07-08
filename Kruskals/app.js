/* VARIABLES */

let data = []; /* array used for storing the dom-objects/data-points added */
let x = [];
let y = [];
let adj = [];
let weightDivs = [];
let edges = [];
let addWeightBool = false;
let noOfDataPoints = 0;
let pressed = false;
let st = { x: 0, y: 0 };
let en = { x: 0, y: 0 };
let startNode = 0;
let endNode = 0;
let edgeWeight;
const maxNodes = 50;
const upperLayer = document.querySelector(".upperLayer");
const lowerLayer = document.querySelector(".lowerLayer");
const upperLayerContext = upperLayer.getContext("2d");
const lowerLayerContext = lowerLayer.getContext("2d");
let rect = upperLayer.getBoundingClientRect();

for (let i = 0; i < maxNodes; i++) {
  adj[i] = new Array();
}

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

/* Coordinates for the Edge weight on an edge */
function textCoordinates(st, en) {
  const p = 5;
  if (st.y < en.y) [st, en] = [en, st];
  let d = (st.x - en.x) * (st.x - en.x) + (st.y - en.y) * (st.y - en.y);
  d = Math.sqrt(d);
  if (st.x < en.x) {
    return [
      (st.x + en.x) / 2 - (p * (st.y - en.y)) / d,
      (st.y + en.y) / 2 - (p * (en.x - st.x)) / d,
    ];
  } else {
    return [
      (st.x + en.x) / 2 + (p * (st.y - en.y)) / d,
      (st.y + en.y) / 2 - (p * (st.x - en.x)) / d,
    ];
  }
}

/* adds nodes to each other's adjacency list and draws permanent line between them on the lower layer*/
function addEdge(i, j) {
  if (i === j) return;
  st = realCoordinates(i);
  en = realCoordinates(j);
  drawLineLowerLayer(st, en);
}

function addWeight(i, j) {
  if (i === j) return;
  if (!addWeightBool) return;
  addWeightBool = false;
  adj[i].push([j, edgeWeight]);
  adj[j].push([i, edgeWeight]);
  st = { x: x[i], y: y[i] };
  en = { x: x[j], y: y[j] };
  let p = textCoordinates(st, en);
  let element = document.createElement(`div`); /* Creating a new data point */
  element.innerText = edgeWeight;
  let angle = Math.atan(Math.abs(en.y - st.y) / Math.abs(en.x - st.x));
  element.setAttribute(`class`, `weight`);
  element.style.top = `${p[1]}px`;
  element.style.left = `${p[0]}px`;
  if (p[0] < (st.x + en.x) / 2) {
    angle = -angle;
    element.style.transformOrigin = `top left`;
  }
  element.style.transform = `rotate(${angle}rad)`;
  document.body.appendChild(element);
  weightDivs.push(element);
  edges.push([edgeWeight, i, j, element]);
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
  return;
}
/* Function for stopping for some set duration in an async function */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* Starts the algorithm */
function startVisualisation(e) {
  if (addWeightBool) return;
  upperLayerLineAttributes(5, `#edc2d8ff`);
  lowerLayerLineAttributes(5, `#edc2d8ff`);
  let parent = [];
  let size = [];
  for (let i = 0; i < noOfDataPoints; i++) {
    parent[i] = i;
    size[i] = 1;
  }
  /* Disjoint Set Union */
  function findSet(u) {
    return (parent[u] = u == parent[u] ? u : findSet(parent[u]));
  }
  function merge(u, v) {
    u = findSet(u);
    v = findSet(v);
    if (u !== v) {
      if (size[u] > size[v]) [u, v] = [v, u];
      parent[u] = v;
      size[v] += size[u];
    }
  }
  edges.sort(function (a, b) {
    return a[0] - b[0];
  });
  let visited = [];
  async function animate() {
    for (let i = 0, l = edges.length, u, v; i < l; i++) {
      u = edges[i][1];
      v = edges[i][2];
      if (!visited[u]) {
        modifyNode(u);
        await sleep(1000);
      }
      if (!visited[v]) {
        modifyNode(v);
        await sleep(1000);
      }
      /* Highlighting the selecting nodes */
      data[u].style.border = `4px solid #B0C4DE`;
      data[v].style.border = `4px solid #B0C4DE`;
      await animateLine(u, v);
      await sleep(500);
      if (findSet(u) == findSet(v)) {
        /* removing the weight and the edge */
        edges[i][3].remove();
        let st = realCoordinates(u);
        let en = realCoordinates(v);
        lowerLayerLineAttributes(
          6,
          `white`
        ); /* Choosing size of white line 6 so that the underlying line may be completely erased otherwise some outer portion of it may still be visible */
        drawLineLowerLayer(st, en);
        lowerLayerLineAttributes(5, `#edc2d8ff`);
        await sleep(1000);
      } else {
        merge(u, v);
      }
      /* Making the highlighted nodes normal */
      data[u].style.border = `2px solid #edc2d8ff`;
      data[v].style.border = `2px solid #edc2d8ff`;
    }
  }
  animate();
}

/* Setting up the mouse down event on a node */
function OnMouseDown(e) {
  if (addWeightBool) return;
  pressed = true;
  startNode = parseInt(this.id);
  st = realCoordinates(startNode);
}
/* Setting up the mouse up event on a node */
function OnMouseUp(e) {
  if (addWeightBool) return;
  endNode = parseInt(this.id);
  if (startNode == endNode) {
    pressed = false;
    return;
  }
  pressed = false;
  addWeightBool = true;
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
  weightDivs.forEach(function (weightDiv) {
    weightDiv.remove();
  });
  upperLayerContext.clearRect(0, 0, upperLayer.width, upperLayer.height);
  lowerLayerContext.clearRect(0, 0, lowerLayer.width, lowerLayer.height);
  noOfDataPoints = 0;
  data = [];
  weightDivs = [];
  edges = [];
  x = [];
  y = [];
  adj = [];
  for (let i = 0; i < maxNodes; i++) {
    adj[i] = new Array();
  }
  lowerLayerLineAttributes(4, `black`);
  upperLayerLineAttributes(4, `black`);
  pressed = false;
  addWeightBool = false;
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

document
  .querySelector("#submitBtn")
  .addEventListener("click", function (event) {
    event.preventDefault(); /* prevents the form from submitting */
    edgeWeight = parseInt(document.querySelector("#edgeWeight").value);
    /* Ensuring that edge weigth is between 0 and 50 */
    if (edgeWeight < 0 || edgeWeight > 50) edgeWeight = 0;
    addWeight(startNode, endNode);
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
