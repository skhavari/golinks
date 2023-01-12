import airtable from './airtable.js';
import morgan from 'morgan';
import tx2 from 'tx2';
import express from 'express';
import distance from 'jaro-winkler';
import { engine } from 'express-handlebars';

const app = express();

app.use(morgan(':method :url :status :res[location] :res[content-length] - :response-time ms'));
app.set('json spaces', 4);
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

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

    scoredMatches(shortCode) {
        let scored = [];
        for (let key of this.golinks.keys()) {
            let score = distance(shortCode, key);
            scored.push({ shortCode: key, score });
        }
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, 4);
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

    if (golinks.has(shortCode)) {
        let redirectUrl = golinks.get(shortCode).replace('%s', replace);
        response.redirect(redirectUrl);
    } else {
        let scoredMatches = State.getInstance().scoredMatches(shortCode);
        response.render('suggest', { layout: false, scoredMatches, shortCode });
        notFound.inc();
    }

    redircts.inc();
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
