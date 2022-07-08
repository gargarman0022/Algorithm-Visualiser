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
let noOfClusters =
  -1; /* no of clusters into which you want to partion the data */
let noOfDataPoints = 0; /* no of data-points added */
let id = 0; /* variable used for assigning colors to the data points */
let x = []; /* x coordinate of the data point */
let y = []; /* y coordinate of the data point */
let groupId = []; /* id of the group to which the element belongs */
let array2D; /* function for creating a 2-d matrix filled with infinity*/
let distance; /* 2-d array for storing euclidean distance between all the points */
let similarityCriteria; /* method used to merge clusters into one */
const drawingArea = document.querySelector(".drawingArea");
const start = document.querySelector(".start");

/* FUNCTIONS */

/* function for initialising a 2d array */
array2D = (r, c) => [...Array(r)].map((x) => Array(c).fill(Infinity));

/* function for sleeping before performing the next instruction */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* assigning the distance values in between every pair of points */
function calcDistance() {
  distance = array2D(noOfDataPoints, noOfDataPoints);
  for (let i = 0; i < noOfDataPoints; i++) {
    for (let j = 0; j < noOfDataPoints; j++) {
      distance[i][j] =
        (x[i] - x[j]) * (x[i] - x[j]) + (y[i] - y[j]) * (y[i] - y[j]);
    }
  }
}

/* assigning every point it's seperate cluster id */
function initialiseGroupIds() {
  for (let i = 0; i < noOfDataPoints; i++) {
    groupId[i] = i;
  }
}

/* changing the groups all the data points having the group id = mergeFrom to mergeTo and also updating the color to newColor */
function merge(mergeFrom, mergeTo, newColor) {
  for (let i = 0; i < noOfDataPoints; i++) {
    if (groupId[i] === mergeFrom) {
      groupId[i] = mergeTo;
      data[i].style.backgroundColor = newColor;
    }
  }
}

/* finding the next set of clusters to merge based on intercluster similarity - Minimum Distance */
function mergeGroupIdsMinDist() {
  /* temporary variables for finding the closest pair of clusters according to the current criteria */
  let Min = Infinity;
  let mergeTo, mergeFrom, newColor;
  /* finding the pair of points belonging to different clusters such that the distance between them is minimum possible among all such pairs */
  for (let i = 0; i < noOfDataPoints; i++) {
    for (let j = 0; j < noOfDataPoints; j++) {
      if (groupId[i] !== groupId[j] && Min > distance[i][j]) {
        Min = distance[i][j];
        mergeTo = groupId[i];
        newColor = data[i].style.backgroundColor;
        mergeFrom = groupId[j];
      }
    }
  }
  merge(mergeFrom, mergeTo, newColor);
}

/* finding the next set of clusters to merge based on intercluster similarity - Average Distance */
function mergeGroupIdsAvgDist() {
  /* temporary variables for finding the closest pair of clusters according to the current criteria */
  let Min = Infinity;
  let mergeTo, mergeFrom, newColor;
  let tempDist = array2D(noOfDataPoints, noOfDataPoints);
  let tempNo = array2D(noOfDataPoints, noOfDataPoints);
  /* summation of distance of points from one cluster to another and no of such pairs between every pair of clusters */
  for (let i = 0, idI; i < noOfDataPoints; i++) {
    for (let j = 0, idJ; j < noOfDataPoints; j++) {
      idI = groupId[i];
      idJ = groupId[j];
      if (idI !== idJ) {
        if (tempDist[idI][idJ] === Infinity) {
          tempDist[idI][idJ] = distance[i][j];
          tempNo[idI][idJ] = 1;
        } else {
          tempDist[idI][idJ] += distance[i][j];
          tempNo[idI][idJ]++;
        }
      }
    }
  }
  /* finding the pair of clusters such that the average distance metric between the pair is minimum possible among all such pairs */
  for (let i = 0; i < noOfDataPoints; i++) {
    for (let j = 0; j < noOfDataPoints; j++) {
      if (
        tempNo[i][j] !== Infinity &&
        i !== j &&
        tempDist[i][j] / tempNo[i][j] < Min
      ) {
        Min = tempDist[i][j] / tempNo[i][j];
        mergeTo = i;
        newColor = data[i].style.backgroundColor;
        mergeFrom = j;
      }
    }
  }
  merge(mergeFrom, mergeTo, newColor);
}

