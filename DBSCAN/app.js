/* VARIABLES */

let data = []; /* array used for storing the dom-objects/data-points added */
let col = [
  "#263238",
  "#DD2C00",
  "#FFD600",
  "#00C853",
  "#0091EA",
  "#6200EA",
  "#D50000",
  "#3E2723",
  "#FFAB00",
  "#64DD17",
  "#00B8D4",
  "#304FFE",
  "#C51162",
  "#212121",
  "#FF6D00",
  "#AEEA00",
  "#00BFA5",
  "#2962FF",
  "#AA00FF",
  "#37474F",
  "#FF3D00",
  "#FFEA00",
  "#00E676",
  "#00B0FF",
  "#651FFF",
  "#FF1744",
  "#4E342E",
  "#FFC400",
  "#76FF03",
  "#00E5FF",
  "#3D5AFE",
  "#F50057",
  "#424242",
  "#FF9100",
  "#C6FF00",
  "#1DE9B6",
  "#2979FF",
  "#D500F9",
  "#455A64",
  "#BF360C",
  "#F57F17",
  "#1B5E20",
  "#01579B",
  "#311B92",
  "#B71C1C",
  "#FF6F00",
  "#33691E",
  "#006064",
  "#1A237E",
  "#880E4F",
  "#E65100",
  "#827717",
  "#004D40",
  "#0D47A1",
  "#4A148C",
  "#D84315",
  "#F9A825",
  "#2E7D32",
  "#0277BD",
  "#4527A0",
  "#C62828",
]; /* list of colors */
let epsilon = -1;
let minPoints = -1;
let noOfDataPoints = 0;
let parent = [];
let size = [];
let x = [];
let y = [];
const drawingArea = document.querySelector(".drawingArea");
const start = document.querySelector(".start");

/* FUNCTIONS */

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

/* EVENTS */
/* setting the epsilon value and the minPoints value */
document
  .querySelector("#submitBtn")
  .addEventListener("click", function (event) {
    event.preventDefault(); /* prevents the form from submitting */
    epsilon = parseInt(document.querySelector("#epsilon").value);
    minPoints = parseInt(document.querySelector("#minPoints").value);
    console.log(epsilon, " ", minPoints);
  });

/* adding a data point */
drawingArea.addEventListener("click", function (e) {
  if (epsilon === -1) return;
  parent.push(noOfDataPoints);
  size.push(1);
  noOfDataPoints++;
  let element = document.createElement(`div`); /* Creating a new data point */
  element.setAttribute(
    "class",
    "circle"
  ); /* adding the class of circle to the data point */
  /* assigning coordinates to the data point as well as the background color */
  element.style.top = `${e.y - 5}px`;
  element.style.left = `${e.x - 5}px`;
  element.style.backgroundColor = `black`;
  x.push(e.x - 5);
  y.push(e.y - 5);
  /* adding the data point to the document */
  document.body.appendChild(element);
  /* adding the data point to the data array to be used later on in the main algorithm */
  data.push(element);
});

/* The main algorithm */
start.addEventListener("click", function () {
  let noOfNeighbours = [];
  let isCore = [];
  let isBorder = [];
  let isNoise = [];
  let color = [];
  for (let i = 0; i < noOfDataPoints; i++) {
    noOfNeighbours[i] = 0;
    isCore[i] = false;
    isBorder[i] = false;
    isNoise[i] = true;
    color[i] = -1;
  }
  for (let i = 0; i < noOfDataPoints; i++) {
    for (let j = i + 1; j < noOfDataPoints; j++) {
      if (
        (x[i] - x[j]) * (x[i] - x[j]) + (y[i] - y[j]) * (y[i] - y[j]) <=
        epsilon * epsilon
      ) {
        noOfNeighbours[i]++;
        noOfNeighbours[j]++;
      }
    }
  }
  for (let i = 0; i < noOfDataPoints; i++) {
    if (noOfNeighbours[i] >= minPoints) {
      isCore[i] = true;
      isNoise[i] = false;
    }
  }
  for (let i = 0; i < noOfDataPoints; i++) {
    for (let j = i + 1; j < noOfDataPoints; j++) {
      if (
        (x[i] - x[j]) * (x[i] - x[j]) + (y[i] - y[j]) * (y[i] - y[j]) <=
          epsilon * epsilon &&
        isCore[i] === true &&
        isCore[j] === true
      ) {
        merge(i, j);
      }
    }
  }
  for (let i = 0; i < noOfDataPoints; i++) {
    if (isCore[i] === false) {
      for (let j = 0; j < noOfDataPoints; j++) {
        if (
          i !== j &&
          isCore[j] === true &&
          (x[i] - x[j]) * (x[i] - x[j]) + (y[i] - y[j]) * (y[i] - y[j]) <=
            epsilon * epsilon
        ) {
          isBorder[i] = true;
          isNoise[i] = false;
          merge(i, j);
        }
      }
    }
  }

  for (let i = 0, id = 0; i < noOfDataPoints; i++) {
    if (isNoise[i] === false) {
      if (color[findSet(i)] === -1) {
        color[findSet(i)] = col[id];
        id++;
        id = id === 60 ? 0 : id;
      }
      data[i].style.backgroundColor = color[findSet(i)];
    } else {
      data[i].style.backgroundColor = `#808080`;
    }
  }
});

/* clears the data-points */
document.querySelector(".clear").addEventListener("click", function (event) {
  data.forEach(function (point) {
    point.remove();
  });
  epsilon = -1;
  minPoints = -1;
  noOfDataPoints = 0;
  data = [];
  parent = [];
  size = [];
  x = [];
  y = [];
});
