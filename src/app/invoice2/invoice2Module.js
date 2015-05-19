'use strict';

angular.module('openwheels.invoice2', [
  'openwheels.invoice2.invoiceGroup.list',
  'openwheels.invoice2.invoiceGroup.show'
])

.config(function config($stateProvider) {

  $stateProvider.state('root.invoice2', {
    abstract: true,
    url: '/invoice2',
    views: {
      'main@': {
        template: '<div ui-view></div>'
      }
    }
  });

  $stateProvider.state('root.invoice2.invoiceGroup', {
    abstract: true,
    url: '/invoice-groups',
    views: {
      'main@': {
        template: '<div ui-view></div>'
      }
    }
  });

  $stateProvider.state('root.invoice2.invoiceGroup.list', {
    url: '?status&from&until&max',
    controller: 'v2_InvoiceGroupListController',
    templateUrl: 'invoice2/invoiceGroup/list/v2_invoiceGroupList.tpl.html',
    data: {pageTitle: 'Invoice groups'},
    resolve: {
      ungroupedReceivedInvoices: function () {
        return null;
      },
      ungroupedSentInvoices: function () {
        return null;
      },
      invoiceGroups: ['$stateParams', 'paymentService', function ($stateParams, paymentService) {
        var req = $stateParams;
        var params = {};
        if (req.status) { params.status = req.status; }
        if (req.from)   { params.from   = req.from; }
        if (req.until)  { params.until  = req.until; }
        if (req.max)    {
          try {
            params.max = parseInt(req.max);
          } catch (e) {
          }
        }
        return paymentService.getInvoiceGroups(params);
      }]
    }
  });

  $stateProvider.state('root.invoice2.invoiceGroup.show', {
    url: '/:invoiceGroupId',
    controller: 'v2_InvoiceGroupShowController',
    templateUrl: 'invoice2/invoiceGroup/show/v2_invoiceGroupShow.tpl.html',
    data: {pageTitle: 'Invoice group'},
    resolve: {
      invoiceGroup: ['$stateParams', 'invoice2Service', function ($stateParams, invoice2Service) {
        var params = {
          invoiceGroup: $stateParams.invoiceGroupId
        };
        return invoice2Service.getInvoiceGroup(params);
      }]
    }
  });


})
;
