'use strict'

var config = require('./config');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var ntwitter = require('ntwitter');
var twitter = new ntwitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token,
    access_token_secret: config.access_token_secret
});
var io = require('socket.io')(http);
var state = {
    STARTED: 0,
    PAUSED: 1,
    STOPPED: 2
};

app.use(express.static('.'));

io.on('connection', function(socket) {
    var currentStream;
    var currentFilter;
    var streamState = state.STOPPED;
    var emitTweet = function(tweet) {
        if (streamState === state.STARTED) {
            socket.emit('tweet', tweet);
            console.log(tweet.text);
        }
    };

    console.log(socket.id + ' - New socket connected');

    socket.on('filter', function(filter) {
        if (typeof filter === 'string' && filter !== currentFilter) {
            currentFilter = filter;
            
            if (currentStream) {
                currentStream.destroy();
                console.log(socket.id + ' - Stream stopped');
            }

            streamState = state.STARTED;
            twitter.stream('statuses/filter', {
                track: filter
            }, function(stream) {
                currentStream = stream;

                console.log(socket.id + ' - Tracking tweets filtered by ' + filter + '...');
                
                stream.on('data', emitTweet);

                stream.on('error', function(error) {
                    console.log('ERROR: ' + error);
                });
            });
        }
    });

    socket.on('pause', function() {
        streamState = state.PAUSED;
        console.log(socket.id + ' - Stream paused');
    });

    socket.on('start', function() {
        streamState = state.STARTED;
        console.log(socket.id + ' - Stream started');
    });

    socket.on('disconnect', function() {
        console.log(socket.id + ' - Socket disconnected');
        if (currentStream) {
            currentStream.destroy();
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