'use strict';


describe('Controller: InvoiceGroupListController', function () {

  var ctrl, $scope, invoiceGroupsMock, invoiceGroupPathMock, stateParamsMock;


  beforeEach(module('ui.router'));
  beforeEach(angular.mock.module('openwheels.invoice.group.show'));


  beforeEach(function () {
    stateParamsMock = {
      page: 1,
      limit: 20,
      due: '2013-10-10'
    };

    invoiceGroupsMock = {
      result: 'test',
      cnt: 100
    };

    invoiceGroupPathMock = 'http://www.test.nl/';

  });

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $state) {
    $scope = $rootScope.$new();

    ctrl = $controller('InvoiceGroupListController', {

      $scope: $scope,
      $state: $state,
      invoiceGroups: invoiceGroupsMock,
      $stateParams: stateParamsMock,
      INVOICEGROUP_PATH: invoiceGroupPathMock
    });
  }));

  it('should init the scopes', function () {
    expect($scope.invoiceGroups).toEqual(invoiceGroupsMock.result);
    expect($scope.frontInvoiceGroupPath).toEqual(invoiceGroupPathMock);
    expect($scope.totalItems).toEqual(invoiceGroupsMock.cnt);
    expect($scope.params).toEqual({
      currentPage: stateParamsMock.page,
      due: stateParamsMock.due
    });
    expect($scope.maxSize).toEqual(7);
  });

  it('should change state on set page', function () {
    //$scope.setPage(10);
  });
});
