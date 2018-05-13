var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var request = require('request');

var mysqlHost = process.env.MYSQLHOST;
var mysqlUser = process.env.MYSQLUSER;
var mysqlPassword = process.env.MYSQLPASSWORD;
var mysqlDatabase = process.env.MYSQLDATABASE;

var username = process.env.USERNAME;
var password = process.env.PASSWORD;

var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : mysqlHost,
    user            : mysqlUser,
    password        : mysqlPassword,
    database        : mysqlDatabase
});

/* GET home page. */
router.get('/', function (req, res, next) {
    var auth = "Basic " + new Buffer(username + ":" + password).toString("base64");
    request({
        url:'http://icsd.dermanis.info:8066/api/rest/process/patternScore?',
        headers : {
            "Authorization" : auth
        },
        json:true

    }, function (error, response, body) {

        res.status(200).send({problem: false, body: body});
    });
});

router.post('/', function (req, res, next) {
    var pattern = req.body.pattern;
    console.log(pattern);
    if(!pattern){
        res.status(400).send({problem: true});
        return
    }
    pattern = pattern.split("");
    for(var i=pattern.length; i<9;i++){
        pattern.push("?");
    }
    pool.query('DELETE FROM UserPattern;', function (error, results, fields) {
        pool.query('INSERT INTO UserPattern (score,`1`,`2`,`3`,`4`,`5`,`6`,`7`,`8`,`9`) VALUES(?,?)',["?", pattern], function (error, results, fields) {
            if (error) throw error;
            res.status(200).send({problem: false});
        });
    });

});

module.exports = router;
