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
        // TODO: Should this use engine.isSeaNeighbour in some way?
        // Find the seas
        var ss = _.filter(area.neighbours, function (e) { return typeof e == "string" && e != 'frontier'; });
        var seangh = [];
        
        // Determine the sea neighbours
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
    
    if (seaCost > -1)
    {
        this.landNeighbours = _.clone(this.neighbours);
        this.neighbours = this.neighboursSea;
    }
    
    // First level neighbours with moveLimit
    for (var m = 1; m < moveLimit; m++)
    {
        var nextFirst = {};
        var landish = {};
        _.each(this.neighbours, function(ngh, ak) {
            nextFirst[ak] = _mergeNgh(ngh, this.neighbours, ak);
        },this);
        _.each(this.neighbours, function(ngh, ak) {
            this.neighbours[ak] = nextFirst[ak];
        },this);
        _.each(this.landNeighbours, function(ngh, ak) {
            landish[ak] = _mergeNgh(ngh, this.landNeighbours, ak);
        },this);
        _.each(this.landNeighbours, function(ngh, ak) {
            this.landNeighbours[ak] = landish[ak];
        },this);
    }
    
    // Second level neighbours
    _.each(this.neighbours, function(ngh, ak) {
        this.neighbours2[ak] = _mergeNgh(ngh, this.neighbours, ak);
    },this)
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

function pp(cur, perms, maxMoves, max, min, count) {
    if (_.size(maxMoves) == 0)
    {
        if (max >= count && count >= min)
            perms.push(_.clone(cur));
        return;
    }
    
    var key = _.keys(maxMoves)[0];
    var mm = maxMoves[key];
    count = count || 0;
    
    for (var i = 0; i <= Math.min(mm, max === undefined ? mm : max - count); i++)
    {
        cur[key] = i;
        pp(cur, perms, _.omit(maxMoves, key), max, min, count+i);
    }
}


