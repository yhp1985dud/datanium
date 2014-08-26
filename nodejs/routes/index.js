var mongodb = require('../data/mongodb');
var analysis = require('../data/analysis');
var analysisSchema = analysis.Analysis;

exports.index = function(req, res) {
	// mock session
	req.session.user = {
		email : "nicepuffy@gmail.com"
	};
	var hashid = req.url.substr(1);
	if (hashid === '') {
		res.render('index', {
			hasHashKey : false,
			userEmail : req.session.user ? req.session.user.email : null
		});
		return;
	}
	analysisSchema.findOne({
		hashid : hashid
	}, function(err, doc) {
		if (err)
			throw err;
		if (doc === null) {
			res.send('404 Sorry, no such page...');
		} else {
			if (doc.qubeInfo == null)
				doc.qubeInfo = {
					dimensions : [],
					measures : []
				};
			if (doc.queryParam.filters == null)
				doc.queryParam.filters = {};
			res.render('index', {
				hasHashKey : true,
				hashid : doc.hashid,
				qubeInfo : JSON.stringify(doc.qubeInfo),
				queryParam : JSON.stringify(doc.queryParam),
				rptMode : doc.rptMode,
				chartMode : doc.chartMode,
				userEmail : req.session.user ? req.session.user.email : null
			});
		}
	});
};

exports.helloworld = function(req, res) {
	res.send('Hello, World!');
};