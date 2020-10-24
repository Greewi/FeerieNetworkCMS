# FeerieNetworkCMS
The source for the Feerie.net site


## Data architecture
Per site data has to be stored in the `data` folder. This folder contains :
* `data/` the data root directory
* `    sitemap.json` the json file that contains the site architecture information
* `    the markdown articles and ressources (like images) goes here. Article URL are relative to this path.
* `cache/` the cached html file for the articles (Article URL are relative to this path.)
* `template` the templates data

