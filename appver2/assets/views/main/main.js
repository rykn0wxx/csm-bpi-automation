'use strict';

angular.module('mud')
.controller('MainCtrl', ['$scope', 'Datangular', '$rootScope', function ($scope, Datangular, $rootScope) {
	var d3 = window.d3;
	var me = this;
	var dFormat = d3.time.format('%m/%d/%Y %H:%M');
	var dateFormat = d3.time.format('%m/%d/%Y');
	var numberFormat = d3.format(".2f");

	var moveChart = dc.compositeChart('#monthly-move-chart');
	var volumeChart = dc.barChart('#monthly-volume-chart');
	var pieCharty = dc.pieChart('#piechattty');
	 
	Datangular.ticketData().then(function(d) {
		me.data = d;
		$rootScope.doneLoading = true;

		me.dimDesk = d.dimension(function(d) {return d.group.deskName;});
		me.deskOpenTicket = me.dimDesk.group().reduceSum(function(d) { return parseInt(d.count);});
		me.deskCloseTicket = me.dimDesk.group().reduceSum(function(d) { return parseInt(d.resolvedFlag);});
		
		me.dimOpenMonth = d.dimension(function(d) {return d3.time.month(d.openedDate);});
		me.dimResolveMonth = d.dimension(function(d) {return (d.resolvedDate === null)? null:d3.time.month(d.resolvedDate);});

		me.openedMonthly = me.dimOpenMonth.group().reduceSum(function(d) { return parseInt(d.count);});
		me.resolvedMonthly = me.dimResolveMonth.group().reduceSum(function(d) { return parseInt(d.resolvedFlag);});

		var monthlyMove = me.dimOpenMonth.group().reduceSum(function(d) {
			return Math.abs(parseInt(d.count) - parseInt(d.resolvedFlag));
		});

		var monthlyVolume = me.dimOpenMonth.group().reduceSum(function(d) {
			return parseInt(d.count);
		});

		var indexAvg = me.dimOpenMonth.group().reduce(
			function(p,v) {
				++p.days;
				p.total += (parseInt(v.count) + (parseInt(v.count) - parseInt(v.resolvedFlag))) / 2;
				p.avg = Math.round(p.total / p.days);
				return p;
			},
			function(p,v) {
				--p.days;
				p.total -= (parseInt(v.count) + (parseInt(v.count) - parseInt(v.resolvedFlag))) / 2;
				p.avg = (p.days === 0) ? 0 : Math.round(p.total / p.days);
				return p;
			},
			function() {
				return {days: 0, total: 0, avg: 0};
			}
		);

pieCharty
    .width(350)
    .height(350)
    .slicesCap(4)
    .dimension(me.dimDesk)
    .group(me.deskOpenTicket);




moveChart.width(990)
	.height(200)
	.transitionDuration(1000)
	.margins({top: 30, right: 50, bottom: 25, left: 40})
	.dimension(me.dimOpenMonth)
	.mouseZoomable(true)
	.x(d3.time.scale().domain([new Date(2014, 0, 1), new Date(2016, 11, 31)]))
	.round(d3.time.month.round)
	.xUnits(d3.time.months)
	.elasticY(true)
	.renderHorizontalGridLines(true)
	.legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
	.brushOn(false)
	.rangeChart(volumeChart)
	.compose([
		dc.lineChart(moveChart)
			.group(indexAvg, "Monthly Index Average")
			.valueAccessor(function (d) {
					return d.value.avg;
			})
			.renderArea(true)
			.stack(monthlyMove, "Monthly Index Move", function (d) {
					return d.value;
			})
			.title(function (d) {
					var value = d.data.value.avg ? d.data.value.avg : d.data.value;
					if (isNaN(value)) value = 0;
					return dateFormat(d.data.key) + "\n" + numberFormat(value);
			})
	])
	.xAxis();

volumeChart.width(990)
	.height(100)
	.margins({top: 0, right: 50, bottom: 20, left: 40})
	.dimension(me.dimOpenMonth)
	.group(monthlyVolume)
	.centerBar(true)
	.gap(1)
	.x(d3.time.scale().domain([new Date(2014, 0, 1), new Date(2016, 11, 31)]))
	.round(d3.time.month.round)
	.xUnits(d3.time.months);





	dc.renderAll();

	});
 
}]);
