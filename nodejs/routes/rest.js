var data = require('../data/sampleData');
var mongodb = require('../data/mongodb');
var indicator = require('../data/indicator');
var dataset = require('../data/dataset');
var async = require('../lib/async');
var IndicatorSchema = indicator.Indicator;
var datasetSchema = dataset.Dataset;

exports.cubeList = function(req, res) {
	res.send(data.cubeListJSON);
};

exports.cubeInfo = function(req, res) {
	res.send(data.cubeInfoJSON);
};

exports.querySplit = function(req, res) {
	var resultJSON = {
		"grid" : {
			"total" : 0,
			"result" : []
		},
		"chart" : {
			"result" : []
		}
	};
	var queryParam = req.body;
	var matchObj = generateMatchObj(queryParam, false);
	// for grid
	var group = generateGroupObj(queryParam);
	var groupObj = group.returnObj;
	var groupObjProject = group.returnProject;
	var sortStr = group.returnSort;
	// for chart
	var groupSplitJSON4Chart = generateGroupSplitObj(queryParam);
	var groupObj4Chart = groupSplitJSON4Chart.returnObj;
	var groupObj4ChartProject = groupSplitJSON4Chart.returnProject;
	var sortStr4Chart = groupSplitJSON4Chart.returnSort;
	// to get all the query results and return
	async.parallel([
			function(callback) {
				// query for grid
				datasetSchema.aggregate().match(matchObj).group(groupObj).project(groupObjProject).sort(sortStr).limit(
						500).exec(function(err, doc) {
					if (err)
						throw err;
					resultJSON.grid.result = doc;
					resultJSON.grid.total = doc.length;
					callback();
				});
			},
			function(callback) {
				// query for chart
				datasetSchema.aggregate().match(matchObj).group(groupObj4Chart).project(groupObj4ChartProject).sort(
						sortStr4Chart).limit(500).exec(function(err, doc) {
					if (err)
						throw err;
					// console.log(doc);
					resultJSON.chart.result = doc;
					callback();
				});
			} ], function() {
		res.send(resultJSON);
	});
};

function generateGroupSplitObj(queryParam) {
	var returnJSON = {};
	var dimensions = queryParam.dimensions;
	var measures = queryParam.measures;
	var primaryDimension = queryParam.primaryDimension;
	var split = queryParam.split;
	var breakException = {};
	var idStr = "_id:{";
	var projectStr = "{";
	var sortStr = "field " + primaryDimension;
	try {
		dimensions.forEach(function(item, index) {
			if (item.uniqueName == queryParam.primaryDimension) {
				projectStr += item.uniqueName;
				projectStr += ":\"$_id." + item.uniqueName + "\",";
				idStr += item.uniqueName;
				idStr += ":\"$";
				idStr += item.uniqueName;
				idStr += "\"";
				throw breakException;
			}
		});
	} catch (e) {
		if (e !== breakException)
			console.log(e);
	}
	idStr += "},"
	var indicatorStr = "";
	var splitValue = split.splitValue;
	// var sortStr = "";
	measures.forEach(function(item) {
		splitValue.forEach(function(value) {
			// convert split value string
			var cvtVal = convertSplitValue(value);
			if (indicatorStr != '') {
				indicatorStr += ","
			}
			var splitIndicator = "";
			splitIndicator += item.uniqueName;
			splitIndicator += "_";
			splitIndicator += cvtVal;
			// if (index == 0 && sortStr == '') {
			// sortStr = "{" + splitIndicator + ": 1}";
			// }
			projectStr += splitIndicator
			projectStr += ":1,";
			indicatorStr += splitIndicator;
			indicatorStr += ":{";
			if (item.data_type == 'number') {
				indicatorStr += "$sum:{$cond:[{$eq:[";
			} else if (item.data_type == 'percentage') {
				indicatorStr += "$avg:{$cond:[{$eq:[";
			} else {
				return "";
			}
			indicatorStr += "\"$";
			indicatorStr += split.dimensions;
			indicatorStr += "\",";
			indicatorStr += "\"";
			indicatorStr += value;
			indicatorStr += "\"]},";
			indicatorStr += "\"$";
			indicatorStr += item.uniqueName;
			indicatorStr += "\",0]}}";
		});
	});
	var res = "{" + idStr + indicatorStr + "}";
	console.log('result string:' + res);
	var returnObj = eval("(" + res + ")");
	projectStr += "_id:0}";
	var projectObj = eval("(" + projectStr + ")");
	returnJSON = {
		"returnObj" : returnObj,
		"returnProject" : projectObj,
		"returnSort" : sortStr
	}
	return returnJSON;
}

