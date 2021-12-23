// BASE SETUP
// =============================================================================

// call the packages we need
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const Database = require("@replit/database");
const db = new Database();
app.use(bodyParser({limit: '50mb'}));
// await Client.set("key", "value");
// let key = await Client.get("key");
// console.log(key);

const jsonsInDir = fs.readdirSync('./json-templates').filter(file => path.extname(file) === '.json');
const jsonData = [];

//Empty db
db.empty().then(() => {
    jsonsInDir.forEach((file, index) => {
        const fileData = fs.readFileSync(path.join('./json-templates', file));
        const json = JSON.parse(fileData.toString());
        json.id = index;
        jsonData.push(json);
    });

    jsonData.forEach((json, index) => {
         db.set(`${index}`, json);
    })
})

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(function (req, res, next) {
    // res.header("Access-Control-Allow-Origin", "http://localhost:4200");
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header('Access-Control-Allow-Credentials', true);
    next();
});

var port = process.env.PORT || 8080;

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', async function(req, res) {
    const dbData = await db.getAll();
    res.json({ data: dbData });
});

router.post('/new', async function(req, res) {
    const id = req.body.id ? req.body.id : await generateId();
    const data = req.body
    data.id = id
    const json = req.body;
    const newItem = await db.set(`${id}`, json);
    res.json({ message: `Created`, id: id });
});

router.delete('/remove/:id', async function(req, res) {
    const resp = await db.delete(`${req.params.id}`)
    res.json({ message: `Deleted` });
});

async function generateId() {
    const dbData = await db.getAll();
    const documents = []
    for (property in dbData) {
        documents.push(dbData[property])
    }
    const newId = Math.max( ...documents.map( it => it.id ) ) + 1
    return newId
}

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);