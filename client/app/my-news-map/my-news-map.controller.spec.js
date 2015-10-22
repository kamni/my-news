'use strict';

describe('Controller: MyNewsCtrl', function () {

  // load the controller's module
  beforeEach(module('mynewsApp'));

  var MyNewsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MyNewsCtrl = $controller('MyNewsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