exports.queryResult = function(req, res) {
	var queryParam = req.body;
	var resultJSON = {
		"grid" : {
			"total" : 0,
			"result" : []
		},
		"chart" : {
			"result" : []
		}
	};
	var matchObj = generateMatchObj(queryParam);
	// for grid
	var group = generateGroupObj(queryParam, false);
	var groupObj = group.returnObj;
	var groupObjProject = group.returnProject;
	var sortStr = group.returnSort;
	// for chart
	var chartGroup = generateGroupObj(queryParam, true);
	var groupObj4Chart = chartGroup.returnObj;

	// to get all the query results and return
	async.parallel([
			function(callback) {
				// query for grid
				datasetSchema.aggregate().match(matchObj).group(groupObj).project(groupObjProject).sort(sortStr).limit(
						500).exec(function(err, doc) {
					if (err)
						console.log('Exception: ' + err);
					resultJSON.grid.result = convertResult(doc, false);
					resultJSON.grid.total = doc.length;
					callback();
				});
			},
			function(callback) {
				// query for chart
				datasetSchema.aggregate().match(matchObj).group(groupObj4Chart).project(groupObjProject).sort(sortStr)
						.limit(500).exec(function(err, doc) {
							if (err)
								console.log('Exception: ' + err);
							resultJSON.chart.result = convertResult(doc, true);
							callback();
						});
			} ], function() {
		res.send(resultJSON);
	});
};

function generateGroupObj(queryParam, isChart) {
	var dimensions = queryParam.dimensions;
	var measures = queryParam.measures;
	var breakException = {};
	var idStr = "_id:{";
	var projectStr = "{";
	try {
		dimensions.forEach(function(item, index) {
			if (isChart) {
				if (item.uniqueName == queryParam.primaryDimension) {
					idStr += item.uniqueName;
					idStr += ":\"$";
					idStr += item.uniqueName;
					idStr += "\"";
					projectStr += item.uniqueName;
					projectStr += ":\"$_id." + item.uniqueName + "\",";
					throw breakException;
				}
			} else {
				idStr += item.uniqueName;
				idStr += ":\"$";
				idStr += item.uniqueName;
				idStr += "\"";
				if (index < dimensions.length - 1) {
					idStr += ","
				}
				projectStr += item.uniqueName;
				projectStr += ":\"$_id." + item.uniqueName + "\",";
			}
		});
	} catch (e) {
		if (e !== breakException)
			throw e;
	}
	idStr += "},"
	var indicatorStr = "";
	measures.forEach(function(item, index) {
		indicatorStr += item.uniqueName;
		indicatorStr += ":{";
		projectStr += item.uniqueName
		projectStr += ":1,";
		if (item.data_type == 'number') {
			indicatorStr += "$sum:";
		} else if (item.data_type == 'percentage') {
			indicatorStr += "$avg:";
		} else {
			return "";
		}
		indicatorStr += "\"$";
		indicatorStr += item.uniqueName;
		indicatorStr += "\"";
		indicatorStr += "}"
		if (index < measures.length - 1) {
			indicatorStr += ","
		}
	});
	var res = "{" + idStr + indicatorStr + "}";
	var returnObj = eval("(" + res + ")");
	projectStr += "_id:0}";
	console.log(projectStr);
	var projectObj = eval("(" + projectStr + ")");
	returnJSON = {
		"returnObj" : returnObj,
		"returnProject" : projectObj,
		"returnSort" : generateSortStr(measures)
	}
	return returnJSON;
}

function generateMatchObj(queryParam) {
	var dimensions = queryParam.dimensions;
	var filters = queryParam.filters;
	var filterArray = [];
	dimensions.forEach(function(item, index) {
		if (item.uniqueName in filters) {
			var array = eval('filters.' + item.uniqueName);
			var str = '';
			if (item.uniqueName == 'year') {
				str = array.join(",");
			} else {
				str = "'" + array.join("','") + "'";
			}
			filterArray.push(item.uniqueName + ': {$in:[' + str + ']}');
		}
	});
	var matchStr = '{ ' + filterArray.join(",") + ' }';
	console.log(matchStr);
	var returnObj = eval("(" + matchStr + ")");
	return returnObj;
}

