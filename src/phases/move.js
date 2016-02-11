var reducer = require("../core/reducer");
var _ = require('underscore');
var YP = require('../core/YieldProlog');

var debug = 0;
        
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
        this.handleMissing(this.start, this.map);
    
        debug && console.log("start", this.start)
        var neighbours = _.object(_.keys(this.map), [[],[],[],[],[],[],[],[]])
        var neighbours2 = _.object(_.keys(this.map), [[],[],[],[],[],[],[],[]])
        
        var findMap = this.map;
        var start = this.start;
        var moveLimit = this.moveLimit;
        var seaCost = this.seaCost;
        function findRoute(route,dist,found,cost) {
            dist--;
            var mySeas = [];
            if (!cost) cost = { max: start[_.first(route)], burn: [], sea: [] };
            _.each(_.difference(findMap[_.last(route)].neighbours, route), function(ngh, nk) {
                if (ngh == 'frontier') return;
                if (isSea(ngh)) {
                    mySeas.push(ngh);
                    return;
                }
                var r = _.union(route, [parseInt(ngh)])
                found(r,cost);
                if (dist <= 0)
                    debug > 3 && console.log("b", r);
                var ccost = {
                    max: Math.min(cost.max, start[_.last(r)]),
                    burn: cost.burn.concat([_.last(r)]),
                    sea: cost.sea
                }
                findRoute(r,dist, found,ccost);
                
            }, this);
            
            // TODO: Change!
            if (seaCost == -1) return;
            
            _.each(mySeas, function(s) {
                var sNgh = []
                _.each(findMap, function(area, sk) {
                    if(_.contains(area.neighbours, s) && !_.contains(route,parseInt(sk)))
                    {
                        sNgh.push(sk);
                        var r = _.union(route, [parseInt(sk)]);
                        var cc = cost.concat(_.last(route))
                        found(r,cc);
                        if (dist <= 0)
                            debug > 3 && console.log("s",r)
                        findRoute(r,dist,found,cc);
                    }
                });
            },this);
        }
        
        var viaMap = {1:{},2:{},3:{},4:{},5:{},6:{},7:{},8:{}};
        _.each(this.map, function(from, fk) {
            findRoute([parseInt(fk)], moveLimit, function(route, cost) {
                debug > 3 && console.log(route,cost)
                if (cost.max > 0) {
                    if (viaMap[_.first(route)][_.last(route)] == undefined)
                        viaMap[_.first(route)][_.last(route)] = [];
                    viaMap[_.first(route)][_.last(route)].push(cost);
                }
                if (cost.burn.length == 0)
                    neighbours[_.first(route)].push(_.last(route))
                if (cost.burn.length <= 1)
                    neighbours2[_.first(route)].push(_.last(route))
            });
        }, this);
        debug && console.log("viaMap")
        debug && console.log(require('util').inspect(viaMap, false, 3))
        
        /*
        var ngh2 = [];
        _.each(this.map, function(from, fk) {
            findRoute([parseInt(fk)], moveLimit+1, function(route) {
                if (cost.burn == [])
                    neighbours2[_.first(route)].push(_.last(route))
            });
        }, this);
        */
        
        var uniqs = function(val,key) { return _.uniq(val); };
        this.viaMap = viaMap;
        this.neighbours = _.mapObject(neighbours, uniqs);
        this.neighbours2 = _.mapObject(neighbours2, uniqs);
        
        this.max = this._nghValue(this.start, this.neighbours);
        this.ngh2 = this._nghValue(this.start, this.neighbours2);
    },
    _umove: function*(s,m,b,n) {
        if (!b) {
            b = _.object(this.keys,[0,0,0,0,0,0,0,0]);
        }
        if (!m) m = [];
        if (n == undefined) {
            n = Math.max(this.start[s]-this.end[s], 0);
        }
        var j = _.size(m);
        var k = this.keys[j];
        
        debug > 3 && console.log('-',s,k,n,m)
        
        if (_.size(m) == _.size(this.start))
        {
            // We have reached the last area
            yield { move: m, burn: b };
        }
        else if (
            // No movement if there is no moves left
            n <= 0 ||
            // No movement to self
            k == s ||
            // No movement if there is no via
            this.viaMap[s][k] == undefined ||
            // No movement if there is no tribes in the target
            this.end[k] == 0 ||
            // No movement if target is not increased
            this.end[k] <= this.start[k]
            )
        {
            var mm = m.concat([0]);
            yield* this._umove(s,mm,b,n);
        } else { 
            var via = this.viaMap[s][k];
            var min = this.start[s]-this.end[s];
            // Try every possible route
            //debug && console.log('+',s,k,n,_.size(via),this.end[k],b)
            for (var l = 0; l < via.length; l++)
            {
                var burned = n;
                // Remove prev burn from starting area
                if (_.has(b,s)) {
                    burned = n - (b[s] - this.end[s]);
                }
        
                // Try to move n or end times
                for (var i = Math.min(this.end[k], burned, via[l].max); i>=0; i--)
                {
                    var mm = m.concat([i]);
                    var bb = _.clone(b);
                    var cango = true;
                    if (i > 0)
                    {
                        for (var bi = 0; bi < via[l].burn.length; bi++)
                        {
                            var ba = via[l].burn[bi];
                            bb[ba] += i;
                            if (bb[ba] > this.start[ba])
                            {
                                // Too many burns for one area
                                cango = false;
                            }
                        }
                        bb[s] += i;
                    }
                    if (!cango) continue;
                    debug > 3 && console.log('+',s,k,n-i,bb,mm)
                    yield* this._umove(s,mm,bb,n-i);
                }
            }
        }
    },
    moves: function*(m,b) {
        if (!m) m = [];
        
        var j = _.size(m);
        var k = this.keys[j];
        if (_.size(m) == _.size(this.start))
        {
            yield { move: m, burn: b }
        }
        else {
            var g = this._umove(k,null,b)
            
            var gg = g.next();
            while (!gg.done)
            {
                yield* this.moves(
                    m.concat([gg.value.move]),
                    gg.value.burn
                    );
                gg = g.next();
            }
        }
    },
    handleMissing: function(situation, neighbours) {
        if (_.size(situation) != _.size(neighbours))
        {
            _.each(neighbours, function(nn, area) {
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
        
        // If the preliminary check failed
        if (!valid.ok) return valid;
        
        // Do the real check
        this.end = situation;
        this.keys = _.map(_.keys(this.start),function(v) { return parseInt(v); });
        console.log(this.keys)
        
        /*
        var it = this._umove(1)
        var nn = it.next();
        while (!nn.done)
        {
            console.log(nn.value)
            nn = it.next();
        }
        return;
        */
        
        var it = this.moves();
        var nn = it.next();
        valid.ok = false;
        var smallest_cost = 999;
        // Go through every possible move
        while (!nn.done)
        {
            debug > 3 && console.log(nn.value)
            var move = nn.value.move;
            var summed = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0};
            for (var i = 0; i < _.size(move); i++)
            {
                var k = this.keys[i];
                summed[k] = this.start[k];
                for (var j = 0; j < _.size(move); j++)
                {
                    summed[k] -= move[i][j];
                    summed[k] += move[j][i];
                }
                
                // If the end situation is not correct
                if (summed[k] != (this.end[k] || 0))
                {
                    summed = false;
                }
            }
            if (summed)
            {
                debug && console.log("--")
                debug && console.log(nn.value);
                valid.ok = true;
                
                /*
                var cost = 0;
                for (var i = 0; i < _.size(nn.value.cost); i++)
                    cost += _.size(_.uniq(nn.value.cost[i]));
                console.log(cost);
                
                // Found out the cheapest alternative
                if (cost == 0 || seaCost == 0){
                    valid.cost = [];
                    //break;
                }
                    
                if (cost < smallest_cost)
                {
                    valid.cost = [nn.value];
                    smallest_cost = cost;
                } else if (cost == smallest_cost)
                {
                    valid.cost.push(nn.value);
                }
                */
            }
            nn = it.next();
        }
        if (!valid.ok) fail();
        if (seaCost == 0) return valid;
        
        var validcost = [];
        _.map(valid.cost, function(move) {
            var trg = {1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[]};
            for (var i = 0; i < _.size(this.start); i++)
            {
                // No cost for this area
                if (move.cost[i].length == 0) continue;
                var k = this.keys[i];
                _.each(move.move[i], function(am, j) {
                    if (am == 0) return;
                    _.each(_.uniq(move.cost[i]), function(fr) {
                        trg[fr].push(this.keys[j]);
                        trg[fr] = _.uniq(trg[fr]);
                    },this);
                },this);
            }
            console.log(trg)
            var vcost = {};
            _.each(trg, function(tot,from) {
                if (tot == []) return;
                _.each(tot, function(to) {
                    var tto = vcost[to] || 0;
                    vcost[to] = tto+seaCost; 
                },this);
            },this);
            validcost.push(vcost);
        },this);
        valid.cost = validcost;
        
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