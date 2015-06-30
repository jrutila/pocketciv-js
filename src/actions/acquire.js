var _ = require("underscore")

function getResources(area) {
    var ret = [];
    if (area.mountain || area.volcano)
        ret.push('stone');
    if (area.farm)
        ret.push('food');
    if (area.forest)
        ret.push('wood');
    return ret;
}

function AdvanceAcquirer(engine, areas) {
    this.advances = _.clone(engine.advances);
    this.acquired = _.clone(engine.acquired) || [];
    this.nowacquired = {};
    this.round_acquired = _.clone(engine.round.acquired) || {};
    this.areas = {};
    this.replaceable_resources = engine.params.replaceable_resources || [];
    _.each(areas || engine.map.areas, function(a, ak) {
            this.areas[ak] = _.clone(a);
    },this);
    this.gold = engine.gold;
    this.engine = engine;
}

AdvanceAcquirer.prototype = {
    get totalCity() {
        return _.reduce(this.areas, function(memo, a) { return a.city ? memo + a.city : memo; }, 0);
    },
    get possibleAdvances() {
        var adv = {};
        for (var key in _.omit(this.advances, this.acquired)) {
            // Check requirements
            if (_.has(this.advances[key], 'requires') && this.advances[key].requires) {
                var kk = _.keys(this.advances);
                var aq = this.acquired;
                var re = _.clone(this.advances[key].requires);

                // First, check optional requirements (either one must be required)
                // Remove them from re if they are satisfied
                var re = _.filter(re, function(r) {
                    if (!_.isArray(r)) return true;
                    return _.intersection(r, aq).length < 1;
                });
                // Check that all requirements are acquired
                if (!_.isEqual(_.intersection(aq, re), re)) {
                    continue;
                }
            }

            adv[key] = {
                'areas': []
            };

            // If there is still room for acquirements
            if (this.totalCity > _.size(this.acquired))
            {
                for (var a in _.omit(_.pick(this.areas, function(ar) {return ar.city > 0;}), _.union(_.keys(this.round_acquired), _.keys(this.nowacquired)))) {
                    // Check tribes
                    var has_tribes = true;
                    var has_resources = true;
                    var has_gold = true;
                    var extra_ok = true;
                    
                    // Check tribes
                    if ('tribes' in this.advances[key].cost) {
                        if (!(this.areas[a].tribes >= this.advances[key].cost.tribes))
                            has_tribes = false;
                    }
    
                    // Check resources
                    if ('resources' in this.advances[key]) {
                        var area_resources = getResources(this.areas[a]);
                        var satisfied = function(a, b) {
                            return _.intersection(a,b).length == b.length;
                        }
                        has_resources = false;
                        
                        if (satisfied(area_resources, this.advances[key].resources))
                            has_resources = true;
                        else
                            _.each(this.replaceable_resources, function(r) {
                                if (_.contains(area_resources, r)) {
                                    var repl = _.without(this.replaceable_resources, r);
                                    repl = _.union(repl, _.without(area_resources, r));
                                    if (satisfied(repl, this.advances[key].resources))
                                        has_resources = true;
                                }
                            },this);
                    }
                    
                    // Check gold
                    if ('gold' in this.advances[key].cost) {
                        /*
                        var total = _.reduce(this.nowacquired, function(memo, adva) {
                            return memo + (adva.cost.gold || 0)
                        }, 0);*/
                        //if (this.gold < total + this.advances[key].cost.gold)
                        if (this.gold < this.advances[key].cost.gold)
                            has_gold = false;
                    }
                    
                    // Extra check
                    if (this.advances[key].can_acquire)
                        extra_ok = this.advances[key].can_acquire(this.areas[a], this.engine);
    
                    if (has_tribes && has_resources && has_gold && extra_ok)
                        adv[key].areas.push(a);
                }
            }
        }
        return adv;
    },
    acquire: function(name, area) {
        this.acquired.push(name);
        this.nowacquired[area] = this.advances[name];
        this.areas[area].tribes -= this.advances[name].cost.tribes || 0;
        this.gold -= this.advances[name].cost.gold || 0;
    },
}

module.exports = {
    title: "Acquire Advances",
    run: function(ctx) {
        var engine = this;
        engine.round.acquired = engine.round.acquired || {};
        engine.advanceAcquirer(engine, function(acquires) {
            console.log("ACQUIRING ")
            console.log(acquires)
            var changes = { };
            acquires = _.omit(acquires, _.keys(engine.round.acquired));
            for (var area in acquires)
            {
                var acq = acquires[area];
                if (_.has(acquires[area].cost, 'tribes'))
                    ctx.change(area, { tribes: -1*acq.cost.tribes});
                if (_.has(acquires[area].cost, 'gold'))
                    ctx.change('gold', -1*acq.cost.gold);
                engine.acquire(acq.name, ctx);
                engine.round.acquired[area] = acq.name;
            }
            ctx.done && ctx.done();
        });
    },
    AdvanceAcquirer: AdvanceAcquirer
}