'use strict';

angular.module('mynewsApp')
  //.filter('unsafe', function($sce) {
  //  return function(val) {
  //    return $sce.trustAsHtml(val);
  //  };
  //})
  .controller('MyNewsCtrl', function ($scope, $http, socket, stories, geolocation) {
    var self = this;
    var eventsBaseUrl = "http://ajc.stage.pointslocal.com/";
    var eventsOptions = {lon: -84.36, lat: 33.92, radius: 15} // for testing only


    $scope.hey = 'hey';

    $scope.awesomeThings = [];

    getStories();


    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      socket.syncUpdates('thing', $scope.awesomeThings);
    });

    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });


    function findStories(options) {
      var baseURL = "http://10.240.94.101:4301/eom/PortalConfig/wsbtv.com/jsp/rest.jsp";
      var data = {
        query: options.query || "",
        city: options.city,
        lat1: options.lat1,
        long1: options.long1,
        lat2: options.lat2,
        long2: options.long2
      };

      return $.ajax(baseURL, { dataType: "xml", data: data }).then(function(xml) {
        var stories = [];
        $("doc", xml).each(function(i, doc) {
          var places = $("GeographicalPlaces", doc);
          stories.push({
            headline: $("grouphead > headline", doc).html(),
            summary: $("summary", doc).html(),
            text: $("text", doc).html(),
            geo: {
              address: $("Address", places).text(),
              latitude: $("Latitude", places).text(),
              longitude: $("Longitude", places).text()
            }
          });
        });

        return stories;
      });
    }

    function findEvents()

    function getStories(){
      console.log(stories.getStories().length);
      if(stories.getStories().length){
        $scope.storiesList = stories.getStories();
        return;
      }

      findStories({
        city: "",
        lat1: 32.7,
        long1: -85.4,
        lat2: 33.8,
        long2: -83.3
      }).then(function(storiesResult){
        setStories.call(self, storiesResult);
      }, function(err) {
        console.error(err);
      });
    }

    function setStories(storiesResult){
      var storiesList = [];

      angular.forEach(storiesResult, function(v){
        console.log(v);
        var data = {};
        data.headline = $(v.headline).text();
        data.summary = $(v.summary).text();
        data.geo = v.geo;
        data.distance = geolocation.distance(+v.geo.longitude, +v.geo.latitude);
        storiesList.push(data);

      });
      $scope.storiesList = storiesList;
      stories.setStories(storiesList);
      console.log($scope.storiesList);
    }

    function eventImageUrl(imageId, height, width) {
        return eventsBaseUrl + "image?method=image.icrop&context=event.image&w=" + width + "&h=" + height + "&id=" + imageId
    }

    function findEvents(options) {
      // pull events from pointsLocal
      var apiUrl = "api/v1/events"
      var data = {
        latitude: options.lat,
        longitude: options.lon,
        radius: options.radius
      };

      return $.get(eventsBaseUrl + apiUrl, data, null, "json").then(function(json) {
          var events = [];
          $(json.items).each(function(item) {
                events.push({
                    headline: item.title,
                    summary: item.description,
                    url: eventsBaseUrl + "event/" + item.guid,
                    image: eventImageUrl(item.id, 53, 93),
                    venue: item.venue_name,
                    geo: {
                          address: item.venue_address,
                          latitude: item.latitude,
                          longitude: item.longitude
                    }
                });
                return events;
            });
        });
    }
  });
