'use strict';

angular.module('mynewsApp')
  .controller('SignupCtrl', function ($scope, Auth, $location, geolocation) {
    $scope.user = {};
    $scope.errors = {};

    $scope.register = function(form) {
      $scope.submitted = true;

      geolocation.geocode($scope.user.street, $scope.user.city, $scope.user.state).then(function(location){

        if(form.$valid) {
          Auth.createUser({
            name: $scope.user.name,
            email: $scope.user.email,
            password: $scope.user.password,
            street: $scope.user.street,
            city: $scope.user.city,
            state: $scope.user.state,
            lat: location.lat,
            lon: location.lng
          })
          .then( function() {
            // Account created, redirect to home
            $location.path('/my-news');
          })
          .catch( function(err) {
            err = err.data;
            $scope.errors = {};

            // Update validity of form fields that match the mongoose errors
            angular.forEach(err.errors, function(error, field) {
              form[field].$setValidity('mongoose', false);
              $scope.errors[field] = error.message;
            });
          });
        }

      });
    };

  });
