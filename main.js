import './style.css'
import Plotly from 'plotly.js-dist'

const graphDivRoot = document.querySelector('#graph1');

function generateRandomObjects(count) {
  let data = {
    id: [],
    age: [],
    risk: [],
    year: [],
  };
  let ids_birth_years = {};
  
  for (var i = 0; i < count; i++) {
    const id = getRandomInt(1, 100); // Generate a random integer between 1 and 100 for id
    const age = getRandomFloat(18, 65); // Generate a random float between 18 and 65 for age
    const risk = getRandomInt(1, 4); // Generate a random integer between 1 and 10 for risk
    let birth_year;
    if (id in ids_birth_years) {
      birth_year = ids_birth_years[id];
    } else {
      birth_year = getRandomInt(1950, 2000);
      ids_birth_years[id] = birth_year;
    }
    const year = birth_year + age;

    data.id.push(id);
    data.age.push(age);
    data.risk.push(risk);
    data.year.push(year);
  }
  
  return data;
}

// Helper function to generate a random integer between min (inclusive) and max (inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to generate a random float between min (inclusive) and max (inclusive)
function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

const N = 500;
const data = generateRandomObjects(N);

const statsDiv = document.getElementById('stats');
Plotly.newPlot(statsDiv, [{
  x: [],
  type: "histogram",
}]);


let graphs = [];

function mapIntToColor(number) {
  switch (number) {
    case 1:
      return "red";
    case 2:
      return "blue";
    case 3:
      return "green";
    case 4:
      return "yellow";
    default:
      return "unknown";
  }
}

function newGraph(x, y, z) {
  const newDiv = document.createElement('div');
  graphDivRoot.insertBefore(newDiv, graphDivRoot.firstChild);  // Prepend
  Plotly.newPlot(newDiv, [{
    x: x,
    y: y,
    type: 'scatter',
    mode: 'markers',
    marker: {
      symbol: x.map(x => x > 40 ? 'circle' : 'square'),
      color: z.map(x => mapIntToColor(x)),
    }
  }], {
    margin: { t: 0 }
  });
  const selectionSpan = document.getElementById("num_selected");
  function handleSelection(eventData) {
    var points = eventData.points.map(point => point.pointIndex);
    Plotly.restyle(statsDiv, {x: [points.map(i => x[i])]});
    selectionSpan.innerText = points.length;
    for (let graph of graphs) {
      if (graph !== newDiv) {
        Plotly.restyle(graph, {selectedpoints: [points]});
      }
    }
  }
  newDiv.on('plotly_selecting', handleSelection);
  newDiv.on('plotly_selected', handleSelection);

  newDiv.classList.add("rounded", "border-4", "border-slate-600");
  return newDiv;
}

graphs.push(newGraph(data.age, data.year, data.risk));
graphs.push(newGraph(data.age, data.id, data.risk));