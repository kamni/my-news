'use strict';

angular.module('mynewsApp')
  .service('geolocation', function ($http, Auth) {
    var geo = {
      lat: 33.92472,
      lon: -84.35655
    };
    var user = Auth.getCurrentUser();

    var baseUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=";
    var endUrl = "&key=AIzaSyAmweNIVntbXmpIZ0VA7umwPUKPPH3QAWw&sensor=false";

    function geocode(street, city, state){
      // console.log(street, city, state);
      var xhr = $.ajax(baseUrl + street.replace(/\s+/g, '+') + ',' + city.replace(/\s+/g, '+') + ',' + state.replace(/\s+/g, '+') + endUrl, { method: "GET", dataType: "json" });

      //var url = baseUrl + street.replace(/\s+/g, '+') + ',' + city.replace(/\s+/g, '+') + ',' + state.replace(/\s+/g, '+') + endUrl;

      return Promise.resolve(xhr).then(function(json) {
        console.log(json.results[0]);
        geo.lat = json.results[0].geometry.location.lat;
        geo.lon = json.results[0].geometry.location.lon;
        return json.results[0].geometry.location;
      });
    }

    function distance(lon1, lat1, lon2, lat2) {
      lon2 = +user.lon || geo.lon || lon2;
      lat2 = +user.lat || geo.lat || lat2;
      var R = 6371; // Radius of the earth in km
      var dLat = (lat2-lat1).toRad();  // Javascript functions in radians
      var dLon = (lon2-lon1).toRad();
      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      var d = R * c; // Distance in km
      return d.toFixed(1);
    }

    /** Converts numeric degrees to radians */
    if (typeof(Number.prototype.toRad) === "undefined") {
      Number.prototype.toRad = function() {
        return this * Math.PI / 180;
      }
    }

    return {
      distance: distance,
      geo: geo,
      geocode: geocode
    }
  });
