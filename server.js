'use strict';

var port = 5400;
var express = require('express');
var app = express();
var server = require('http').Server(app);
app.use(express.static('public'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

server.listen(port, function () {
	console.info('Magic happens at localhost on port', server.address().port);
});