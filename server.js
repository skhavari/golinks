const airtable = require('./airtable');
const express = require('express');
const morgan = require('morgan');
const tx2 = require('tx2');
const app = express();

app.use(morgan(':method :url :status :res[location] :res[content-length] - :response-time ms'));
app.set('json spaces', 4);

/********************************************************************************
 *
 * State
 *
 */

class State {
    static #internalConstruction = false;
    static #instance = null;

    golinks = new Map();

    constructor() {
        if (!State.#internalConstruction) {
            throw new TypeError('State is not constructable, use State.getInstance');
        }
    }

    static getInstance() {
        if (State.#instance === null) {
            State.#internalConstruction = true;
            State.#instance = new State();
            State.#internalConstruction = false;
        }
        return State.#instance;
    }

    async reload() {
        this.golinks = await airtable.loadLinks();

        // add builtins...
        this.golinks.set('go', '/');
        this.golinks.set('reload', '/reload');
        this.golinks.set('list', '/list');
    }

    asEntries() {
        return [...this.golinks.entries()];
    }
}

/********************************************************************************
 *
 * Request Handlers
 *
 */

app.get('/go/:shortCode', (request, response) => {
    let golinks = State.getInstance().golinks;

    let [shortCode, ...replace] = decodeURIComponent(request.params.shortCode.replace(/\+/g, '%20')).split(' ');
    replace = replace.map(encodeURIComponent).join('+').trim();

    let redirectUrl = 'https://www.pixar.com/404';
    if (golinks.has(shortCode)) {
        redirectUrl = golinks.get(shortCode).replace('%s', replace);
    }

    response.redirect(redirectUrl);
    redircts.inc();
    if (!golinks.has(shortCode)) {
        notFound.inc();
    }
});

app.get('/reload', async (_, response) => {
    await State.getInstance().reload();
    response.redirect('/list');
});

app.get('/', (_, response, xx) => response.redirect(airtable.baseUrl));
app.get('/list', (_, response) => response.json(State.getInstance().asEntries()));

/********************************************************************************
 *
 * PM2 Metrics and Actions
 *
 */

let redircts = tx2.counter('GoLinks Redirects');
let notFound = tx2.counter('GoLinks NotFounds');

tx2.action('reload', async (reply) => {
    await State.getInstance().reload();
    reply(State.getInstance().asEntries());
});

tx2.action('list', (reply) => reply(State.getInstance().asEntries()));

/********************************************************************************
 *
 * Main
 *
 */

const PORT = process.env.NODE_ENV === 'production' ? 6060 : 9090;

const main = async () => {
    await State.getInstance().reload();
    app.listen(PORT, async () => console.log(`listening on port ${PORT}`));
};

main().catch(console.error);