/* finding the next set of clusters to merge based on intercluster similarity - Centroid Distance */
function mergeGroupIdsCentroidDist() {
  /* temporary variables for finding the closest pair of clusters according to the current criteria */
  let Min = Infinity;
  let mergeTo, mergeFrom, newColor;
  let tempX =
    []; /* ith index would denote summation of x's of the data points which belong to the ith cluster */
  let tempY =
    []; /* ith index would denote summation of y's of the data points which belong to the ith cluster */
  let tempNo =
    []; /* ith index would denote the no of data points belonging to the ith cluster (would be used in averaging and calculating the centroid) */
  /* initialisation */
  for (let i = 0; i < noOfDataPoints; i++) {
    tempX[i] = 0;
    tempY[i] = 0;
    tempNo[i] = 0;
  }
  for (let i = 0; i < noOfDataPoints; i++) {
    tempX[groupId[i]] += x[i];
    tempY[groupId[i]] += y[i];
    tempNo[groupId[i]]++;
  }
  for (let i = 0; i < noOfDataPoints; i++) {
    if (tempNo[i] !== 0) {
      tempX[i] /= tempNo[i];
      tempY[i] /= tempNo[i];
    }
  }
  /* finding the cluster pair with the minimum centroid distance in between them */
  for (let i = 0; i < noOfDataPoints; i++) {
    for (let j = i + 1; j < noOfDataPoints; j++) {
      if (tempNo[i] !== 0 && tempNo[j] !== 0) {
        if (
          (tempX[i] - tempX[j]) * (tempX[i] - tempX[j]) +
            (tempY[i] - tempY[j]) * (tempY[i] - tempY[j]) <
          Min
        ) {
          Min =
            (tempX[i] - tempX[j]) * (tempX[i] - tempX[j]) +
            (tempY[i] - tempY[j]) * (tempY[i] - tempY[j]);
          mergeTo = i;
          newColor = data[i].style.backgroundColor;
          mergeFrom = j;
        }
      }
    }
  }
  merge(mergeFrom, mergeTo, newColor);
}

/* EVENTS */

/* set the noOfClusters value */
document
  .querySelector("#submitBtn")
  .addEventListener("click", function (event) {
    event.preventDefault(); /* prevents the form from submitting */
    noOfClusters = parseInt(document.querySelector("#noOfClusters").value);
    similarityCriteria = document.querySelector("#similarityCriteria").value;
  });

/* adding a data point */
drawingArea.addEventListener("click", function (e) {
  if (noOfClusters === -1) return;
  noOfDataPoints++;
  let element = document.createElement(`div`); /* Creating a new data point */
  element.setAttribute(
    "class",
    "circle"
  ); /* adding the class of circle to the data point */
  /* assigning coordinates to the data point as well as the background color */
  element.style.top = `${e.y - 5}px`;
  element.style.left = `${e.x - 5}px`;
  x.push(e.x - 5);
  y.push(e.y - 5);
  element.style.backgroundColor = col[id++];
  id = id === 60 ? 0 : id;
  /* adding the data point to the document */
  document.body.appendChild(element);
  /* adding the data point to the data array to be used later on in the main algorithm */
  data.push(element);
});

/* starts the algorithm */
start.addEventListener("click", async function (e) {
  calcDistance();
  initialiseGroupIds();
  if (similarityCriteria === "minDist") {
    for (let i = 0; i < noOfDataPoints - noOfClusters; i++) {
      await sleep(200); /* wait for 200 milliseconds */
      mergeGroupIdsMinDist();
    }
  } else if (similarityCriteria === "avgDist") {
    for (let i = 0; i < noOfDataPoints - noOfClusters; i++) {
      await sleep(200);
      mergeGroupIdsAvgDist();
    }
  } else if (similarityCriteria === "centroidDist") {
    for (let i = 0; i < noOfDataPoints - noOfClusters; i++) {
      await sleep(200);
      mergeGroupIdsCentroidDist();
    }
  }
});

/* clears the data-points */

document.querySelector(".clear").addEventListener("click", function (event) {
  data.forEach(function (point) {
    point.remove();
  });
  x = [];
  y = [];
  data = [];
  groupId = [];
  noOfDataPoints = 0;
  noOfClusters = -1;
  id = 0;
});
