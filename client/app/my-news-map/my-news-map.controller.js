'use strict';

angular.module('mynewsApp')
  //.filter('unsafe', function($sce) {
  //  return function(val) {
  //    return $sce.trustAsHtml(val);
  //  };
  //})
  .controller('MyNewsMapCtrl', function ($scope, $http, socket, stories, Auth, geolocation) {
    var self = this;
    var user = Auth.getCurrentUser();
    var lat = user.lat || +geolocation.geo.lat;
    var lon = user.lon || +geolocation.geo.lon;
    var coorOffset = 1;
    var cachedEvents = null;

    // $scope.awesomeThings = [];

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
    // });


  "use strict";

  function getPosition() {
      // Quick result  for testing purposes
      return Promise.resolve({ lat: lat, long: lon });

      return new Promise(function(resolve, reject) {
          navigator.geolocation.getCurrentPosition(function(pos) {
              resolve({
                  lat: pos.coords.latitude,
                  long: pos.coords.longitude,
              });
          }, reject);
      });
  }

  function getGeoSquare(lat, long, radius) {
      radius = radius || .5;
      return {
          lat1: lat - radius,
          lat2: lat + radius,
          long1: long - radius,
          long2: long + radius
      };
  }

  function findEvents(options) {
    if (cachedEvents) {
      return Promise.resolve(cachedEvents);
    }

    var eventsBaseUrl = "http://ajc.stage.pointslocal.com/";
    var apiUrl = "api/v1/events"

    var data = {
      latitude: options.lat,
      longitude: options.long,
      radius: options.rad
    };

    var xhr = $.ajax(eventsBaseUrl + apiUrl, { method: "GET", dataType: "json", data: data });

    return Promise.resolve(xhr).then(function(json) {
        var events = [];
        $.each(json.items, function(k, item) {
          var headline = item.venue_name ? item.title + " at " + item.venue_name : item.title;
              events.push({
                  title: headline,
                  text: item.description,
                  headline: headline,
                  summary: item.description,
                  url: eventsBaseUrl + "event/" + item.guid,
                  photo: eventImageUrl(item.id, 53, 93),
                  type: "Event",
                  geo: {
                        address: item.venue_address,
                        latitude: +item.latitude,
                        longitude: +item.longitude
                  }
              });
          });
          cachedEvents = events;
          return events;
      });

      function eventImageUrl(imageId, height, width) {
          return eventsBaseUrl + "image?method=image.icrop&context=event.image&w=" + width + "&h=" + height + "&id=" + imageId
      }
  }

  function getStoryType(comment) {
      switch (comment) {
          case "Advertisement": return "ad"
          case "Event": return "event"
          default: return "story";
      }
  }

  function findStories(options) {
      var host = "http://10.240.94.101:4301",
          baseURL = host + "/eom/PortalConfig/wsbtv.com/jsp/rest3.jsp";

      var data = {
          query: options.query || "",
          city: options.city,
          lat1: options.lat1,
          long1: options.long1,
          lat2: options.lat2,
          long2: options.long2
      };

      if (typeof options.radius === "number" && typeof options.lat === "number") {
          var square = getGeoSquare(options.lat, options.long, options.radius);
          data.lat1 = square.lat1;
          data.long1 = square.long1;
          data.lat2 = square.lat2;
          data.long2 = square.long2;
      }

      var xhr = $.ajax(baseURL, { method: "GET", dataType: "xml", data: data });

      // This is a hack for now...
      function getPhotoURL(fileref) {
          return fileref ? host + "/rf/image_wsbtv_large" + fileref : "";
      }

      return Promise.resolve(xhr).then(function(xml) {

          var stories = [];

          $("item", xml).each(function(i, doc) {

              var places = $("GeographicalPlaces", doc);

              var story = {
                  title: $("grouphead > headline", doc).text().trim(),
                  headline: $("grouphead > headline", doc).html(),
                  summary: $("summary", doc).html(),
                  text: $("text", doc).html(),
                  url: host + $("url", doc).text(),
                  type: getStoryType($("Comment", doc).text()),
                  photo: getPhotoURL($("photo", doc).attr("fileref")),
                  geo: {
                      address: $("Address", places).text(),
                      latitude: Number($("Latitude", places).text()),
                      longitude: Number($("Longitude", places).text())
                  }
              };

              // Filter out anything that doesn't have a title
              if (story.title) {
                  stories.push(story);
              }

              //console.log(story);
          });
          return stories;
      });
  }

  var StoryMap = (function() {

      var apiSrc = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBAvOY2tUjwfZoCop036PBJh9FUg7qcX1Q&sensor=false",
          apiCallback = "initStoryMap",
          apiReady = null;

      function loadAPI() {
          if (apiReady) return apiReady;

          return apiReady = new Promise(function(resolve) {
              window[apiCallback] = resolve;

              var e = document.createElement("script");
              e.async = true;
              e.defer = true;
              e.src = apiSrc + "&callback=" + apiCallback;
              document.getElementsByTagName("head")[0].appendChild(e);

          });
      }

      function createPopup(story) {
          var content = "<h3><a href='" + story.url + "' target='_blank'>" + story.headline + "</a></h3>";

          if (story.photo) {
              content += "<div><img src='" + story.photo + "' style='width:100%' /></div>";
          }

          if (story.type !== "ad") {
              content += story.text;
          }

          content = content.trim();

          var window = new google.maps.InfoWindow({
              content: content,
              maxWidth: story.type === "ad" ? 500 : 300
          });

          return window;
      }

      function createStoryMarker(map, story) {
          var marker = new google.maps.Marker({
              map: map,
              position: { lat: story.geo.latitude, lng: story.geo.longitude },
              title: story.title,
              icon: story.type === "ad" ? "/assets/images/pin_green.png" : story.type === "event" ? "/assets/images/pin_blue.png" : "/assets/images/pin_red.png"
          });

          var window = createPopup(story);
          marker.addListener("click", function(evt) { window.open(map, marker); });

          return marker;
      }

      function updateStoryMarker(marker, story) {
          marker.setTitle(story.title);
          marker.setPosition({
              lat: story.geo.latitude,
              lng: story.geo.longitude
          });
      }

      function createMap(element, pos) {
          return loadAPI().then(function() {
              var map = new google.maps.Map(element, {
                  center: { lat: pos.lat, lng: pos.long },
                  zoom: pos.zoom || 8
              });

              var markers = null;

              function update(stories) {

                  var initialLoad = false,
                      urls = {};

                  if (!markers) {
                      markers = {};
                      initialLoad = true;
                  }

                  // Create a list of URLs (this is important for determining whether to delete a marker)
                  Object.keys(markers).forEach(function(url) {
                      urls[url] = 0;
                  });

                  stories.forEach(function(story) {
                      var m = markers[story.url];

                      // Mark the URL as visited
                      urls[story.url] = 1;

                      if (!m) {

                          m = markers[story.url] = createStoryMarker(map, story);

                          if (!initialLoad) {
                              m.setAnimation(google.maps.Animation.BOUNCE);
                              setTimeout(function() {
                                  m.setAnimation(null);
                              }, 3000);
                          }

                      } else {

                          updateStoryMarker(m, story);
                      }
                  });

                  // Remove any markers for stories that no longer exist
                  Object.keys(urls).forEach(function(url) {
                      if (urls[url] === 0 && markers[url]) {
                          markers[url].setMap(null);
                          markers[url] = null;
                      }
                  });
              }

              return { update: update };
          });
      }

      return {
          create: createMap
      };

  })();


  function pollStories(map, pos, ms) {
      return new Promise(function(resolve, reject) {

          function poll() {
              console.log("Updating...");
              Promise.all([findStories(pos), findEvents(pos)]).then(function(a) {
                a = a[0].concat(a[1]);
                map.update(a);
                setTimeout(poll, ms);
              }).catch(reject);
          }

          poll();
      });
  }

  getPosition().then(function(pos) {
      pos.rad = 70; // radius in miles, for events search
      pos.radius = 1; // radius in lat/lon for stories search
      pos.zoom = 12;
      StoryMap.create($("#map")[0], pos).then(function(map) {
          pollStories(map, pos, 5000);
      });
  });





  });