TribeMover.prototype = {
    init: function(strt) {
        this.start = strt;
        this.handleMissing(this.start, this.neighbours);
        this.max = this._nghValue(this.start, this.neighbours);
        this.ngh2 = this._nghValue(this.start, this.neighbours2);
    },
    handleMissing: function(situation, neighbours) {
        if (_.size(situation) != _.size(this.neighbours))
        {
            _.each(this.neighbours, function(nn, area) {
                if (!_.has(situation, area))
                    situation[area] = 0;
            },this);
        }
    },
    ok: function(situation, fail, costFunc) {
        this.handleMissing(situation, this.neighbours);
        var debug = 0;
        var valid = {
            ok: true,
            target: situation,
            initial: this.start,
            cost: [],
        };
        if (this.moveLimit == -1) return valid;
        if (_.isEqual(this.start, situation)) return valid;
        fail = fail || function() {
            valid.ok = false;
            if (debug)
                console.log("FAIL HERE!")
        };
        costFunc = costFunc || function() {  };
        
        if (sum(this.start) != sum(situation))
            fail();
        
        var start = this.start;
        var ngh = this._nghValue(situation, this.neighbours);
        var moveFrom = {};
        var moveTo = {};
        _.each(this.start, function(val, key) {
            var from = _.object(_.map(this.neighbours[key], function(nn) {
                if (start[key] == 0) return [nn, 0];
                if (situation[nn] == 0) return [nn, 0];
                return [nn, _.min([start[key], situation[nn]])];
            }));
            moveFrom[key] = from;
        }, this);
        
        if (debug) {
        console.log('--COMP--')
        console.log(sum(this.start) + " != " + sum(situation))
        console.log('this.neighbours')
        console.log(this.neighbours)
        console.log('this.neighbours2')
        console.log(this.neighbours2)
        console.log('this.max')
        console.log(this.max)
        console.log('this.ngh2')
        console.log(this.ngh2)
        console.log('this.start')
        console.log(this.start)
        console.log('curr - situation')
        console.log(situation)
        console.log('curr - moveFrom')
        console.log(moveFrom)
        console.log('--XOMP--')
        }
        
        for (var key in situation)
        {
            debug && console.log("check "+key)
            if ((situation[key] || 0) > this.max[key]) {
                fail();
            }
            if (ngh[key] < this.start[key]) {
                fail();
            }
            if (ngh[key] > this.ngh2[key]) {
                fail();
            }
        }
        debug && console.log("AREA PERMS");
        var areaPerms = {};
        _.each(moveFrom, function(mf, key) {
            var perms = [];
            debug == 2 && console.log("Area "+key + " start: "+start[key] + " now: "+situation[key]);
            pp({}, perms, mf, start[key], start[key] - situation[key]);
            debug == 2 && console.log(perms)
            areaPerms[key] = perms;
        },this);
        
        var mutch = {};
        _.each(this.neighbours, function(nghbrs, k) {
            debug == 2 && console.log("Check combination for "+k+" neighbours "+require('util').inspect(nghbrs))
            var findMatch = function (cur, matches, ngh, count) {
                if (_.size(ngh) == 0)
                {
                    debug == 2 && console.log("comb  : "+require('util').inspect(cur));
                    debug == 2 && console.log("count : "+count+ " "+ (count == situation[k] ? "ok" : ""))
                    if (count == situation[k])
                        matches.push(_.clone(cur));
                    return;
                }
                
                if (count > situation[k])
                    return;
                
                var n = ngh[0];
                
                _.each(areaPerms[n], function(p) {
                    cur[n] = p;
                    findMatch(cur, matches, ngh.slice(1), count + p[k]);
                },this);
            };
        
            var mat = [];
            _.each(areaPerms[k], function(p) {
                findMatch({}, mat, nghbrs, 
                    start[k] - _.reduce(_.values(p), function(memo, n) { return memo+n;}, 0));
            });
            mutch[k] = mat;
        });
        
        //debug && console.log(require('util').inspect(mutch, true, 10));
        
        _.each(situation, function(sit, key) {
            debug == 2 && console.log("Area "+key+" should have "+sit)
            debug == 2 && console.log(require("util").inspect(mutch[key], true, 10)) ;
            _.each(this.neighbours[key], function(nnn) {
                var allowed = _.map(mutch[key], function(gee) {return gee[nnn];});
                //console.log("Area "+key+" allows "+nnn+":")
                areaPerms[nnn] = _.intersection(areaPerms[nnn], allowed);
                //console.log(areaPerms[nnn]);
            },this);
        },this);
        
        debug && console.log("FINAL PERMS")
        _.each(areaPerms, function(perm, key) {
            debug && console.log(key+ " "+ require('util').inspect(perm));
            if (_.size(perm) == 0)
                fail();
        },this);
        
        if (debug) {
        console.log("MOVE READY")
        console.log(this.start)
        console.log(situation)
        console.log(valid.ok)
        console.log(require('util').inspect(valid.cost, true, 10))
        }
        
        // Determine cost
        debug && console.log(this.landNeighbours)
        
        var seaCost = this.seaCost;
        var landNeighbours = this.landNeighbours;
        var calcCost = function(curr) {
            var sit = _.clone(start);
            var cost = {};
            _.each(curr, function(p, from) {
                _.each(p, function(val, to) {
                    sit[from] -= val;
                    sit[to] += val;
                    if (val > 0 && !_.contains(landNeighbours[from], parseInt(to)))
                        cost[to] = (cost[to] || 0) + seaCost;
                })
            })
            if (!_.isEqual(sit, situation))
                return false;
            return cost;
        };
        
        if (this.seaCost > 0)
        {
            // Determine costs
            var totalCost = 10;
            var findCost = function(costs, curr, perms) {
                if (_.size(perms) == 0)
                {
                    var cost = calcCost(curr);
                    if (cost) 
                    {
                        var total = _.reduce(_.values(cost), function(memo, n) {return memo+n;}, 0);
                        if (total <= totalCost && !_.some(costs, function(c) { return _.isEqual(c, cost); }))
                        {
                            debug == 2 && console.log(require('util').inspect(curr));
                            debug == 2 && console.log("cost : "+require('util').inspect(cost));
                            if (total < totalCost) costs.splice(0, costs.length);
                            totalCost = total;
                            if (_.size(cost))
                                costs.push(cost);
                        }
                    }
                    else
                    {
                        return true;
                    }
                    return;
                }
                
                var key = _.keys(perms)[0];
                
                _.each(perms[key], function(p) {
                    curr[key] = p;
                    if (findCost(costs, curr, _.omit(perms,key)))
                        return true;
                });
            };
            var costs = [];
            debug && console.log("seacost: "+this.seaCost)
            findCost(costs, {}, areaPerms);
            debug && console.log(require("util").inspect(costs, true, 10))
            valid.cost = costs;
            costFunc(costs);
        }
        
        return valid;
    },
    _nghValue: function(sit, neighbours) {
        var nghVal = {};
        _.each(sit, function(val, key) {
            nghVal[key] = _.reduce(neighbours[key], function(memo, n) {
                return memo + sit[n];
            },val);
        },this);
        return nghVal;
    },
    changes: function(sit) {
        var nets = {};
        _.each(sit, function(s, k) {
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
                    amount: ok.reduce.length*engine.params.sea_cost,
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
    TribeMover: TribeMover,
    pp: pp
};