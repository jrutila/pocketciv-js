var reducer = require("../core/reducer");
var _ = require('underscore');

function _mergeNgh(ngh, first, a) {
    var to = _.reduce(ngh,
        function(memo, n) {
            return _.union(memo, first[n])
        }, ngh);
    to = _.without(to, parseInt(a));
    return to;
}

var areaNeighbour = function(n) { return typeof n != "string"; };

function _seaUnion(area, sea) {
    return _.filter(_.union(area, sea || []), areaNeighbour);
}

function TribeMover(map, moveLimit, seaCost) {
    this.start = {};
    this.map = _.clone(map);
    this.neighbours = {};
    this.neighbours2 = {};
    this.neighboursSea = {};
    this.neighboursSea2 = {};
    moveLimit = moveLimit ? moveLimit : 1;
    this.moveLimit = moveLimit;
    seaCost = seaCost === undefined ? -1 : seaCost;
    this.seaCost = seaCost;
    
    var seas = _.object(_.map(this.map, function(area, n) {
        var ss = _.filter(area.neighbours, function (e) { return typeof e == "string" && e != 'frontier'; });
        var seangh = [];
        for (var a in this.map)
        {
            if (a != n && _.intersection(this.map[a].neighbours, ss).length > 0)
            {
                seangh.push(parseInt(a));
            }
        }
        return [parseInt(n), seangh];
    }, this));
    
    _.each(this.map, function(area, ak) {
        this.neighbours[ak] = _.filter(area.neighbours, areaNeighbour);
        this.neighboursSea[ak] = _.union(this.neighbours[ak], seas[ak]);
    }, this);
    
    
    var build = [[this.neighbours, this.neighbours2]]
    if (this.seaCost > -1)
        build.push([this.neighboursSea, this.neighboursSea2])
    
    _.each(build, function(b) {
        var first = b[0];
        var second = b[1];
        // First level neighbours with moveLimit
        for (var m = 1; m < moveLimit; m++)
        {
            var nextFirst = {};
            _.each(first, function(ngh, ak) {
                nextFirst[ak] = _mergeNgh(ngh, first, ak);
            });
            _.each(first, function(ngh, ak) {
                first[ak] = nextFirst[ak];
            });
        }
        // Second level neighbours
        _.each(first, function(ngh, ak) {
            second[ak] = _mergeNgh(ngh, first, ak);
        },this)
    },this);
}

function sum(arr) {
    var total = 0;

    for (var i in arr)
    {
        if (arr[i] == undefined) arr[i] = 0;
        total += arr[i];
    }

    return total;
}

