'use strict';

angular.module('mud')
.controller('MainCtrl', ['$scope', 'Datangular', '$rootScope', function ($scope, Datangular, $rootScope) {
	var d3 = window.d3;
	var _ = window._;
	var me = this;
	var dFormat = d3.time.format('%m/%d/%Y %H:%M');
	var dateFormat = d3.time.format('%m/%d/%Y');
	var numberFormat = d3.format(".2f");

	var ctr = dc.dataCount('#data-count');
	var tbl = dc.dataTable('#data-table');
	var pBar = dc.rowChart('#proj-list');

	$scope.tcounter = 0;
	
	Datangular.allProjects().then(function(d) {
		me.data = d;
		$rootScope.doneLoading = true;
		var dimDate = me.data.xData.dimension(function(d) {return d.openedDate;});

		pBar
			.width(350)
			.height(180)
			.margins({top: 20, left: 10, right: 10, bottom: 20})
			.group(me.data.dimProj.group())
			.dimension(me.data.dimProj)
			.colors(['#ab47bc', '#42a5f5', '#ff7043', '#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
			.label(function (d) {
				return d.key;
			})
			.title(function (d) {
				return d.value;
			})
			.elasticX(true)
			.xAxis()
			.ticks(4);
		pBar.render();

		ctr
			.dimension(me.data.xData)
			.group(me.data.xData.groupAll());
		ctr.render();
		
		tbl
			.dimension(dimDate)
			.group(function(d) {
				return d.openedDate.getFullYear() + ' - ' + d.projectName;
			})
			.size(10)
			.columns([
				function(d) {
					return d.projectName;
				},
				function(d) {
					return d.taskType;
				},
				function(d) {
					return d.openedDate.yyyymmdd();
				},
				function(d) {
					return d.count;
				}
			]);
		tbl.render();

		$scope.tcounter = dimDate.group().all();
	});
	me.tcounter = $scope.tcounter;

	Datangular.projectList().then(function(d) {
		$scope.proj = d;
	});
}])
.directive('dcChart', [function(){
	// Runs during compile
	return {
		// name: '',
		// priority: 1,
		// terminal: true,
		scope: {}, // {} = isolate, true = child, false/undefined = no change
		// controller: function($scope, $element, $attrs, $transclude) {},
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		restrict: 'C', // E = Element, A = Attribute, C = Class, M = Comment
		// template: '',
		// templateUrl: '',
		// replace: true,
		// transclude: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		link: function($scope, iElm, iAttrs, controller) {
			iElm.on('click', function(e) {
				console.log(_.sumBy($scope.$parent.tcounter, function(v) {
						return v.value;
					}));
			});
		}
		/*
		compile: function(tElement, tAttrs) {
			console.log(tElement);
			var clonedElem = angular.element(tElement).clone();
			var sublink = $compile( clonedElem, null, 1010 );
			return function postLink($scope, iElm, iAttrs) {
				console.log($scope);
			};
		}
		*/
	};
}]);