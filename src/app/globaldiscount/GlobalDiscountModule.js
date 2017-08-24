'use strict';

angular.module('openwheels.globaldiscount', [
  'openwheels.globaldiscount.create',
  'infinite-scroll'
])

  .config(function config($stateProvider) {

    $stateProvider.state('root.globaldiscount', {
      abstract: true,
      url: '/globaldiscount',
      views: {
        'main@': {
          template: '<div ui-view></div>'
        }
      },
      role: 'ROLE_ADMIN'
    });

    /**
     * globaldiscount/create
     */
    $stateProvider.state('root.globaldiscount.create', {
      url: '/create',
      controller: 'GlobalDiscountCreateController',
      templateUrl: 'globaldiscount/create/global-discount-create.tpl.html',
      data: {pageTitle: 'Create Discount'}
    });


  })

;