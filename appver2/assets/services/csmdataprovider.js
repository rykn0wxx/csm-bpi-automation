'use strict';

angular.module('mud')
.provider('Datangular', [function () {
	var d3 = window.d3;
	var _ = window._;
	var xfilter = window.crossfilter;
	
	var Configurer = {};
	Configurer.init = function(object, config) {
		object.configuration = config;

		config.data = {};
		config.shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		config.defaultGroup = {'regionCode':'Global','regionName':'Global','groupName':'','shortName':'Others','deskName':'Others','rowIndex':48};
		config.defaultLocation = {"prefix":"Others","regionName":"Others","regionCode":"Others"};
		config.datatypes = [function(arg) {
				return (!_.isNaN(_.toNumber(arg))) ? +arg : null;
			},
			function (arg) {
				var tdate = Date.parse(arg);
				return ('Invalid Date' === tdate || null === tdate || isNaN(tdate) || arg.length < 5) ? null : new Date(arg);
			}, 
			function (arg) {
				return ((_.isString(arg)) && (arg.indexOf('<') !== -1) && (arg.indexOf('>') !== -1)) ? 'invalid html' : arg;
			}
		];

		/* need to think if we still need this
		d3.json('assets/datasource/header-mapping.json', function(data) {
			data.headers.forEach(function(d, i) {
				d.rowIndex = i;
				d.id = i;
			});
			config.headers = data.headers;
		});
		*/

		d3.json('assets/datasource/ref-group.json', function(data) {
			data.groups.forEach(function(d, i) {
				d.rowIndex = i;
				d.id = i;
			});
			config.groups = data.groups;
		});

		d3.json('assets/datasource/ref-location.json', function(data) {
			data.locations.forEach(function(d, i) {
				d.rowIndex = i;
				d.id = i;
			});
			config.locations = data.locations;
		});

	};

	var globalConfiguration = {};

	Configurer.init(this, globalConfiguration);
	
	this.$get = ['$http', '$q', function($h, $q) {

		function createServiceForConfigurer(config) {

			var service = {};
			var shortMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			var dFormat = d3.time.format('%m/%d/%Y %H:%M');

			function detectType(arg) {
				for (var t = config.datatypes, a = t.length, n = 0; a > n; n++) {
					var o = t[n](arg);
					if (null !== o) {
						return o;
					}
				}
			}

			function typing(d) {
				// var out = {};
				// _.forEach(d, function(val, key){
					// var aa = _.filter(Configurer.headers, key);
					// if (_.isEmpty(aa)) {
						// out[key] = detectType(val);
					// } else {
						// out[aa[0][key].name] = detectType((!d[aa[0][key].field])? d[key][aa[0][key].field]:d[aa[0][key].field]);
					// }
					// out.group = _.filter(Configurer.groups, function(v, k) {return _.includes(v,out.assignedGroup);});
					// //d[key] = detectType(val);
				// });
				return out;
			}



			function getProjectData(fileName) {
				if (!fileName) {
					return;
				}
				var defer = $q.defer();
				d3.csv(fileName, function(data) {
					var results = [];
					_.forEach(data, function(d,i) {
						d = typing(d);
						d.index = i
						d.count = 1;
						results.push(d);
					});
					defer.resolve(results);
				});
				return defer.promise;
			}

			var dFormat = d3.time.format('%m/%d/%Y %H:%M:%S');

			function typeFunc(d, k) {
				var tmpGrp = config.defaultGroup;
				d.count = 1;
				d.id = k;
				d.projectName = d.projectName;
				d.contactType = d.contactType;
				d.taskType = d.taskType;
				d.openedDate = dFormat.parse(d.openedDate);
				d.resolvedDate = dFormat.parse(d.resolvedDate);
				d.group = _.filter(config.groups, function(val, i) { return _.includes(val, d.assignedGroup);})[0] || _.set(tmpGrp, 'groupName', d.assignedGroup);
				d.location = _.filter(config.locations, function(val, i) { return _.includes(val, d.locationName.substring(0,3));})[0] || config.defaultLocation;
				return d;
			}

			function ticketData(projFilter) {
				var defer = $q.defer();
				d3.csv('assets/datasource/testTickets.csv',
					function(d) {
						return ((d.projectName === projFilter) && (!_.isUndefined(projFilter))) ? d : null;
					}, 
					function(data) {
						var result = _.map(data, function(val, key) {
							return typeFunc(val, key);
						});
						config.data['ticketData'] = result;
						defer.resolve(xfilter(result));
				});
				return defer.promise;
			}

			function allProjects() {
				var defer = $q.defer();
				d3.csv('assets/datasource/testTickets.csv', function(d) {
					d.count = 1;
					d.openedDate = dFormat.parse(d.openedDate);
					d.resolvedDate = dFormat.parse(d.resolvedDate);
					return d;
				}, function(data) {
					var tmp = {};
					tmp.xData = xfilter(data);
					tmp.dimProj = tmp.xData.dimension(function(d) {return d.projectName;});
					tmp.dimMonth = tmp.xData.dimension(function(d) {return shortMonth[d3.time.year(d.openedDate).getMonth()] + '-' +d3.time.year(d.openedDate).getFullYear();});
					tmp.grpMonthOpn = tmp.dimMonth.group().reduceSum(function(d) {return parseInt(d.count);});
					tmp.grpMonthCls = tmp.dimMonth.group().reduceSum(function(d) {return (d3.time.year(d.resolvedDate).getFullYear() === 1900) ? parseInt(d.count):0;});
					
					tmp.grpProj = tmp.dimProj.group().reduce(
						function(p, v) {
							++p.count;
							p.openVol += parseInt(v.count);
							p.closeVol += (d3.time.year(v.resolvedDate).getFullYear() !== 1900) ? parseInt(v.count):0;
							p.latestMonth = d3.min(function(d) {return d.openedDate.getMonth();});
							return p;
						}, function(p, v) {
							--p.count;
							p.openVol += parseInt(v.count);
							p.closeVol += (d3.time.year(v.resolvedDate).getFullYear() !== 1900) ? parseInt(v.count):0;
							p.latestMonth = d3.min(function(d) {return d.openedDate.getMonth();});
							return p;
						}, function() {
							return {count: 0, openVol: 0, closeVol: 0, latestMonth: 0};
						});
					
					defer.resolve(tmp);
				});
				return defer.promise;
			}

			function projectList() {
				var defer = $q.defer();
				d3.csv('assets/datasource/testTickets.csv', function(data) {
					var nest = d3.nest()
						.key(function(d) {return d.projectName;})
						.key(function(d) {return shortMonth[dFormat.parse(d.openedDate).getMonth()];})
						.entries(data);
					defer.resolve(_.map(nest, function(val, key) {
						return {
							'name': val.key,
							'data': _.map(val.values, function(d, i) {
								return {
									'sub': d.key,
									'data': d.values.length
								}
								//return [d.key, d.values.length];
							})
						};
					}));
				});
				return defer.promise;
			}

			function ticketData2() {
				var defer = $q.defer();
				d3.json('assets/datasource/tickets.json', function(data) {
					data.forEach(function(d, i) {
						d.rowIndex = i;
						d.id = i;
						d.count = parseInt(1);
						d.openedDate = dFormat.parse(d.openedDate);
						d.resolvedDate = dFormat.parse(d.resolvedDate);
						d.resolvedFlag = (d.resolvedDate === null)? parseInt(0):parseInt(1);
						var grp = _.filter(config.groups, function(v, k) {return _.includes(v,d.assignedGroup);})[0];
						d.group = grp || _.set(config.defaultGroup, 'groupName', d.assignedGroup);
					});
					defer.resolve(xfilter(data));
				});
				return defer.promise;
			}


			Configurer.init(service, config);

			service.getProjectData = _.bind(getProjectData, service);
			service.ticketData = _.bind(ticketData, service);
			service.allProjects = _.bind(allProjects, service);
			service.projectList = _.bind(projectList, service);

			return service;
		}

		return createServiceForConfigurer(globalConfiguration);
	}];
}]);