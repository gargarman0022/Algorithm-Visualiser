/* VARIABLES */

let data = []; /* array used for storing the dom-objects/data-points added */
let x = [];
let y = [];
let noOfDataPoints = 0;
let st = { x: 0, y: 0 };
let en = { x: 0, y: 0 };
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

/* Starts the algorithm with the chosen node */
function startVisualisation(e) {
  upperLayerLineAttributes(5, `#edc2d8ff`);
  lowerLayerLineAttributes(5, `#edc2d8ff`);
  let order = [];
  let node = parseInt(this.id);
  if (noOfDataPoints <= 15) {
    /* Using the dynamic programming + bitmasking approach if number of nodes <= 15 */
    let dp = [];
    let track = [];
    let distance = [];
    const inf = 10000000000;
    for (let i = 0, l = 1 << noOfDataPoints; i < l; i++) {
      dp[i] = new Array();
      track[i] = new Array();
      for (let j = 0; j < noOfDataPoints; j++) {
        dp[i][j] = inf;
        track[i][j] = [-1, -1];
      }
    }
    for (let i = 0; i < noOfDataPoints; i++) {
      distance[i] = new Array();
      for (let j = 0; j < noOfDataPoints; j++) {
        distance[i][j] =
          (x[i] - x[j]) * (x[i] - x[j]) + (y[i] - y[j]) * (y[i] - y[j]);
      }
    }
    dp[1 << node][node] = 0;
    for (let i = 0, l = 1 << noOfDataPoints; i < l; i++) {
      for (let j = 0; j < noOfDataPoints; j++) {
        if ((i >> j) & 1) {
          for (let k = 0; k < noOfDataPoints; k++) {
            if (k != j && !((i >> k) & 1)) {
              if (dp[i ^ (1 << k)][k] > dp[i][j] + distance[j][k]) {
                dp[i ^ (1 << k)][k] = dp[i][j] + distance[j][k];
                track[i ^ (1 << k)][k] = [i, j];
              }
            }
          }
        }
      }
    }
    let mask = (1 << noOfDataPoints) - 1;
    let tempMin = inf;
    let index = -1;
    for (let i = 0; i < noOfDataPoints; i++) {
      if (tempMin > dp[mask][i]) {
        tempMin = dp[mask][i];
        index = i;
      }
    }
    while (index != -1) {
      order.push(index);
      [mask, index] = [track[mask][index][0], track[mask][index][1]];
    }
    order.reverse();
  } else {
    /* Using the 2-approx algorithm. Constructing MST using Kruskal's algorithm and then doing a random dfs traversal from the selected node  */
    let parent = [];
    let size = [];
    for (let i = 0; i < noOfDataPoints; i++) {
      parent[i] = i;
      size[i] = 1;
    }
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
    let edges = [];
    for (let i = 0; i < noOfDataPoints; i++) {
      for (let j = i + 1; j < noOfDataPoints; j++) {
        edges.push([
          (x[i] - x[j]) * (x[i] - x[j]) + (y[i] - y[j]) * (y[i] - y[j]),
          i,
          j,
        ]);
      }
    }
    edges.sort(function (a, b) {
      return a[0] - b[0];
    });
    let adj = [];
    for (let i = 0; i < noOfDataPoints; i++) {
      adj[i] = new Array();
    }
    for (let i = 0, l = edges.length, u, v; i < l; i++) {
      u = edges[i][1];
      v = edges[i][2];
      if (findSet(u) != findSet(v)) {
        merge(u, v);
        adj[u].push(v);
        adj[v].push(u);
      }
    }
    function dfs(node, parent) {
      order.push(node);
      for (let i = 0, l = adj[node].length, neigh; i < l; i++) {
        neigh = adj[node][i];
        if (neigh != parent) {
          dfs(neigh, node);
        }
      }
    }
    dfs(node, node);
  }
  /* Function for animating the tour */
  async function animate() {
    for (let i = 0; i < noOfDataPoints; i++) {
      if (i == 0) {
        modifyNode(order[i]);
        await sleep(1000);
      } else {
        await animateLine(order[i - 1], order[i]);
        await sleep(500);
        modifyNode(order[i]);
        await sleep(1000);
      }
    }
  }
  animate();
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
  x = [];
  y = [];
  lowerLayerLineAttributes(4, `black`);
  upperLayerLineAttributes(4, `black`);
}

/* EVENTS */

/* adding a data point */
upperLayer.addEventListener("click", function (e) {
  if (noOfDataPoints == maxNodes) return;
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
  element.ondblclick = startVisualisation;
  /* adding the data point to the data array to be used later on in the main algorithm */
  data.push(element);
});

/* adding the event listener */
document.querySelector(".clear").addEventListener("click", clear);
