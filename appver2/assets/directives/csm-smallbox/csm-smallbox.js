'use strict';
angular.module('mud')
.directive('csmSmallbox', ['$mdTheming', function($mdTheming){

	function smallBoxLink(scope, elem, attr, ctrl) {
		elem.children().addClass('_md');

		$mdTheming(elem);
		console.log(scope);
	}

	return ({
		scope: {
			'csmsmallbox': '=?'
		},
		replace: true,
		controller: 'CsmSmallboxCtrl',
		controllerAs: 'smlbx',
		bindToController: true,
		restrict: 'E',
		templateUrl: 'assets/directives/csm-smallbox/csm-smallbox.html',
		link: smallBoxLink
	});
}])
.controller('CsmSmallboxCtrl', ['$element', '$scope', function($element, $scope){
	this._$scope = $scope;
	this._smallBoxEl = $element[0];
}]);