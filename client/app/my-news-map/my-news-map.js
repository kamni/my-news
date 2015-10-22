'use strict';

angular.module('mynewsApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('my-news-map', {
        url: '/my-news-map',
        templateUrl: 'app/my-news-map/my-news-map.html',
        controller: 'MyNewsMapCtrl'
      });
  });
