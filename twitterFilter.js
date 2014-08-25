angular.module('twitterSocketStreamApp')
    .factory('TwitterFilter', ['socketFactory',
        function TwitterFilter(socketFactory) {
            var myIoSocket, mySocket, socketId;
            var currentFilter;
            var TwitterFilter = {};
            var flippedCards = [];

            TwitterFilter.state = '';
            TwitterFilter.tweets = [];

            myIoSocket = io({
                'forceNew': true
            });

            myIoSocket.on('connect', function() {
                socketId = myIoSocket.io.engine.id;
                console.log(socketId + " - Socket connected");
            });

            mySocket = socketFactory({
                ioSocket: myIoSocket
            });

            mySocket.on('disconnect', function() {
                console.log(socketId + " - Socket disconnected");
            });

            mySocket.on('tweet', function(tweet) {
                TwitterFilter.tweets.push({
                    id: tweet.id,
                    authorImage: tweet.user.profile_image_url,
                    author: tweet.user.screen_name,
                    authorDescription: tweet.user.description,
                    authorNbFollowers: tweet.user.followers_count,
                    authorNbFollowing: tweet.user.friends_count,
                    authorName: tweet.user.name,
                    date: tweet.created_at.split(' ')[3],
                    text: tweet.text
                });
            });

            TwitterFilter.search = function(filter) {
                TwitterFilter.state = 'started';
                if (filter && filter !== currentFilter) {
                    currentFilter = filter;
                    mySocket.emit('filter', filter);
                }
                return TwitterFilter.state;
            };

            TwitterFilter.togglePlayPause = function() {
                if (TwitterFilter.state === 'paused') {
                    TwitterFilter.state = 'started';
                    mySocket.emit('start');
                } else {
                    TwitterFilter.state = 'paused';
                    mySocket.emit('pause');
                }
                return TwitterFilter.state;
            };

            TwitterFilter.flipTweetCard = function(tweetId) {
                if (flippedCards.indexOf(tweetId) === -1) {
                    flippedCards.push(tweetId);
                } else {
                    flippedCards.splice(flippedCards.indexOf(tweetId), 1);
                }
            };

            TwitterFilter.isFlippedTweetCard = function(tweetId) {
                return flippedCards.indexOf(tweetId) !== -1;
            };

            return TwitterFilter;
        }
    ]);