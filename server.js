const fs = require('fs');
const json2html = require('json2html');
const express = require('express');
const res = require('express/lib/response');
const app = express();

const loadMap = () => new Map(JSON.parse(fs.readFileSync('./golinks.json')));
let map = loadMap();

app.get('/go/:key', (request, response) =>
    response.redirect(map.get(request.params.key) || 'https://www.pixar.com/404')
);

app.get('/reload', (request, response) => {
    map = loadMap();
    response.redirect('/');
});

app.get('/', (request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(json2html.render(Object.fromEntries(map)));
});

app.listen(6060, () => {
    console.log('Listen on the port 6060...');
});
