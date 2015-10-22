'use strict';

angular.module('mynewsApp')
  .service('geolocation', function () {
    var geo = {
      lat: 33.92472,
      lon: -84.35655
    };

    function distance(lon1, lat1, lon2, lat2) {
      lon2 = geo.lon || lon2;
      lat2 = geo.lat || lat2;
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
      geo: geo
    }
  });
