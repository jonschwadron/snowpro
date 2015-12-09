angular.module('Instagram')
    .factory('API', function($http) {

      return {
        getFeed: function() {
          return $http.get('http://snowpro.herokuapp.com/api/feed');
        },
        getMediaById: function(id) {
          return $http.get('http://snowpro.herokuapp.com/api/media/' + id);
        },
        likeMedia: function(id) {
          return $http.post('http://snowpro.herokuapp.com/api/like', { mediaId: id });
        }
      }

    });