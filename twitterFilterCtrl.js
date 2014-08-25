angular.module('twitterSocketStreamApp', ['btford.socket-io','ngAnimate'])
    .controller('TwitterFilterCtrl', ['$scope', 'TwitterFilter',
        function TwitterFilterCtrl($scope, TwitterFilter) {
            $scope.tweets = TwitterFilter.tweets;
            $scope.state = TwitterFilter.state;

            $scope.search = function(filter) {
                $scope.state = TwitterFilter.search(filter);
            };

            $scope.togglePlayPause = function() {
                $scope.state = TwitterFilter.togglePlayPause();
            };

            $scope.isFlippedTweetCard = function(tweetId) {
                return TwitterFilter.isFlippedTweetCard(tweetId);
            };

            $scope.flipTweetCard = function(tweetId) {
                TwitterFilter.flipTweetCard(tweetId);
            };
        }
    ]).filter('reverse', function() {
        return function(tweets) {
            if (!angular.isArray(tweets)) return false;
            return tweets.slice().reverse();
        };
    });