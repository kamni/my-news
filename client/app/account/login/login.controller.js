'use strict';

angular.module('mynewsApp')
  .controller('LoginCtrl', function ($scope, Auth, $location, geolocation) {
    $scope.user = {};
    $scope.errors = {};

    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function() {

          var user = Auth.getCurrentUser();

          console.log(user);
          geolocation.geo.lat = user.lat;
          geolocation.geo.lon = user.lon;

          // Logged in, redirect to home
          $location.path('/');
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
      }
    };

  });
