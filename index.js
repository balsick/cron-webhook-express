const {CronWebHook, TYPE_JSON, TYPE_PLAIN_TEXT, TYPE_XML} = require('cron-webhook')
const express = require('express')
const fs = require('fs')

const CWEF = '.cron-webhook-express'

function checkValidCronWebhookBody(body){
    if (body.objectParser && ![TYPE_JSON, TYPE_PLAIN_TEXT, TYPE_XML].includes(body.objectParser))
        return false
    return true
}

var app = express();
app.use(express.json())

var cronJobs = {};
app.get('/', function(req, res) {
    let result = {}
    for (let [key, value] of Object.entries(cronJobs)) {
        result[key] = value.toProperties()
    }
    res.send(result)
})

app.get('/:name', function(req, res) {
    console.log(req)
    var name = req.params.name
    let cwh = cronJobs[name]
    if (!cwh) {
        res.status(403).end()
        return
    }
    console.log(cwh.toProperties())
    res.send(cwh.toProperties())
})

function create(name, body) {
    cronJobs[name] = new CronWebHook({
        querySettings: body.querySettings,
        objectParser: body.objectParser,
        stateFilePath: `${CWEF}/temp/${name}.json`,
        onStart: body.onStart,
        cronPattern: body.cronPattern
    }).start()
    return cronJobs[name]
}

app.post('/:name', function(req, res) {
    console.log(req)
    var body = req.body
    console.log(body)
    var name = req.params.name
    console.log(name)
    if (cronJobs.hasOwnProperty(name)) {
        res.status(403).end()
        return
    }
    if (!checkValidCronWebhookBody(body))
        {
        res.status(401).end()
        return
        }
    let cwh = create(name, body)
    fs.writeFile(`${CWEF}/conf/${name}.json`, JSON.stringify(cwh.toProperties()), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
      })
    res.status(200).end()
})

app.all('/:name/pause', function(req, res) {
    var name = req.params.name
    let cwh = cronJobs[name]
    if (!cwh) {
        res.status(404).end()
        return
    }
    cwh.stop()
    res.status(200).end()
})

app.all('/:name/start', function(req, res) {
    var name = req.params.name
    let cwh = cronJobs[name]
    if (!cwh) {
        res.status(404).end()
        return
    }
    cwh.start()
    res.status(200).end()
})

let stop = function(req, res) {
    var name = req.params.name
    let cwh = cronJobs[name]
    if (!cwh) {
        res.status(403).end()
        return
    }
    cwh.stop()
    delete cronJobs[name]
    fs.unlinkSync(`${CWEF}/conf/${name}.json`)
    fs.unlinkSync(`${CWEF}/temp/${name}.json`)
    res.status(200).end()
}
app.all('/:name/stop', stop)
app.delete('/:name', stop)

function start(port, f) {
    try {
        fs.mkdirSync(`${CWEF}/conf`, { recursive: true})
        fs.mkdirSync(`${CWEF}/temp`, { recursive: true})
        let files = fs.readdirSync(`${CWEF}/conf`)
        files.forEach(element => {
            create(element.replace('.json', ''), JSON.parse(fs.readFileSync(`${CWEF}/conf/${element}`)))
        });
    } catch (error) {
        console.log(error)
        console.log('no files found')
    }
    app.listen(port || 3000, f)
}

module.exports = {
    start
}