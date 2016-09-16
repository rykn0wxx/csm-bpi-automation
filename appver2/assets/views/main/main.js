'use strict';

angular.module('mud')
.controller('MainCtrl', ['$scope', 'Datangular', '$rootScope', function ($scope, Datangular, $rootScope) {
	var me = this;
	
	Datangular.ticketData().then(function(d) {
		me.data = d;
		$rootScope.doneLoading = true;
		me.groupDesk = d.dimension(
			function(d) {
				return d.group.deskName;
			}
		);
		me.groupDesks = me.groupDesk.group().reduceSum(function(d) {return +d.count;});
	});
 
}]);
