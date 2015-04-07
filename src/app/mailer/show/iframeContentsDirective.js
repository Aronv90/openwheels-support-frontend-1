/**
 * Created by Wilgert on 19-2-2015.
 */
angular.module('openwheels.mailer')
	.directive('iframeContents', function ($sce, $sanitize, $timeout, $compile) {
		'use strict';
		return {
			scope: {
				'contents': '=iframeContents'
			},
			link: function postLink(scope, elem, attr) {
				elem[0].contentWindow.document.write($sce.trustAsHtml(scope.contents) || '');
			}
		};
	});