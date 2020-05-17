# cron-webhook-express
Cron Webhook module wrapped by express

# How to use

Install
```sh
npm i --save cron-webhook-express
```
Set
```js
let cronWebhookExpress = require('cron-webhook-express')

cronWebhookExpress.start(3000, function() {})
```


## API
Submit new cron webhook
```
POST : localhost:3000/:name
body: {
    "querySettings": {
        "query": url,
        "webhook": webhook
    },
    "objectParser": "application/json"
}
```
Retrieve all active cron webhook information
```
GET : localhost:3000
```
Retrieve cron webhook information and last state
```
GET : localhost:3000/:name
```
Pause a cron webhook
```
ANY : localhost:3000/:name/pause
```
Resume a paused cron webhook
```
ANY : localhost:3000/:name/start
```
Stop once and for all a cron webhook
```
DELETE : localhost:3000/:name
or
ANY : localhost:3000/:name/stop
```