'use strict';

angular.module('mud', [
	'ngAnimate',
	'ngAria',
	'ngMessages',
	'ngRoute',
	'ngMaterial',
	'highcharts-ng'
])
.config(['$routeProvider', '$mdThemingProvider', '$sceDelegateProvider', '$mdAriaProvider',
function ($routeProvider, $mdThemingProvider, $sceDelegateProvider, $mdAriaProvider) {

	$mdAriaProvider.disableWarnings();
	$sceDelegateProvider.resourceUrlWhitelist([
		'self',
		'**'
	]);
	$mdThemingProvider.theme('default')
		.primaryPalette('blue-grey')
		.accentPalette('light-blue')
		.warnPalette('pink')
		.backgroundPalette('grey', {'default': '500'})
		.dark();
	$mdThemingProvider.theme('dark-cyan').backgroundPalette('cyan').dark();
	$mdThemingProvider.theme('dark-light-blue').backgroundPalette('light-blue').dark();
	$mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
	$mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();
	$mdThemingProvider.theme('dark-grey')
		.primaryPalette('grey', {'default': '400'})
		.accentPalette('grey', {'default': '500'})
		.warnPalette('grey', {'default': '100'})
		.backgroundPalette('grey', {'default':'700'}).dark();

	$routeProvider
		.when('/main', {
			templateUrl: 'assets/views/main/main.html',
			controller: 'MainCtrl',
			controllerAs: 'main'
		})
		.when('/dashboard/:id', {
				templateUrl: 'assets/views/dashboard/dashboard.html',
				controller: 'DashboardCtrl',
				controllerAs: 'dashboard'
			})
		.otherwise({
			redirectTo: '/main'
		});
}])
.directive('a', function() {
	return {
		restrict: 'E',
		link: function(scope, elem, attrs) {
			if (attrs.href === '' || attrs.href === '#') {
				elem.on('click', function(e) {
					e.preventDefault(); // prevent link click for above criteria
				});
			}
		}
	};
})
.controller('GlobalCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
	$rootScope.doneLoading = false;
	$scope.currentNavItem = '';
}]);

Date.prototype.yyyymmdd = function() {
	var yyyy = this.getFullYear().toString();
	var mm = (this.getMonth() + 1).toString();
	var dd = this.getDate().toString();
	return yyyy + ' - ' + (mm[1] ? mm : "0" + mm[0]) + ' - ' + (dd[1] ? dd : "0" + dd[0]);
};
Date.prototype.yyyymmm = function() {
	var shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var yyyy = this.getFullYear().toString();
	var mm = shortMonths[this.getMonth()-1];
	var dd = this.getDate().toString();
	return yyyy + ' - ' + mm;
};	
Date.prototype.startMonth = function() {
	var yyyy = this.getFullYear();
	var mm = this.getMonth();
	return new Date(yyyy, mm, 1);
};