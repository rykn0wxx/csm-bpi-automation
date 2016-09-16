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
		.primaryPalette('light-blue')
		.accentPalette('orange')
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

	$scope.projects = [{
		name: 'JD',
		data: {
			newTickets: 123,
			closeTickets: 100
		}
	}, {
		name: 'CEC',
		data: {
			newTickets: 123,
			closeTickets: 100
		}
	}, {
		name: 'Amcor',
		data: {
			newTickets: 123,
			closeTickets: 100
		}
	}, {
		name: 'Novelis',
		data: {
			newTickets: 123,
			closeTickets: 100
		}
	}, {
		name: 'JD',
		data: {
			newTickets: 123,
			closeTickets: 100
		}
	}, {
		name: 'CEC',
		data: {
			newTickets: 123,
			closeTickets: 100
		}
	}, {
		name: 'Amcor',
		data: {
			newTickets: 123,
			closeTickets: 100
		}
	}, {
		name: 'Novelis',
		data: {
			newTickets: 123,
			closeTickets: 100
		}
	}];
}]);

