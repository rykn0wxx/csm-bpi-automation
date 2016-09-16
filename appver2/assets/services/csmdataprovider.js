'use strict';

angular.module('mud')
.provider('Datangular', [function () {
	var d3 = window.d3;
	var _ = window._;
	var xfilter = window.crossfilter;
	
	var Configurer = {};
	Configurer.init = function(object, config) {
		object.configuration = config;

		config.defaultGroup = {'regionCode':'Global','regionName':'Global','groupName':'','shortName':'Others','deskName':'Others','rowIndex':48};
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

		function headRef() {
			d3.json('assets/datasource/header-mapping.json', function(data) {
				data.headers.forEach(function(d, i) {
					d.rowIndex = i;
					d.id = i;
				});
				return data.headers;
			});
		}

		d3.json('assets/datasource/ref-group.json', function(data) {
			data.groups.forEach(function(d, i) {
				d.rowIndex = i;
				d.id = i;
			});
			config.groups = data.groups;
		});

		
		config.mapHeaders = headRef();
	};

	var globalConfiguration = {};

	Configurer.init(this, globalConfiguration);
	
	this.$get = ['$http', '$q', function($h, $q) {

		function createServiceForConfigurer(config) {

			var service = {};
			var shortMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

			var dFormat = d3.time.format('%m/%d/%Y %H:%M');

			function ticketData() {
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

			return service;
		}

		return createServiceForConfigurer(globalConfiguration);
	}];
}]);