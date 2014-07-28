'use strict'

var config = require('./config');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var Twit = require('twit');
var T = new Twit({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token: config.access_token,
    access_token_secret: config.access_token_secret
});
var io = require('socket.io')(http);

app.use(express.static('.'));

io.on('connection', function(socket) {
    var stream;

    console.log(socket.id + ' - New socket connected');
    socket.on('filter', function(filter) {
        if (stream) {
            stream.stop();
            console.log(socket.id + ' - Stream stopped');
        }

        if (typeof filter === 'string') {
            stream = T.stream('statuses/filter', {
                track: filter
            });

            console.log(socket.id + ' - Tracking tweets filtered by ' + filter + '...');
            stream.on('tweet', function(tweet) {
                socket.emit('tweet', tweet);
                console.log(tweet.text);
            });

            stream.on('error', function(error) {
                console.log(error.message);
            });
        }
    });

    socket.on('disconnect', function() {
        console.log(socket.id + ' - Socket disconnected');
        if (stream) {
            stream.stop();
            console.log(socket.id + ' - Stream stopped');
        }
    });
});

app.get('/twitterFilter', function(req, res) {
    res.sendfile('twitterFilter.html');
});

http.listen(8080, function() {
    console.log('listening on *:8080');
});
