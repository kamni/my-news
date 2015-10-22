'use strict';

describe('Controller: MyStoriesCtrl', function () {

  // load the controller's module
  beforeEach(module('mynewsApp'));

  var MyStoriesCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MyStoriesCtrl = $controller('MyStoriesCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
