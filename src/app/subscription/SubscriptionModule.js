'use strict';

angular.module('openwheels.subscription', [
  'openwheels.subscription.list',
  'openwheels.subscription.edit',
  'openwheels.subscription.create'
])

  .config(function ($stateProvider) {

    /**
     * subscription
     */
    $stateProvider.state('root.subscription', {
      abstract: true,
      url: '/subscriptions',
      views: {
        'main@': {
          template: '<div ui-view></div>'
        }
      }
    });

    $stateProvider.state('root.subscription.list', {
      url: '/list',
      controller: 'SubscriptionListController',
      templateUrl: 'subscription/list/subscription-list.tpl.html',
      resolve: {
        subscriptions: ['$stateParams', 'subscriptionService', function ($stateParams, subscriptionService) {
          return subscriptionService.search();
        }]
      }
    });

    $stateProvider.state('root.subscription.create', {
      url: '/create',
      controller: 'SubscriptionCreateController',
      templateUrl: 'subscription/create/subscription-create.tpl.html',
      data: {pageTitle: 'Create Subscription'}
    });

    $stateProvider.state('root.subscription.edit', {
      url: '/edit/:id',
      controller: 'SubscriptionEditController',
      templateUrl: 'subscription/edit/subscription-edit.tpl.html',
      resolve: {
        subscription: ['$stateParams', 'subscriptionService', function ($stateParams, subscriptionService) {
          var subscriptionId = $stateParams.id;
          return subscriptionService.get({
            subscription: subscriptionId
          });
        }]
      }
    });
  });
