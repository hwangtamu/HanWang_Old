/* global require:true, console:true, process:true, __dirname:true */
'use strict'

// Example run command: `node app.js 9000 6380 true`; listen on port 9000, connect to redis on 6380, debug printing on.

var express     = require('express')
var http        = require('http')


if (process.env.REDISTOGO_URL) {
    // TODO: redistogo connection
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis").createClient(rtg.port, rtg.hostname);

  redis.auth(rtg.auth.split(":")[1]);
} else {
    var redis = require("redis").createClient();
}

// Data handling
var save = function save(d) {
  redis.hmset(d.postId, d)
  //if( debug )
  console.log('saved to redis: ' + d.postId +', at: '+ (new Date()).toString())
}

// Server setup
var app = express()
app.use(express.bodyParser())
app.use(express.static(__dirname + '/public'))
app.set('port', (process.env.PORT || 5000));


// If the study has finished, write the data to file
app.post('/finish', function(req, res) {
  fs.readFile('public/modules/blocked-workers.json', 'utf8', function(err,data) {
    if (err) console.log(err);
    var data = JSON.parse(data);
    data.push(req.body.workerId);
    data = JSON.stringify(data);
    fs.writeFile('public/modules/blocked-workers.json', data, function(err) {
      if(err) console.log(err);
    });
  });

  res.send(200)
})

// Handle POSTs from frontend
app.post('/', function handlePost(req, res) {
  // Get experiment data from request body
  var d = req.body
  // If a postId doesn't exist, add one (it's random, based on date)
  if (!d.postId) d.postId = (+new Date()).toString(36)
  // Add a timestamp
  d.timestamp = (new Date()).getTime()
  // Save the data to our database
  save(d)
  // Send a 'success' response to the frontend
  res.send(200)
})


var path = require('path')
var formidable = require('express-formidable');
var fs = require('fs');
var mv = require('mv');
var bodyParser = require('body-parser');

//bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(formidable({
    uploadDir: '/public/'
}));

app.get('/upload',function(req,res){
    console.log("code for uploading");
    res.sendfile(path.join(__dirname+'/public/modules'+'/upload.html'));

});

app.post('/upload',function(req,res) {
    console.log("moving code");
    var files = req.files;
    var oldpath = files.filetoupload.path;
    //var newpath = "./public/" + files.filetoupload.name;
    var newpath = "./public/data/" + "groups.csv";
    mv(oldpath, newpath, function (err) {
            if (err) {
                throw err;
            };
    });
    console.log('File uploaded');
    res.write('<p>File uploaded</p> </br>');
    res.end();
});

// Create the server and tell which port to listen to
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
