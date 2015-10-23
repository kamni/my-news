'use strict';

angular.module('mynewsApp')
  //.filter('unsafe', function($sce) {
  //  return function(val) {
  //    return $sce.trustAsHtml(val);
  //  };
  //})
  .controller('MyNewsCtrl', function ($scope, $http, socket, stories, geolocation, Auth) {
    var self = this;
    var user = Auth.getCurrentUser();
    console.log(user);
    var lat = user.lat || +geolocation.geo.lat;
    var lon = user.lon || +geolocation.geo.lon;
    var coorOffset = 1;
    var host = "http://10.240.94.101:4301";
    var now = Date.now();

    // $scope.awesomeThings = [];
    // $scope.storiesList = [];

    // $http.get('/api/things').success(function(awesomeThings) {
    //   $scope.awesomeThings = awesomeThings;
    //   socket.syncUpdates('thing', $scope.awesomeThings);
    // });

    // $scope.addThing = function() {
    //   if($scope.newThing === '') {
    //     return;
    //   }
    //   $http.post('/api/things', { name: $scope.newThing });
    //   $scope.newThing = '';
    // };

    // $scope.deleteThing = function(thing) {
    //   $http.delete('/api/things/' + thing._id);
    // };

    // $scope.$on('$destroy', function () {
    //   socket.unsyncUpdates('thing');
    //   socket.unsyncUpdates('stories');
    // });

    if(stories.getStories().length === 0){
      $http.get('http://10.240.94.101:4301/eom/PortalConfig/wsbtv.com/jsp/rest3.jsp?query=&city=&lat1=' + (lat - coorOffset) + '&lat2=' + (lat + coorOffset) + '&long1=' + (lon - coorOffset) + '&long2=' + (lon + coorOffset))
        .success(function(storiesXml){

          var storiesArray = [];

          $("item", storiesXml).each(function(i, doc) {
            var places = $("GeographicalPlaces", doc);

            storiesArray.push({
              headline: $("grouphead > headline", doc).html(),
              summary: $("summary", doc).html(),
              text: $("text", doc).html(),
              url: host + $("url", doc).text(),
              photo: getPhotoURL($("photo", doc).attr('fileref')),
              timemodified: $("dbmetadata > sys > timemodified", doc).text(),
              geo: {
                address: $("Address", places).text(),
                latitude: $("Latitude", places).text(),
                longitude: $("Longitude", places).text()
              }
            });
          });

          setStories.call(self, storiesArray);
        });
    } else {
      $scope.storiesList = stories.getStories();
      socket.syncUpdates('stories', $scope.storiesList);
    }

    function getPhotoURL(fileref) {
        return fileref ? host + "/rf/image_wsbtv_large" + fileref : "";
    }

    function jtimeAgo(timeModified){
      var diff = (now - (timeModified * 1000)) / 1000;
      var day = 60 * 60 * 24;
      var hour = 60 * 60;
      var dayDiff = Math.floor(diff / day);
      // var hours =


      return dayDiff;
    }

    function timeAgo(time){
      var units = [
        { name: "second", limit: 60, in_seconds: 1 },
        { name: "minute", limit: 3600, in_seconds: 60 },
        { name: "hour", limit: 86400, in_seconds: 3600  },
        { name: "day", limit: 604800, in_seconds: 86400 },
        { name: "week", limit: 2629743, in_seconds: 604800  },
        { name: "month", limit: 31556926, in_seconds: 2629743 },
        { name: "year", limit: null, in_seconds: 31556926 }
      ];
      var diff = (now - new Date(time*1000)) / 1000;
      if (diff < 5) return "now";

      var i = 0, unit;
      while (unit = units[i++]) {
        if (diff < unit.limit || !unit.limit){
          var diff =  Math.floor(diff / unit.in_seconds);
          return diff + " " + unit.name + (diff>1 ? "s" : "");
        }
      };
    }


    function setStories(storiesResult){
      var storiesList = [];

      angular.forEach(storiesResult, function(v){
        var data = {
          headline: $(v.headline).text(),
          summary: $(v.summary).text(),
          geo: v.geo,
          distance: +geolocation.distance(+v.geo.longitude, +v.geo.latitude),
          photo: v.photo,
          url: v.url,
          timemodified: v.timemodified,
          timeago: timeAgo(v.timemodified)
        };
        storiesList.push(data);

      });

      $scope.storiesList = storiesList;
      stories.setStories(storiesList);
      socket.syncUpdates('stories', $scope.storiesList);
      console.log($scope.storiesList);
    }


  });













