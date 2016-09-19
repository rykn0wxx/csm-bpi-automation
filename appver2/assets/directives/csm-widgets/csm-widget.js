'use strict';
angular.module('mud')
.directive('csmWidget', ['$compile', function ($compile) {
	function csmWidgetPostLink(tElem, tAttr) {
		tElem.addClass('_md');
		
		var cloned = angular.element(tElem).clone();
		var sublink = $compile( cloned, null, 1010 );
		return function postLink(scope, elem, attr) {
			console.log(attr, elem);
		};
	}
	return ({
		replace: true,
		templateUrl: 'assets/directives/csm-widgets/csm-widget.html',
		controller: 'CsmWidgetCtrl',
		controllerAs: 'ctrlCsmWidget',
		restrict: 'E',
		scope: {
			widgetInfo: '='
		},
		compile: csmWidgetPostLink
	});
}])
.directive('csmWidgetElem', ['$location', function($location) {
	var _ = window._;
	return {
		restrict: 'A',
		link: function(scope, elem, attrs) {
			elem.on('click', function(e) {
				e.preventDefault();
				console.log(_.lowerCase(scope.i.name), $location.path());
				$location.path('/dashboard/' + _.lowerCase(scope.i.name));
			});
		}
	}
}])
.controller('CsmWidgetCtrl', ['$scope', function($scope) {
	var me = this;
	me.clicker = function() {
		console.log($scope);
	};
}]);