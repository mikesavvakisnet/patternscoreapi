var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var mysql = require('mysql');

var mysqlHost = process.env.MYSQLHOST;
var mysqlUser = process.env.MYSQLUSER;
var mysqlPassword = process.env.MYSQLPASSWORD;
var mysqlDatabase = process.env.MYSQLDATABASE;

var username = process.env.USERNAME;
var password = process.env.PASSWORD;

var secretJWT = process.env.SECRETJWT;

var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : mysqlHost,
    user            : mysqlUser,
    password        : mysqlPassword,
    database        : mysqlDatabase
});

/* GET home page. */
router.get('/', function (req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token)
        return res.status(401).send({auth: false, message: 'No token provided.'});
    jwt.verify(token, secretJWT, function (err, decoded) {
        if (err)
            return res.status(500).send({auth: false, message: 'Failed to authenticate token.'});
        pool.query('SELECT * FROM pattern', function (error, results, fields) {
            if (error) throw error;
            res.status(200).send(JSON.stringify(results));
            return;
        });
    });
});

router.post('/', function (req, res, next) {
    var pattern = req.body.pattern;
    console.log(pattern);
    if(!pattern){
        res.status(400).send({problem: true});
        return
    }

    pool.query('INSERT INTO pattern (pattern) VALUES(?)',pattern, function (error, results, fields) {
        if (error) throw error;
        res.status(200).send({problem: false});
        return;
    });

});

router.post('/auth', function (req, res, next) {
    var user = req.body.user;
    var pass = req.body.pass;
    if (user === username && pass === password) {
        var token = jwt.sign({}, secretJWT, {
            expiresIn: 86400 // expires in 24 hours
        });
        res.status(200).send({auth: true, token: token});
        return;
    }
    res.status(400).send({auth: false});
});

module.exports = router;
