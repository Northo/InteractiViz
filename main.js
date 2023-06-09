import './style.css'
import Plotly from 'plotly.js-dist'
import Papa from 'papaparse'

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
let data;

const statsDiv = document.getElementById('stats');
Plotly.newPlot(statsDiv, [{
  x: [],
  type: "histogram",
}]);


let graphs = [];

function newGraph(x, y, z) {
  const newDiv = document.createElement('div');
  graphs.push(newDiv);
  graphDivRoot.insertBefore(newDiv, graphDivRoot.firstChild);  // Prepend
  Plotly.newPlot(newDiv, [{
    x: x,
    y: y,
    type: 'scatter',
    mode: 'markers',
    marker: {
      color: z,
    },
    text: z
  }], {
    margin: { t: 0 }
  });

  const exitButton = document.createElement('div');
  exitButton.addEventListener('click', () => {newDiv.remove(); graphs = graphs.filter(graph => graph !== newDiv)});
  exitButton.innerText = "X";
  exitButton.classList = "absolute top-0 right-0 bg-red-500 rounded-full w-6 h-6 text-center text-white font-bold cursor-pointer hover:bg-red-600 hover:scale-110 transition-all"
  newDiv.appendChild(exitButton);

  newDiv.classList.add("rounded", "border-8", "border-slate-600", "relative");
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

  return newDiv;
}

function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  console.log(formData);
  newGraph(
    data[formData.get('x')],
    data[formData.get('y')],
    data[formData.get('z')],
    );
}
const createFormDiv = document.getElementById('createForm');
const form = document.createElement('form');
createFormDiv.appendChild(form);

function renderOptions(data) {
  let options = '';
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      options += `<option value="${key}">${key}</option>`;
    }
  }
  return options;
}

function renderSelect(data, name) {
  return `
  <label for="${name}" class="mb-2 text-sm font-medium text-gray-900 dark:text-white">${name.toUpperCase()}</label>
  <select name="${name}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">${renderOptions(data)}</select>
  `;
}



document.getElementById('csvFile').addEventListener('change', event => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    const results = Papa.parse(event.target.result, {header: true});
    data = results.data.reduce((acc, obj) => {
      Object.keys(obj).forEach(key => {
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(obj[key]);
      });
      return acc;
    }, {});
    console.log(data);
    form.innerHTML = `
      ${["x", "y", "z"].map(x => renderSelect(data, x)).join('')}
      <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">Create</button>
      `;
    form.addEventListener('submit', handleSubmit);
    // 'results' contains an array of objects representing each row in the CSV file
  };

  reader.readAsText(file);
});