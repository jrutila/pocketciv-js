var reducer = require("../core/reducer");
var _ = require('underscore');
var YP = require('../core/YieldProlog');

var debug = 1;
        
function isSea(n)
{
    return typeof n == "string" && n != "frontier";
}



function TribeMover(map, moveLimit, seaCost) {
    this.start = {};
    // Clean up the map, only areas needed
    if (map.areas != undefined)
        this.map = { areas: _.clone(map.areas) };
    else
        this.map = _.clone(map);
        
    moveLimit = moveLimit ? moveLimit : 1;
    this.moveLimit = moveLimit;
    seaCost = seaCost === undefined ? -1 : seaCost;
    this.seaCost = seaCost;
    
    var neighbours = _.object(_.keys(this.map), [[],[],[],[],[],[],[],[]])
    var neighbours2 = _.object(_.keys(this.map), [[],[],[],[],[],[],[],[]])
    
    var findMap = this.map;
    function findRoute(route,dist,found,cost) {
        dist--;
        var mySeas = [];
        _.each(_.difference(findMap[_.last(route)].neighbours, route), function(ngh, nk) {
            if (ngh == 'frontier') return;
            if (isSea(ngh)) {
                mySeas.push(ngh);
                return;
            }
            var r = _.union(route, [parseInt(ngh)])
            found(r);
            if (dist > 0)
                findRoute(r,dist, found);
            
        }, this);
        
        if (seaCost == 0) return;
        
        console.log("seas")
        _.each(mySeas, function(s) {
            var sNgh = []
            _.each(findMap, function(area, sk) {
                if(_.contains(area.neighbours, s) && !_.contains(route,parseInt(sk)))
                {
                    sNgh.push(sk);
                    var r = _.union(route, [parseInt(sk)]);
                    found(r);
                    if (dist > 0)
                        findRoute(r,dist,found);
                }
            });
        },this);
    }
    
    _.each(this.map, function(from, fk) {
        findRoute([parseInt(fk)], moveLimit, function(route, cost) {
            console.log(route)
            neighbours[_.first(route)].push(_.last(route))
        });
    }, this);
    
    var ngh2 = [];
    _.each(this.map, function(from, fk) {
        findRoute([parseInt(fk)], moveLimit+1, function(route) {
            neighbours2[_.first(route)].push(_.last(route))
        });
    }, this);
    
    var uniqs = function(val,key) { return _.uniq(val); };
    this.neighbours = _.mapObject(neighbours, uniqs);
    this.neighbours2 = _.mapObject(neighbours2, uniqs);
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
        // Clean up the start
        this.start = _.pick(strt, _.filter(_.keys(strt), function(s) { return parseInt(s) }));
        this.handleMissing(this.start, this.neighbours);
        this.max = this._nghValue(this.start, this.neighbours);
        this.ngh2 = this._nghValue(this.start, this.neighbours2);
    },
    _umove: function*(m,n,s) {
        var j = _.size(m)+1;
        
        if (_.size(m) == _.size(this.start))
        {
            yield m;
        }
        else if (n==0) {
            yield* this._umove(m.concat([0]), n, s);
        }
        else if (j == s)
        {
            // No movement to self
            var mm = m.concat([0]);
            yield* this._umove(mm,n,s);
        } else { 
            // Try to move n or end times
            for (var i = Math.min(this.end[j], n); i>=0; i--)
            {
                var mm = m.concat([i]);
                yield* this._umove(mm,n-i,s);
            }
        }
    },
    moves: function*(m) {
        if (!m) m = [];
        var j = _.size(m)+1;
        if (_.size(m) == _.size(this.start))
        {
            yield m;
        }
        else {
            var g = this._umove([],this.start[j],j)
            var gg = g.next();
            while (!gg.done)
            {
                var mm = m.concat([gg.value]);
                yield* this.moves(mm);
                gg = g.next();
            }
        }
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
        // Clean up the situation
        situation = _.pick(situation, _.filter(_.keys(situation), function(s) { return parseInt(s) }));
        this.handleMissing(situation, this.neighbours);
        var no_perm_check = 1;
        var valid = {
            ok: true,
            target: situation,
            initial: this.start,
            cost: [],
        };
        var start = this.start;
        var seaCost = this.seaCost;
        
        if (this.moveLimit == -1) return valid;
        if (_.isEqual(this.start, situation)) return valid;
        
        fail = fail || function() {
            valid.ok = false;
            if (debug)
                console.log("FAIL HERE!")
        };
        costFunc = costFunc || function() {  };
        
        // Different amount of tribes
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
        
        debug && console.log("BASIC CHECKS");
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
        
        this.end = situation;
        
        var it = this.moves();
        var nn = it.next();
        while (!nn.done)
        {
            var summed = [0,0,0,0];
            for (var i = 0; i < _.size(this.start); i++)
            {
                for (var j = 0; j < _.size(this.start); j++)
                {
                   summed[i] += nn.value[j][i];
                }
                
                // If the end situation is not correct
                if (summed[i] != this.end[i+1])
                {
                    summed = false;
                }
            }
            if (summed)
                console.log(nn.value);
            nn = it.next();
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
            
            if (_.size(ok.cost)) {
                console.log("Used SEA, must pay tribes!")
                
                var initial = {};
                _.each(ctx.initial, function(area, ak) {
                    if (_.any(ok.cost, function(c) { return _.has(c, ak ); }))
                        initial[ak] = { tribes: ok.target[ak] };
                });
                
                var opts = {
                    map: this.map.areas,
                    initial: initial,
                    shows: ['tribes'],
                    edits: ['tribes'],
                    original: ok.reduce,
                    amount: _.reduce(ok.cost[0], function(memo, n) {
                        return memo + n;
                    }, 0),
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