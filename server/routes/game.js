var express = require('express');
var router = express.Router();
var ObjectID = require('mongoskin').ObjectID

router.get('/:id', function(req, res) {
    var db = req.db;
    var query = {"slug": req.params.id};
    if (req.params.id.length == 24)
        query = { "_id": new ObjectID(req.params.id) };
    db.collection('games').findOne(query, function(err, item) {
        res.send(item);
    })
});

router.post('/add', function(req, res) {
    var db = req.db;
    req.body.at = new Date();
    req.body.slug = Math.random().toString(36).replace(/[^a-z]+/g, '');
    db.collection('games').insert(req.body, function(err, items) {
        res.send(
            (err === null) ? items[0] : { msg: err }
            );
    })
});

module.exports = router;