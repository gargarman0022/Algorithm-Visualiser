/* VARIABLES */

let data = []; /* array used for storing the dom-objects/data-points added */
let col = [
  "red",
  "blue",
  "green",
  "yellow",
  "violet",
  "indigo",
  "lightblue",
]; /* list of colors */
let noOfClusters =
  -1; /* no of clusters into which you want to partion the data */
let id = 0; /* variable used for assigning colors to the data points */
const drawingArea = document.querySelector(".drawingArea");
const start = document.querySelector(".start");

/* FUNCTIONS */

/* temporary function in case you need to wait in between the transitions */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* function to shuffle an array - Fisher Yates algorithm */
function shuffle(arr) {
  for (let i = arr.length - 1, j; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/* function to assign initial Cluster Centroids */
function assignClusterCentroids(x, y) {
  for (let i = 0; i < noOfClusters; i++) {
    x[i] = parseInt(data[i].style.left);
    y[i] = parseInt(data[i].style.top);
  }
}

/* function to intialise the given arrays with 0 */
function initialiseArrays(dx, dy, no) {
  for (let i = 0; i < noOfClusters; i++) {
    dx[i] = 0;
    dy[i] = 0;
    no[i] = 0;
  }
}

/* EVENTS */

/* set the noOfClusters value */
document
  .querySelector("#submitBtn")
  .addEventListener("click", function (event) {
    event.preventDefault(); /* prevents the form from submitting */
    noOfClusters = parseInt(document.querySelector("#noOfClusters").value);
    if (noOfClusters > 7 || noOfClusters < 0) noOfClusters = 7;
  });

/* adding a data point */
drawingArea.addEventListener("click", function (e) {
  if (noOfClusters === -1) return;
  let element = document.createElement(`div`); /* Creating a new data point */
  element.setAttribute(
    "class",
    "circle"
  ); /* adding the class of circle to the data point */
  /* assigning coordinates to the data point as well as the background color */
  element.style.top = `${e.y - 5}px`;
  element.style.left = `${e.x - 5}px`;
  element.style.backgroundColor = col[id++];
  /* making sure that the total no of colors used is <= noOfClusters */
  id = id === noOfClusters ? 0 : id;
  /* adding the data point to the document */
  document.body.appendChild(element);
  /* adding the data point to the data array to be used later on in the main algorithm */
  data.push(element);
});

/* The main algorithm */
start.addEventListener("click", async function () {
  let iter = 0; /* no of iterations */
  let x = []; /* x coordinates of the cluster centers */
  let y = []; /* y coordinates of the cluster centers */
  shuffle(data); /* shuffling the array of data - used Fisher Yates algorithm */
  assignClusterCentroids(
    x,
    y
  ); /* assigning the initial Cluster centers/centroids */
  while (iter < 100) {
    let changed = 0 /* no of elements whose cluster changed during the current iteration */,
      dx =
        [] /* summation of x coordinates for finding the new x coordinate of centroids for each cluster */,
      dy =
        [] /* summation of y coordinates for finding the new y coordinate of centroids for each cluster */,
      no = []; /* no of points belonging to a certain cluster */
    initialiseArrays(dx, dy, no); /* initialising the arrays to 0 */
    /* assiging new cluster to each data point */
    data.forEach(function (point) {
      let tx = parseInt(
        point.style.left
      ); /* x coordinate of the current data-point */
      let ty = parseInt(
        point.style.top
      ); /* y coordinate of the current data-point */
      let mn =
        Infinity; /* variable for storing the min distance of this data point to any cluster centroid */
      let id; /* index of the cluster centroid which is closest to the current data-point */
      /* finding the closest cluster centroid to the current data point */
      for (let i = 0; i < noOfClusters; i++) {
        if (mn > (tx - x[i]) * (tx - x[i]) + (ty - y[i]) * (ty - y[i])) {
          mn = (tx - x[i]) * (tx - x[i]) + (ty - y[i]) * (ty - y[i]);
          id = i;
        }
      }
      /* if the closest cluster centroid changes then increment the changed var and update the color */
      if (point.style.backgroundColor !== col[id]) {
        changed++;
        point.style.backgroundColor = col[id];
      }
      /* update dx, dy, and no which are going to help in the calculations of new centroids */
      dx[id] += tx;
      dy[id] += ty;
      no[id]++;
    });
    /* if every data point did not change it's cluster then break */
    if (changed === 0) break;
    /* computing new centroids for every cluster */
    for (let i = 0; i < noOfClusters; i++) {
      x[i] = parseInt(dx[i] / no[i]);
      y[i] = parseInt(dy[i] / no[i]);
    }
    iter++;
    await sleep(2000);
  }
});

/* clears the data-points */
document.querySelector(".clear").addEventListener("click", function (event) {
  data.forEach(function (point) {
    point.remove();
  });
  noOfClusters = -1;
  data = [];
  id = 0;
});
