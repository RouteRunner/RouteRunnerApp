//var knexConfig = require('./knexfile');
//var knex = require('knex')(knexConfig);
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var router = express.Router();
//var logger = require('morgan');

var app = express();
module.exports = app;

//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));

app.get('/', function (req, res) {
    var trimmedPath = __dirname.substring(0, __dirname.length - 2);
    res.sendFile(path.join(trimmedPath + '/index.html'));
});

app.post('/', function(req, res) {
  console.log("req.body");
  console.log(req.body);
//   var evt = req.body.input;
//   var day = req.body.select;
//   console.log(evt);
//   console.log(day);
//   knex('months').returning('days_id').insert({event: evt, dayName: ''}).then(function(result) {
//     res.send(JSON.stringify({id:result[0]}));
//   });

  res.send("got POST request on '/'");
});

app.listen(3000, function () {
    console.log("server started, listening on port 3000");
});
