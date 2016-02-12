var reducer = require("../core/reducer");
var _ = require('underscore');
var util = require('util');

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
    stop: function() {
        debug && console.log("STOP")
        this.stopped = true;
    },
    init: function(strt) {
        this.stopped = false;
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
                var max = Math.max(cost.max, start[_.last(r)]);
                var burn = cost.burn;
                if (dist <= 0)
                {
                    max = Math.min(cost.max, start[_.last(r)]);
                    burn = cost.burn.concat([_.last(r)]);
                }
                var ccost = {
                    max: max,
                    burn: burn,
                    sea: cost.sea
                }
                findRoute(r,dist, found,ccost);
                
            }, this);
            
            // TODO: Change!
            if (seaCost == -1) return;
            
            _.each(mySeas, function(s) {
                _.each(findMap, function(area, sk) {
                    if(_.contains(area.neighbours, s) && !_.contains(route,parseInt(sk)))
                    {
                        var from = _.last(route);
                        var r = _.union(route, [parseInt(sk)]);
                        debug > 2 && console.log("s",r)
                        var ccost = {
                            max: cost.max,
                            burn: _.clone(cost.burn),
                            sea: cost.sea.concat([from])
                        };
                        found(r,ccost);
                        var max = Math.max(cost.max, start[_.last(r)]);
                        var burn = ccost.burn;
                        if (dist <= 0)
                        {
                            max = Math.min(cost.max, start[_.last(r)]);
                            burn = cost.burn.concat([_.last(r)]);
                        }
                        
                        ccost = {
                            max: max,
                            burn: burn,
                            sea: ccost.sea
                        }
                        findRoute(r,dist,found,ccost);
                    }
                });
            },this);
        }
        
        var viaMap = {1:{},2:{},3:{},4:{},5:{},6:{},7:{},8:{}};
        _.each(this.map, function(from, fk) {
            findRoute([parseInt(fk)], moveLimit, function(route, cost) {
                debug > 2 && console.log(route,cost)
                if (cost.max > 0) {
                    if (viaMap[_.first(route)][_.last(route)] == undefined)
                        viaMap[_.first(route)][_.last(route)] = [];
                    viaMap[_.first(route)][_.last(route)].push(cost);
                }
                if (cost.burn.length <= moveLimit-1)
                    neighbours[_.first(route)].push(_.last(route))
                if (cost.burn.length <= moveLimit)
                    neighbours2[_.first(route)].push(_.last(route))
            });
            
            // Select only the best ones
            _.each(viaMap[fk], function(via, tk) {
                via = _.sortBy(via, function(v) {
                    return [v.burn.length, v.sea.length];
                });
                
                var maxs = [];
                var shortest = 9;
                var shortestSea = 9;
                
                var straight = _.find(via, function(v) {
                    if (v.burn.length == 0 && v.sea.length == 0)
                    {
                        shortest = 0;
                        shortestSea = 0;
                        maxs.push(v.max);
                        return true;
                    }
                });
                
                var straightSea =_.find(via, function(v) {
                    if (v.burn.length == 0 && _.first(v.sea) == fk)
                    {
                        shortestSea = v.sea.length;
                        maxs.push(v.max);
                        return true;
                    }
                });
                
                var shortestLand = _.filter(via, function(v) {
                    if (_.isEqual(v,straight)) return false;
                    if  (v.sea.length == 0 && v.burn.length < shortest)
                    {
                        shortest = v.burn.length;
                        maxs.push[v.max];
                        return true;
                    }
                });
                
                var shortestSea = _.filter(via, function(v) {
                    if (_.isEqual(v,straightSea)) return false;
                    if (straightSea && _.first(v.sea) == fk) return false;
                    if (_.any(shortestLand, function(s) { return _.isEqual(s.burn, v.burn) })) return false;
                    if  (v.sea.length > 0 && v.burn.length <= shortestSea)
                    {
                        shortestSea = v.burn.length;
                        maxs.push[v.max];
                        return true;
                    }
                });
                
                var missingMaxes = _.filter(via, function(v) {
                    if (v.max <= _.max(maxs)) return false;
                    maxs.push(v.max);
                    return true;
                });
                
                
                via = [];
                
                if (straight) via = via.concat([straight]);
                if (straightSea) via = via.concat([straightSea]);
                via = via.concat(shortestLand);
                via = via.concat(shortestSea);
                via = via.concat(missingMaxes);
                
                viaMap[fk][tk] = _.uniq(via, JSON.stringify);
            });
        }, this);
        debug && console.log("viaMap")
        debug && console.log(util.inspect(viaMap, false, 4))
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
    _umove: function*(s,m,b,n,c,a,d) {
        if (this.stopped) return;
        // burn
        if (!b) b = _.object(this.keys,[0,0,0,0,0,0,0,0]);
        // already moved
        if (!a) a = _.object(this.keys,[0,0,0,0,0,0,0,0]);
        // final cost
        if (!d) d = _.object(this.keys,[0,0,0,0,0,0,0,0]);
        // movements
        if (!m) m = [];
        // sea cost
        if (!c) c = [];
        // n marks what is left in this branch to move from s
        if (n == undefined) {
            n = Math.max(this.start[s]-this.end[s], 0);
            if (_.has(b,s))
                var pb = b[s];
        }
        
        var j = _.size(m);
        // current target area
        var k = this.keys[j];
        var min = this.start[s]-this.end[s];
        
        if (debug > 2)
        {
            _.size(m) < _.size(this.start) && console.log('-',s,k,n,m)
            _.size(m) == _.size(this.start) && console.log('#',s,n,m,a)
        }
        
        var lastOne = false;
        if (s == _.last(this.keys))
        {
            // We are working on the last m
            lastOne = true;
        }
        
        if (_.size(m) == _.size(this.start))
        {
            if (n > 0) return;
            // We have reached the last area
            yield { move: m, burn: b, cost: d, costs: c, already: a };
        }
        else if (
            // No movement if there is no moves left
            n <= 0 ||
            // No movement to self
            k == s ||
            // No movement if the source (s) is not decreased
            this.end[s] >= this.start[s] ||
            // No movement if there is no via
            this.viaMap[s][k] == undefined ||
            // No movement if there is no tribes in the target
            this.end[k] == 0 ||
            // No movement if target is not increased
            this.end[k] <= this.start[k]
            )
        {
            var mm = m.concat([0]);
            yield* this._umove(s,mm,b,n,c,a,d);
        } else { 
            var viaMap = this.viaMap[s][k];
            // Try every possible route with every possible amount
            //debug && console.log('+',s,k,n,_.size(via),this.end[k],b)
            for (var l = 0; l < viaMap.length; l++)
            {
                var via = viaMap[l];
                
                // What is the maximum
                var maxEnd = this.end[k]-a[k];
                if (_.has(b,k))
                    maxEnd = this.end[k]-b[k];
                // How many can be transferred from here at max
                // Either what is left, or via's max or targets final
                var maxVia = Math.min(n,via.max,this.end[k]);
                
                // If this is the first element of the move array
                // and there is previous burn
                // pb does not go into recursion, it just fixes n
                if (pb)
                    maxVia -= pb;
                
                // Try with every move
                for (var i = maxVia; i>= 0; i--)
                {
                    debug > 1 && console.log(Array(m.length+2).join("_"),s,k,i,b,a,c,d)
                    debug > 2 && console.log("       ",via)
                    
                    var mm = m.concat([i]);
                    var bb = _.clone(b);
                    bb[s] += i;
                    // If burns will raise it too high
                    if (bb[s] > this.start[s])
                        continue;
                    var cont = false;
                    _.each(via.burn, function(vb) {
                        bb[vb] += i;
                        if (bb[vb] > this.start[vb])
                        {
                            // If burns will raise it too high
                            cont = true;
                        }
                    },this);
                    if (cont) continue;
                    
                    // If the final target does not fulfill
                    if (lastOne && a[k] + i != this.end[k])
                        continue;
                    
                    var aa = _.clone(a);
                    aa[k] += i;
                    // if there is too much moved already to target
                    if (aa[k] > this.end[k])
                        continue;
                    
                    var cc = c.concat([]);
                    var dd = _.clone(d);
                    _.each(via.sea, function(s) {
                        var snext = via.burn.indexOf(s)+1;
                        var snext = via.burn[snext];
                        if (!snext) snext = k;
                        if (!_.any(cc, function(com) { return _.isEqual(com,[s,snext])}))
                        {
                            cc.push([s,snext]);
                            dd[snext]++;
                        }
                        if (dd[snext] > this.end[snext])
                            cont = true;
                        if (cc.length >= this.minCost)
                            cont = true;
                    },this);
                    if (cont) continue;
                    
                    debug > 1 && console.log(Array(mm.length+1).join("+"),s,k,i,bb,aa,mm,cc,dd)
                    yield* this._umove(s,mm,bb,n-i,cc,aa,dd);
            }
            }
        }
    },
    moves: function*(m,b,c,a,d) {
        if (this.stopped) return;
        if (!m) m = [];
        if (!c) c = [];
        
        var j = _.size(m);
        var k = this.keys[j];
        if (_.size(m) == _.size(this.start))
        {
            yield {
                move: m,
                burn: b,
                costs: _.uniq(c, false, function(v) { return v.toString() }),
                cost: d, 
                already: a
            }
        }
        else {
            var g = this._umove(k,null,b,null,c,a,d)
            
            var gg = g.next();
            while (!gg.done)
            {
                if (this.stopped) return;
                debug > 2 && console.log(gg.value)
                yield* this.moves(
                    m.concat([gg.value.move]),
                    gg.value.burn,
                    gg.value.costs,
                    gg.value.already,
                    gg.value.cost
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
    ok: function(situation, success) {
        // Clean up the situation
        situation = _.pick(situation, _.filter(_.keys(situation), function(s) { return parseInt(s) }));
        this.handleMissing(situation, this.neighbours);
        var no_perm_check = 1;
        var valid = {
            ok: false,
            target: situation,
            initial: this.start,
            cost: [],
        };
        var start = this.start;
        var seaCost = this.seaCost;
        
        if (this.moveLimit == -1) return valid;
        if (_.isEqual(this.start, situation)) return valid;
        
        success = success || function(ok) {
            if (ok.ok && debug)
            {
                debug && console.log("Success !");
                debug && console.log(util.inspect(ok,false,4));
            }
        };
        
        // Different amount of tribes
        if (sum(this.start) != sum(situation))
            return valid;
        
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
                return valid;
            }
            if (ngh[key] < this.start[key]) {
                return valid;
            }
            if (ngh[key] > this.ngh2[key]) {
                return valid;
            }
        }
        debug && console.log("Basic checks ok");
        
        // Do the real check
        this.end = situation;
        this.keys = _.map(_.keys(this.start),function(v) { return parseInt(v); });
        
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
            if (this.stopped) {
                valid.ok = "stopped";
                return valid;
            }
            debug > 2 && console.log(nn.value)
            var move = nn.value.move;
            if (true)
            {
                debug > 0 && console.log("--")
                debug > 0 && console.log(nn.value);
                valid.ok = true;
                
                //jvar cost = 0;
                //for (var i = 0; i < _.size(nn.value.cost); i++)
                var cost = _.reduce(nn.value.cost, function(c,m) { return c+m },0);
                debug && console.log("cost",cost);
                
                // Found out the cheapest alternative
                if (cost == 0 || seaCost == 0){
                    valid.cost = [];
                    success(valid);
                    break;
                }
                    
                if (cost <= smallest_cost)
                {
                    if (cost < smallest_cost)
                        valid.cost = [];
                    smallest_cost = cost;
                    this.minCost = cost;
                    
                    valid.cost.push(nn.value.cost);
                    success(valid);
                }
            }
            nn = it.next();
        }
        if (this.stopped) {
            valid.ok = "stopped";
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