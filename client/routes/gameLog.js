var express = require('express');
var router = express.Router();

router.post('/add', function(req, res) {
    var db = req.db;
    req.body.at = new Date();
    db.collection('gameLogs').insert(req.body, function(err, items) {
        res.send(
            (err === null) ? { items: items } : { msg: err }
            );
    })
});

module.exports = router;