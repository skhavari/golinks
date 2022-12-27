const airtable = require('./airtable');
const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(morgan(':method :url :status :res[location] :res[content-length] - :response-time ms'));
app.set('json spaces', 4);

let port = process.env.NODE_ENV === 'production' ? 6060 : 9090;

let golinks = new Map();
let reverse = new Map();

let loadLinks = async () => {
    golinks = await airtable.loadLinks();
    for (let [key, url] of golinks.entries()) {
        let list = reverse.get(url) || [];
        list.push(key);
        reverse.set(url, list);
    }
};

app.get('/go/:key', (request, response) => {
    const builtIns = new Map([
        ['go', '/'],
        ['reload', '/reload'],
    ]);
    let [key, ...replace] = request.params.key.split(' ');
    const redirectUrl = (builtIns.get(key) || golinks.get(key) || 'https://www.pixar.com/404').replace(
        '%s',
        replace.join(' ').trim()
    );
    response.redirect(redirectUrl);
});

app.get('/reload', async (_, response) => {
    await loadLinks();
    response.redirect('/');
});

app.get('/', (_, response) => response.redirect(airtable.baseUrl));

app.get('/list', (_, response) => {
    response.json({ golinks: [...golinks.entries()], reverse: [...reverse.entries()] });
});

const main = async () => {
    await loadLinks();
    app.listen(port, async () => {
        console.log(`golinks server running on port ${port}`);
    });
};

main().catch(console.error);
