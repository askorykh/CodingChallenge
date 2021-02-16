const express = require('express');
const mysql = require('mysql2');
const bodyParser = require("body-parser");
require('dotenv').config();

const app = express();
const port = 3000;

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: "customers"
});

// set EJS as default view rendered
app.set('view engine', 'ejs')

app.use(express.json())

app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', function(req, res) {
    res.render('index')
})

//Get data for a machine
/**  I would advice to check this https://opensource.zalando.com/restful-api-guidelines/#http-requests,
 * because in the code post is used for every request, but better if:
 * for select queries -> app.get()  ---  GET HTTP method
 * for insert queries -> app.post()  --- POST HTTP method
 * for update queries -> app.put() --- PUT HTTP method
 * for delete queries(you do not have it) -> app.delete() --- DELETE HTTP method
 * https://expressjs.com/en/starter/basic-routing.html
 *
 *
 */

//Get should be used ->  app.get(...)
//Following naming convention for routes -> better name can be '/machines
app.post('/getdata', function(req, res) {
    let query = "SELECT * FROM machine_details WHERE `sourceId` = ? "
    connection.query(query, [req.body.sourceId], function(err, result) {
        if (err) {
            res.send('THERE WAS AN ERROR!!!! 🙀')
            return
        }
        console.log(result);
        res.json(result)
    })
});

//Create a new machine
//Following naming convention for routes -> better name can be '/machine'
app.post('/addmachine', function(req, res) {
    console.log(req.body.owner);
    const owner = req.body.owner;
    const available = req.body.available;
    const country = req.body.country;
    const currency = req.body.currency;
    const machineInfo = req.body.machineInfo;
    const machineType = req.body.machineType;
    const photos = req.body.photos;
    const sourceId = req.body.sourceId;
    const price = req.body.price;
    const source = req.body.source;
    const url = req.body.url;

    const query = `INSERT INTO machine_details (owner, available, country, currency, machineInfo, machineType, photos, sourceId, price, source, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    connection.query(query, [owner, available, country, currency, machineInfo, machineType, photos, sourceId, price, source, url],  function(err, result) {
        if (err) {
            console.log(err)
            res.json({
                status: "NOT OK!"
            })
            return
        }
        res.json({
            status: "OK",
            description: "1 row inserted successfully"
        })
    })
})

//Update machine data
// Put should used to update object -> app.put(..)
//Following naming convention for routes -> better name can be '/machine'
//Since different HTTP method used, we can have the same name
app.post('/updatmachine', function(req, res) {
    let query = "update machine_details set owner = ? where sourceId = ?  ";
    connection.query(query,[req.body.owner, req.body.sourceId], function(err, result) {
        if (err) {
            res.send('THERE WAS AN ERROR!!!! 🙀')
            return
        }
        console.log("updated sucessfully");
        res.json({
            status: "OK",
            description: "updated sucessfully",
        })
    })
});
//Get the number of machines for each model
//Get should be used ->  app.get(...)
//Following naming convention for routes -> better name can be '/machine/models/total
//Here we want to get all machines count by model, so we do not need to send parameters
//SQL should be something like:
/**
 *  Select machineType, count(*) from machine_details GROUP BY machineType;
 *
 */
app.post('/noofmachines', function(req, res) {
    console.log(req.body.noofmachines);
    let query = "SELECT COUNT(*) FROM machine_details WHERE machineInfo like '% "+ req.body.noofmachines + "%'";
    connection.query(query, function(err, result) {
        if (err) {
            console.log(err)
            res.send('THERE WAS AN ERROR!!!! 🙀')
            return
        }
        console.log(result);
        res.json(result)
    })
});

//Get all machines belonging to a certain owner
//Get should be used ->  app.get(...)
//Following naming convention for routes -> better name can be '/owner/:ownerId/machines/
// you can get this parameter req.params.ownerId
app.post('/ownermachine', function(req, res) {
    let query = "SELECT machineType FROM machine_details WHERE owner= ? ";
    connection.query(query, [req.body.owner], function(err, result) {
        if (err) {
            res.send('THERE WAS AN ERROR!!!! 🙀')
            return
        }
        console.log(result);
        res.json(result)
    })
});

//Get the list of models with a certain attribute, i.e.: all machine with Round bales
//Here post can be used since we can send more attributes to search, for one attribute Get can be used
//Following naming convention for routes -> better name can be '/machines/search
app.post('/listofmodel', function(req, res) {
    console.log(req.body.attribute);
    let query = "SELECT machineInfo FROM machine_details WHERE machineInfo like '% "+ req.body.attribute + "%'"
    connection.query(query, function(err, result) {
        if (err) {
            res.send('THERE WAS AN ERROR!!!! 🙀')
            return
        }
        console.log(result);
        res.json(result)
    })
});

app.listen(port, function() {
    console.log(`listening on ${port}`)
});

//Do not forget to change Frontend UI if backend methods are changed :)