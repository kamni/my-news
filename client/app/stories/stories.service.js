'use strict';

angular.module('mynewsApp')
  .service('stories', function () {
    var storiesList = [];



    function getStories() {
      return storiesList;
    }

    function setStories(obj){
      angular.forEach(obj, function(v){
        storiesList.push(v);
      });
    }

    return {
      getStories: getStories,
      setStories: setStories
    }
  });
