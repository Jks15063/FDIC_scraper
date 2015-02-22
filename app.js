var util        = require('util');
var debug       = require('debug')('app');
var _           = require('lodash');
//var async     = require('async');
var MongoClient = require('mongodb').MongoClient;
var $           = require('cheerio');
var request     = require("request");
request         = request.defaults({ jar: true });
var j           = request.jar();

var inspect = _.partialRight(util.inspect, false, null)

var url = 'mongodb://localhost:27017/mydb';

MongoClient.connect(url, function(err, db) {
    if(err) {
        debug(err);
    } else {
        var collection = db.collection('FDIC');
        var getUrl = 'https://www2.fdic.gov/sod/sodSummary.asp?barItem=3';
        request.get({ url: getUrl, jar: j }, function(err, res) {
            if(err) {
                debug('err:', err);
            } else {
                $ = $.load(res.body.toString());
                var sfid = $("input[name='as_sfid']")['0'].attribs.value;
                var fid = $("input[name='as_fid']")['0'].attribs.value;
                var formData = {
                    sInfoAsOf: "2014",
                    barItem: 3,
                    sSummaryList: 8,
                    as_sfid: sfid,
                    as_fid: fid
                };
                debug('formData:', formData)
                debug('cookies:', j.getCookies(getUrl))
                var postUrl = 'https://www2.fdic.gov/sod/SODSummary2.asp';
                //var postUrl = 'https://www2.fdic.gov/sod/SODSumReport.asp';
                request.post({ url: postUrl, formData: formData, jar: j }, function(err, res2) {
                    if(err) {
                        debug('res2:', err);
                    } else {
                        debug('--->', inspect(res2.body));
                        db.close()
                    }
                });
            }
        });
    }
});
