'use strict';

angular.module('mynewsApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('my-news', {
        url: '/my-news',
        templateUrl: 'app/my-news/my-news.html',
        controller: 'MyNewsCtrl'
      });
  });
