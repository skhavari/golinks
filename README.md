# golinks
simple go links server


### Quick Start
For Chrome on Mac OS

1. `cp golinks.sample.json golinks.json` or make your own
1. `npm install` - install dependencies 
1. `node server` - run server on port 6060
1. [add a chome search engine][chrome-search-engine-settings].  See [help docs][chrome-search-engine-docs] for more info
    1. Set name to `go`
    1. Set keyword to `go`
    1. Set URL to `http://localhost:6060/go/%s`
1. open your browser and type `go <space>` then `g` and you should redirect to google.com


### Run in background & at startup (Mac OS)
1. `npm install -g pm2`
1. `pm2 start server`
1. `pm2 startup` then follow the directions
1. `pm2 save`
1. read [pm2 docs][pm2-docs] for more info


### Modify go links
1. modify `golinks.json`
1. force a reload of the configuration file by navigating to [https://localhost:6060/reload][reload-url]


[chrome-search-engine-settings]: chrome://settings/searchEngines
[chrome-search-engine-docs]: https://support.google.com/chrome/answer/95426?hl=en&co=GENIE.Platform%3DDesktop
[pm2-docs]: https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/
[reload-url]: https://localhost:6060/reload