TribeMover.prototype = {
    init: function(start) {
        this.start = start;
        this.max = this._nghValue(start, this.neighbours);
        this.maxSea = this._nghValue(start, this.neighboursSea);
        this.ngh2 = this._nghValue(start, this.neighbours2);
        this.ngh2Sea = this._nghValue(start, this.neighboursSea2);
    },
    ok: function(situation) {
        if (this.moveLimit == -1) return { ok: true };
        var ngh = this._nghValue(situation, this.neighbours);
        var nghSea = this._nghValue(situation, this.neighboursSea);
        var byland = [];
        var bysea = [];
        if (sum(this.start) != sum(situation))
            return { ok: false };
        for (var key in situation)
        {
            if ((situation[key] || 0) > this.max[key]) {
                byland.push([key, 1]);
            }
            if ((situation[key] || 0) > this.maxSea[key]) {
                bysea.push([key, 1]);
            }
            if (ngh[key] < this.start[key]) {
                byland.push([key, -1]);
            }
            if (nghSea[key] < this.start[key]) {
                bysea.push([key, -1]);
            }
            if (ngh[key] > this.ngh2[key]) {
                byland.push([key, 0]);
            }
            if (nghSea[key] > this.ngh2Sea[key]) {
                bysea.push([key, 0]);
            }
        }
        /*
        console.log('--COMP--')
        console.log('this.neighbours')
        console.log(this.neighbours)
        console.log('this.neighboursSea')
        console.log(this.neighboursSea)
        console.log('this.neighbours2')
        console.log(this.neighbours2)
        console.log('this.neighboursSea2')
        console.log(this.neighboursSea2)
        console.log('this.max')
        console.log(this.max)
        console.log('this.maxSea')
        console.log(this.maxSea)
        console.log('this.ngh2')
        console.log(this.ngh2)
        console.log('this.ngh2Sea')
        console.log(this.ngh2Sea)
        console.log('this.start')
        console.log(this.start)
        console.log('curr - situation')
        console.log(situation)
        console.log('curr - ngh')
        console.log(ngh)
        console.log('curr - nghSea')
        console.log(nghSea)
        console.log(sum(this.start) + " != " + sum(situation))
        console.log('byland')
        console.log(byland)
        console.log('bysea')
        console.log(bysea)
        console.log('--XOMP--')
        */
        // If sea movement is forbidden, don't allow bysea
        if (this.seaCost == -1) bysea.push(-1);
        
        var valid = {
            ok: byland.length == 0 || bysea.length == 0,
            target: situation,
            initial: this.start,
        };
        
        // If movement is free, don't calculate the cost areas
        if (valid.ok && this.seaCost == 1 && bysea.length == 0 && byland.length != 0)
        {
            valid.reduce = [];
            var bl = {};
            _.each(byland, function(b) {
                var id = b[0];
                bl[id] = bl[id] ? bl[id] : { id: parseInt(id), relevance: b[1], count: 0};
                bl[id].count++;
                bl[id].relevance = Math.max(bl[id].relevance, b[1]);
            });
            var find = _.sortBy(_.values(bl), function(b) { return b.count+b.relevance*5; });
            var maxrelevance = -2;
            var ind = {};
            var ii = -1;
            while (f = find.pop())
            {
                if (situation[f.id] > 0)
                {
                    if (f.relevance < maxrelevance)
                        continue;
                    var i = _.find(ind, function(val, key) {
                        return _.contains(this.map[key].neighbours, f.id);
                    }, this);
                    if (i === undefined || i < 0) {
                        i = ++ii;
                        valid.reduce[i] = [];
                    }
                    ind[f.id] = i;
                    valid.reduce[i].push(f.id); 
                    maxrelevance = Math.max(f.relevance, maxrelevance);
                }
            }
        }
        return valid;
    },
    _nghValue: function(situation, neighbours) {
        var nghVal = {};
        for (var key in situation)
        {
            var ngh = neighbours[key];
            nghVal[key] = situation[key];
            _.each(ngh, function(n) {
                nghVal[key] += situation[n];
            }, this);
        }
        return nghVal;
    },
    changes: function(situation) {
        var nets = {};
        _.each(situation, function(s, k) {
            nets[k] = s - this.start[k];
        }, this);
        console.log(nets);
    }
}

module.exports = {
    run: function(ctx) {
        console.log("Moving tribes with mover");
        var engine = this;
        this.mover(this.map.areas, function(ok) {
            ctx.target(_.mapObject(ok.target, function(t) { return {tribes: t }}));
            
            if (ok.reduce) {
                console.log("Used SEA, must pay tribes!")
                var initial = {};
                _.each(ctx.initial, function(area, ak) {
                    ak = parseInt(ak);
                    if (_.contains(_.flatten(ok.reduce), ak))
                        initial[ak] = { tribes: ok.target[ak] };
                });
                var opts = {
                    map: this.map.areas,
                    initial: initial,
                    shows: ['tribes'],
                    edits: ['tribes'],
                    original: ok.reduce,
                    amount: ok.reduce.length,
                    reduce: function(key, chg) {
                        var rTrb = this.initial[key].tribes - chg.tribes;
                        this.amount -= rTrb;
                        return { 'tribes': chg.tribes };
                    },
                    current: function(chg, key, val) {
                        if (!key)
                        {
                            this.current = this.initial;
                        }
                    }
                }
                engine.reducer(new reducer.Reducer(opts), function(rdc) {
                    ctx.change(rdc.changes);
                    ctx.done && ctx.done();
                });
            } else
                ctx.done && ctx.done();
        });
    },
    TribeMover: TribeMover
};