angular.module('twitterSocketStreamApp', ['btford.socket-io', 'ngAnimate'])
    .controller('twitterFilterController', ['$scope', '$http', 'socketFactory',
        function($scope, $http, socketFactory) {

            var myIoSocket;
            var socketId;

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
                        authorImage: tweet.user.profile_image_url,
                        author: tweet.user.screen_name,
                        text: tweet.text,
                        date: tweet.created_at.split(' ')[3]
                    });
                }
            });

            $scope.search = function(filter) {
                if (filter) {
                    $scope.tweets = [];
                    mySocket.emit('filter', filter);
                }
            };
        }
    ]).filter('reverse', function() {
        return function(tweets) {
            if (!angular.isArray(tweets)) return false;
            return tweets.slice().reverse();
        };
    });