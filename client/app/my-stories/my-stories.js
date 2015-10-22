'use strict';

angular.module('mynewsApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('my-stories', {
        url: '/my-stories',
        templateUrl: 'app/my-stories/my-stories.html',
        controller: 'MyStoriesCtrl'
      });
  });