'use strict';

angular.module('mud')
.controller('MainCtrl', ['$scope', 'Datangular', '$rootScope', function ($scope, Datangular, $rootScope) {
	var d3 = window.d3;
	var _ = window._;
	var me = this;

	$scope.$parent.currentNavItem = 'main';
	var dFormat = d3.time.format('%m/%d/%Y %H:%M');
	var dateFormat = d3.time.format('%m/%d/%Y');
	var numberFormat = d3.format(".2f");

	var fChart = dc.compositeChart('#test');
	var oChart = dc.barChart('#test1');

	function isIncResolved(v) {
		return {
			incResolved: (v.resolvedDate.getFullYear() !== 1900 && v.taskType === 'Incident') ? 1 : 0,
			incVolume: (v.taskType === 'Incident') ? 1 : 0,
		};
	}
	function isTaskResolved(v) {
		return {
			taskResolved: (v.resolvedDate.getFullYear() !== 1900 && v.taskType === 'Catalog Task') ? 1 : 0,
			taskVolume: (v.taskType === 'Catalog Task') ? 1 : 0,
		};
	}

	function reduceAddAvg(attr) {
		return function(p,v) {
			++p.count
			p.inc += (v.taskType === 'Incident') ? v[attr]:0;
			p.task += (v.taskType === 'Catalog Task') ? v[attr]:0;
			p.sum += v[attr];
			p.avg = p.sum/p.count;
			return p;
		};
	}
	function reduceRemoveAvg(attr) {
		return function(p,v) {
			--p.count
			p.inc -= (v.taskType === 'Incident') ? v[attr]:0;
			p.task -= (v.taskType === 'Catalog Task') ? v[attr]:0;
			p.sum -= v[attr];
			p.avg = p.sum/p.count;
			return p;
		};
	}
	function reduceInitAvg() {
		return {count:0, inc:0, task:0, sum:0, avg:0};
	}

	Datangular.allProjects().then(function(d) {
		$rootScope.doneLoading = true;
		var nowDate = new Date().yyyymmm();
		var data = d;
		var dimMonths = data.dimension(function(d) {return d.openedDate.startMonth();});
		var dimDesk = data.dimension(function(d) {return [d.group.deskName, d.openedDate.getFullYear() + ' - ' + Datangular.configuration.shortMonths[d.openedDate.getMonth()]];});
		var grpdesk = dimDesk.group().reduce(reduceAddAvg('count'), reduceRemoveAvg('count'), reduceInitAvg).all();
		$scope.deskinfo = _.filter(grpdesk, function(v) {return _.includes(v.key, nowDate);});
		var grpMonthsMove = dimMonths.group().reduceSum(function(d) {return +d.count;});
		var grpMonths = dimMonths.group().reduce(
			function(p, v) {
				var tmpInc = isIncResolved(v);
				p.incVolume += +tmpInc.incVolume;
				p.incResolved += +tmpInc.incResolved;
				p.incResolvedAvg = p.incResolved / p.incVolume;

				var tmpTask = isTaskResolved(v);
				p.taskVolume += +tmpTask.taskVolume;
				p.taskResolved += +tmpTask.taskResolved;
				p.taskResolvedAvg = p.taskResolved / p.taskVolume;

				++p.days;
				p.taskVolAvg = p.taskVolume / p.days;
				p.incVolAvg = p.incVolume / p.days;
				p.totalResolved += p.taskResolved + p.incResolved;
				p.resolveAvg = p.totalResolved / p.days;
				return p;
			}, function(p, v) {
				var tmpInc = isIncResolved(v);
				p.incVolume -= +tmpInc.incVolume;
				p.incResolved -= +tmpInc.incResolved;
				p.incResolvedAvg = p.incResolved / p.incVolume;

				var tmpTask = isTaskResolved(v);
				p.taskVolume -= +tmpTask.taskVolume;
				p.taskResolved -= +tmpTask.taskResolved;
				p.taskResolvedAvg = p.taskResolved / p.taskVolume;

				--p.days;
				p.taskVolAvg = p.taskVolume / p.days;
				p.incVolAvg = p.incVolume / p.days;
				p.totalResolved -= p.taskResolved + p.incResolved;
				p.resolveAvg = p.totalResolved / p.days;
				return p;
			}, function() {
				return {
					incVolume:0, incResolved:0, incResolvedAvg:0, taskVolume:0, taskResolved:0, taskResolvedAvg:0,
					days:0, taskVolAvg:0, incVolAvg:0, totalResolved:0, resolveAvg:0
				};
		});

		fChart
			.width(800)
			.height(280)
			.transitionDuration(1000)
			.margins({top: 40, right: 50, bottom: 50, left: 60})
			.dimension(dimMonths)
			//.group(grpMonths, "Incident")
			//.valueAccessor(function(d) {return d.value.taskVolume;})
			//.stack(grpMonths, "Task", function(d){return d.value.incVolume;})
			.x(d3.time.scale().domain([new Date(2014, 10, 1), new Date(2016, 8, 31)]))
			.round(d3.time.month.round)
			.xUnits(d3.time.months)
			.renderHorizontalGridLines(true)
			//.centerBar(true)
			.elasticY(true)
			.brushOn(false)
			.legend(dc.legend().x(650).y(10))
			.mouseZoomable(true)
			.rangeChart(oChart)
			.compose([
				dc.lineChart(fChart)
					.group(grpMonths, "Monthly Index Average")
					.valueAccessor(function(d) {return d.value.taskVolume;})
					.renderArea(true)
					.stack(grpMonths, "Task", function(d){return d.value.incVolume;})
					.title(function(d){
						return d.data.key.yyyymmdd()	
							+ "\nIncident Tickets Avg Volume: " + Math.round(d.data.value.taskVolume)
							+ "\nTask Tickets Avg Volume: " + Math.round(d.data.value.incVolume);
					})
			])
			.xAxis();

		oChart
			.width(800)
			.height(200)
			.margins({top: 0, right: 50, bottom: 20, left: 40})
			.dimension(dimMonths)
			.group(grpMonthsMove)
			.centerBar(true)
			.gap(1)
			.x(d3.time.scale().domain([new Date(2014, 10, 1), new Date(2016, 8, 31)]))
			.round(d3.time.month.round)
			.xUnits(d3.time.months);

		fChart.render();
		oChart.render();
	});

}]);
/*
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
		
		compile: function(tElement, tAttrs) {
			console.log(tElement);
			var clonedElem = angular.element(tElement).clone();
			var sublink = $compile( clonedElem, null, 1010 );
			return function postLink($scope, iElm, iAttrs) {
				console.log($scope);
			};
		}
		
//	};
//}])
*/
