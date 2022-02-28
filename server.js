const airtable = require('./airtable');
const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(morgan(':method :url :status :res[location] :res[content-length] - :response-time ms'));

let golinks = new Map();

app.get('/go/:key', (request, response) => {
    const builtIns = new Map([
        ['go', '/'],
        ['reload', '/reload'],
    ]);
    let [key, ...replace] = request.params.key.split(' ');
    const redirectUrl = (
        builtIns.get(key) ||
        golinks.get(key) ||
        'https://www.pixar.com/404'
    ).replace('%s', replace.join(' ').trim());
    response.redirect(redirectUrl);
});

app.get('/reload', async (_, response) => {
    golinks = await airtable.loadLinks();
    response.redirect('/');
});

app.get('/', (_, response) => response.redirect(airtable.baseUrl));

const main = async () => {
    golinks = await airtable.loadLinks();
    app.listen(6060, async () => {
        console.log('Listen on the port 6060...');
    });
};

main().catch(console.error);
