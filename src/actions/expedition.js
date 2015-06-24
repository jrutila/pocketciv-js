var _ = require("underscore")
var reducer = require("../core/reducer");

module.exports = {
    title: "Expedition",
    run: function(ctx) {
        console.log("Running expedition")
        var initial = {};
        _.each(this.map.areas, function(a, key) {
            if (a.tribes > 0)
            {
                if (_.contains(a.neighbours, 'frontier'))
                    initial[key] = a;
                if (this.params.sea_expedition && _.some(a.neighbours, function(n) { return typeof n == "string"; }))
                    initial[key] = a;
            }
        }, this);
        var engine = this;
        var opts = {
            map: this.map.areas,
            initial: initial,
            shows: ['tribes'],
            edits: ['tribes'],
            amount: 0,
            sea_multi: this.params.expedition_sea_force || 1,
            frontier_multi: this.params.expedition_frontier_force || 1,
            split: this.params.expedition_split || 1,
            reduce: function(key, chg) {
                var rTrb = this.initial[key].tribes - chg.tribes;
                this.amount = rTrb;
                if (engine.isSeaNeighbour(this.map[key], "expedition"))
                    this.amount *= this.opts.sea_multi;
                else if (_.contains(this.map[key].neighbours, 'frontier'))
                    this.amount *= this.opts.frontier_multi;
                
                return { tribes: chg.tribes };
            },
            current: function(chg, key, val) {
                if (key == undefined)
                {
                    this.current = _.clone(this.initial);
                } else if (_.has(this.changes, key)) {
                    this.current = {};
                    this.current[key] = this.initial[key];
                }
            },
            check: function() {
                return this.amount >= 0;
            }
        }
        var rdc = new reducer.Reducer(opts);
        
        var engine = this;
        engine.reducer(rdc, function(ok) {
            var expforce = 0;
            ctx.change(ok.changes);
            for (var a in ok.changes)
                expforce += -1*ok.changes[a].tribes;
            console.log("Expedition force: "+expforce);
            if (expforce > 0)
                engine.draw(function(c) {
                    var sgold = 0;
                    var fgold = 0;
                    // Frontier expedition
                    if (engine.map.areas[a].neighbours.indexOf('frontier') > -1)
                    {
                        fgold = expforce * opts.frontier_multi - Math.ceil(c.hexagon / opts.split);
                    }
                    // Sea expedition
                    if (engine.params.sea_expedition && engine.isSeaNeighbour(engine.map.areas[a], "expedition"))
                    {
                        sgold = expforce * opts.sea_multi - Math.ceil(c.square / opts.split);
                        console.log("Sea gold: "+sgold);
                        console.log("Frontier gold: "+fgold);
                    }
                    var gold = Math.max(fgold, sgold);
                    console.log("Expedition gold: "+gold);
                    if (gold > 0)
                        ctx.change('gold', gold);
                    ctx.done && ctx.done();
                })
        });
    }
}