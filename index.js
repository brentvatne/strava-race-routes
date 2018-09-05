const fetch = require('node-fetch');
const express = require('express');
const path = require('path');
const { accessToken } = require('./config');
const app = express();

function routeIdToUrl(id) {
  return `https://www.strava.com/routes/${id}`;
}

// http GET "https://www.strava.com/api/v3/running_races/{id}" "Authorization: Bearer [[token]]"
async function fetchRoutesAsync(raceId) {
  let response = await fetch(`https://www.strava.com/api/v3/running_races/${raceId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });
  let result = await response.json();
  let routes = result.route_ids;
  if (routes) {
    return routes.map(routeIdToUrl);
  } else {
    throw new Error(`No routes associated with this race. Raw data: ${JSON.stringify(result)}`);
  }
}

app.use(express.static('public'))
app.get('/', (req, res) => res.sendFile(path.join(__dirname + '/index.html')));
app.get('/routes', async (req, res) => {
  try {
    let routeUrls = await fetchRoutesAsync(req.query.raceId);
    res.send(JSON.stringify(routeUrls));
  } catch(e) {
    res.send(e.message)
  }
});
app.get('/routes/:raceId', async (req, res) => {
  try {
    let routeUrls = await fetchRoutesAsync(req.params.raceId);
    res.send(JSON.stringify(routeUrls));
  } catch(e) {
    res.send(e.message)
  }
});

app.listen(3000);