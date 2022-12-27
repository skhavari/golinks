# golinks
Simple go links server backed by airtable base.

### Quick Start
For Chrome on Mac OS

1. create a [table in airtable][airtable-sample] with 1 column for key names and 1 column for urls
1. `cp airtable.sample.config.json airtable.config.json` and update
1. `npm install` - install dependencies 
1. `node server` - run server on port 6060
    1. `http://localhost:6060/go/<key>` redirects to the link mapped to the given key
    1. `http://localhost:6060/` shows all keyword to URL mappings (opens your airtable base)
    1. `http://localhost:6060/reload` will tell the server to reload the mapping file.  do this after making changes in airtable.
1. [add a chome search engine][chrome-search-engine-settings].  See [help docs][chrome-search-engine-docs] for more info
    1. Set name to `go`
    1. Set keyword to `go`
    1. Set URL to `http://localhost:6060/go/%s`
1. an alternative to the previous step is to use the browser extension in the `extension` folder
    1. open your browser and go to its extension settings
    1. enable developer mode
    1. load unpacked
    1. select the extension folder
1. open your browser and type `go <space>` then `<key>` and you should redirect to the url that maps to the given key


### Run in background & at startup (Mac OS)
1. `npm install -g pm2`
1. `pm2 start golink.config.js --env prod`
1. `pm2 startup` then follow the directions
1. `pm2 save`
1. read [pm2 docs][pm2-docs] for more info

### Airtable setup
1. create a [table in airtable][airtable-sample] with 1 column for key names and 1 column for urls
1. params for this [table][airtable-sample]
    1. `base = shrZOvefftUFNSZur`
    1. `table = links`
    1. `keyCol = key`
    1. `urlCol = url`


### Modify go links
1. add or update items in your airtable base
1. force a reload of the data by navigating to [http://localhost:6060/reload][reload-url]


### Parameterized Links
1. you can define golinks for search engines
1. eg, suppose you define key=`g` and url=`https://www.google.com/search?q=%s`
1. in your browser, when you type `g purple onions` you will navigate to `https://www.google.com/search?q=purple%20onions`


[airtable-sample]: https://airtable.com/shrZOvefftUFNSZur
[chrome-search-engine-settings]: chrome://settings/searchEngines
[chrome-search-engine-docs]: https://support.google.com/chrome/answer/95426?hl=en&co=GENIE.Platform%3DDesktop
[pm2-docs]: https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/
[reload-url]: http://localhost:6060/reload