function generateSortStr(measures) {
	var sortStr = 'field -';
	if (measures != null && measures.length > 0) {
		sortStr += measures[0].uniqueName;
		return sortStr;
	} else {
		return null;
	}
}

function convertResult(doc, isChart) {
	var results = doc;
	// doc.forEach(function(item) {
	// var gstr = JSON.stringify(item._id);
	// gstr = gstr.substring(1, gstr.length - 1);
	// delete item._id;
	// var mstr = JSON.stringify(item);
	// mstr = mstr.substring(1, mstr.length - 1);
	// var recordStr = '{' + gstr + ',' + mstr + '}';
	// var recordObj = eval("(" + recordStr + ")");
	// results.push(recordObj);
	// });
	// sort result by year for charts
	if (isChart) {
		if (results.length > 0 && 'year' in results[0])
			bubbleSort(results, 'year');
	}
	return results;
}

function bubbleSort(a, par) {
	var swapped;
	do {
		swapped = false;
		for ( var i = 0; i < a.length - 1; i++) {
			if (a[i][par] > a[i + 1][par]) {
				var temp = a[i];
				a[i] = a[i + 1];
				a[i + 1] = temp;
				swapped = true;
			}
		}
	} while (swapped);
}

function convertSplitValue(str) {
	var returnStr = str.trim().replace(/ |-|&/g, '');
	return returnStr;
}

exports.indicatorMapping = function(req, res) {
	var indicatorMappingJSON = {};
	var query = require('url').parse(req.url, true).query;
	var idc = query.idc;
	var dimensions = [];
	var measures = [];
	IndicatorSchema.find({
		indicator_key : idc
	}, function(err, doc) {
		if (err)
			console.log('Exception: ' + err);
		doc.forEach(function(item, index) {
			var tempDimensions = item.dimension;
			tempDimensions.forEach(function(dimension, index) {
				var tempDimension = {
					"uniqueName" : dimension.dimension_key,
					"name" : dimension.dimension_key,
					"text" : dimension.dimension_text
				};
				dimensions.push(tempDimension);
			});
			var tempMesureJson = {
				"uniqueName" : item.indicator_key,
				"name" : item.indicator_key,
				"text" : item.indicator_text,
				"data_source" : item.data_source,
				"data_type" : item.data_type
			};
			measures.push(tempMesureJson);
		});
		indicatorMappingJSON = {
			"dimensions" : dimensions,
			"measures" : measures
		};
		res.send(indicatorMappingJSON);
	});
}

exports.indicatorSearch = function(req, res) {
	var query = require('url').parse(req.url, true).query;
	var indicatorResultJSON = {};
	if (query.query != null) {
		var key = query.query.toLowerCase();
		var results = [];
		IndicatorSchema.find({
			indicator_text : {
				$regex : key,
				$options : 'i'
			}
		}, function(err, doc) {
			if (err)
				console.log('Exception: ' + err);
			doc.forEach(function(item, index) {
				var tempJson = {
					"uniqueName" : item.indicator_key,
					"text" : item.indicator_text + ' - ' + item.data_source
				};
				results.push(tempJson);
			});
			indicatorResultJSON = {
				"indicators" : results
			};
			res.send(indicatorResultJSON);
		});
	} else {
		indicatorResultJSON = {
			"indicators" : []
		};
		res.send(indicatorResultJSON);
	}
};

exports.dimensionValueSearch = function(req, res) {
	var query = require('url').parse(req.url, true).query;
	var dimensionValueResultJSON = {};
	if (query.dim != null) {
		var key = query.dim.toLowerCase();
		var results = [];
		// exclude blank record
		var matchStr = '{ ' + key + ' : { $ne : \'\' } }';
		var matchObj = eval("(" + matchStr + ")");
		datasetSchema.distinct(key, matchObj, function(err, doc) {
			if (err)
				console.log('Exception: ' + err);
			doc.forEach(function(item, index) {
				var tempJson = {
					"name" : item
				};
				results.push(tempJson);
			});
			dimensionValueResultJSON = {
				"dimensionValues" : results
			};
			res.send(dimensionValueResultJSON);
		});
	} else {
		dimensionValueResultJSON = {
			"dimensionValues" : []
		};
		res.send(dimensionValueResultJSON);
	}
}