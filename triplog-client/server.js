#!/bin/env node
'use strict';

var ip = process.env.OPENSHIFT_NODEJS_IP || 'localhost';
var port = process.env.OPENSHIFT_NODEJS_PORT || 5400;
var express = require('express');
var app = express();
var server = require('http').Server(app);
app.use(express.static('dist'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

server.listen(port, ip, function () {
	console.info('Magic happens at', ip ,'on port', server.address().port);
});