angular.module('twitterSocketStreamApp', ['btford.socket-io', 'ngAnimate'])
    .controller('twitterFilterController', ['$scope', '$http', 'socketFactory',
        function($scope, $http, socketFactory) {

            var myIoSocket;
            var socketId;
            var currentFilter;

            myIoSocket = io({
                'forceNew': true
            });

            myIoSocket.on('connect', function() {
                socketId = myIoSocket.io.engine.id;
                console.log(socketId + " - Socket connected");
            });

            var mySocket = socketFactory({
                ioSocket: myIoSocket
            });

            mySocket.on('disconnect', function() {
                console.log(socketId + " - Socket disconnected");
            });

            mySocket.on('tweet', function(tweet) {
                if ($scope.tweets) {
                    //console.log(tweet);
                    $scope.tweets.push({
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
                }
            });

            $scope.search = function(filter) {
                $scope.searchOnce = true;
                $scope.state = 'started';
                if (filter && filter !== currentFilter) {
                    currentFilter = filter;
                    $scope.tweets = [];
                    mySocket.emit('filter', filter);
                }
            };

            $scope.togglePlayPause = function() {
                if ($scope.state === 'paused') {
                    $scope.state = 'started';
                    mySocket.emit('start');
                } else {
                    $scope.state = 'paused';
                    mySocket.emit('pause');
                }
            };

            var flippedCards = [];
            $scope.isFlippedCard = function(tweetId) {
                return flippedCards.indexOf(tweetId) !== -1;
            };

            $scope.toggleTweetCard = function(tweetId) {
                console.log(tweetId);
                if (flippedCards.indexOf(tweetId) === -1) {
                    flippedCards.push(tweetId);
                } else {
                    flippedCards.splice(flippedCards.indexOf(tweetId), 1);
                }
            };
        }
    ]).filter('reverse', function() {
        return function(tweets) {
            if (!angular.isArray(tweets)) return false;
            return tweets.slice().reverse();
        };
    });