import Airtable from 'airtable';
import config from './airtable.config.json' assert { type: 'json' };
const base = new Airtable({
    endpointUrl: config.endpointUrl,
    apiKey: config.apiKey,
}).base(config.base);

const KEY = config.keyCol;
const URL = config.urlCol;

let table = base(config.table);

const loadLinksHandler = (resolve, reject) => {
    let map = new Map();
    const processPage = (records, fetchNextPage) => {
        records.forEach((r) => map.set(r.get(KEY).trim(), r.get(URL).trim()));
        fetchNextPage();
    };

    const done = (err) => (err ? reject(err) : resolve(map));

    table.select().eachPage(processPage, done);
};

const loadLinks = async () => new Promise(loadLinksHandler);

const baseUrl = `https://airtable.com/${config.base}`;

export default { loadLinks, baseUrl };
