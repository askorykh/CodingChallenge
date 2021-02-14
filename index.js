const fs = require("fs");
const mysql = require("mysql2");
const fastcsv = require("fast-csv");

let stream = fs.createReadStream("customers.csv");
let csvData = [];
let csvStream = fastcsv
  .parse()
  .on("data", function(data) {
    csvData.push(data);
  })
  .on("end", function() {
    // remove the first line: header
    csvData.shift();
   
    // create a new connection to the database
    const connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "12345678",
        database: "customers"
      });
  
      // open the connection
      connection.connect(error => {
        if (error) {
          console.error(error);
        } else {
          let query =
            "REPLACE INTO machine_details (owner, available, country, currency, machineInfo, machineType, photos, sourceId, price, source, url) VALUES ?";
          connection.query(query, [csvData], (error, response) => {
            console.log(error || response);
          });
        }
      });
    });
stream.pipe(csvStream);








