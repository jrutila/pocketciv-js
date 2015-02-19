var reducer = require("../core/reducer");
var _ = require('underscore')

module.exports = {
    name: "navigation",
    title: "Navigation",
    description: "TBD",
    points: 5,
    cost: { 'tribes': 3 },
    resources: [ 'wood' ],
    requires: [ ],
    required_by: [ 'shipping', 'sails_and_rigging' ],
    events: { },
    phases: {
        'move.post': function(ctx) {
            var rdc = new reducer.Reducer(this);
            rdc.mode = reducer.Modes.Overall;
            rdc.startAmount = 0;
            rdc.initValues = { from: undefined, to: undefined };
            
            rdc.areas = function() {
                var areas = {};
                var from = undefined;
                var to = undefined;
                
                for (var c in this.changes)
                {
                    var chg = this.changes[c];
                    if (chg.tribes < 0) {
                        // No two "from" areas
                        if (from)
                            return {};
                        from = c;
                    } else if (chg.tribes > 0) {
                        // No two "to" areas
                        if (to)
                            return {};
                        to = c;
                    }
                }
                var allowed_seas = from && _.filter(this.engine.map.areas[from].neighbours,
                        reducer.isSea);
                _.each(this.engine.map.areas, function(a, aid) {
                    if (_.some(a.neighbours, reducer.isSea)) {
                        // Only those areas that share the same sea
                        if (!allowed_seas || (
                            _.intersection(a.neighbours, allowed_seas).length > 0
                            ))
                        areas[aid] = a;
                   } 
                }, this);
                return areas;
            };
            
            rdc.reduce = function(r, area) {
                var t = r.tribes;
                if (area.tribes + t < 0)
                    return false;
                this.amount += t;
                if (t > 0)
                {
                    if (this.engine.params.sea_move_cost != 0)
                        this.amount++;
                    if (this.to && this.to != area)
                        return false;
                    this.to = area;
                    if (this.from)
                    {
                        var allowed_seas = _.filter(this.from.neighbours, reducer.isSea);
                        if (_.intersection(this.to.neighbours, allowed_seas).length == 0)
                            return false;
                    }
                    return { 'tribes': '+'+t.toString() };
                } else if (t < 0) {
                    if (this.from && this.from != area)
                        return false;
                    this.from = area;
                    if (this.to)
                    {
                        var allowed_seas = _.filter(this.to.neighbours, reducer.isSea);
                        if (_.intersection(this.from.neighbours, allowed_seas).length == 0)
                            return false;
                    }
                    return { 'tribes': t.toString() };
                }
            };
            
            this.reducer(rdc, function(chg) {
                ctx.changes = chg;
                ctx.done && ctx.done();
            });
        }
    },
    acquired: function() {
        this.params.sea_move_cost = 1;
        this.params.sea_expedition = true;
    },
    actions: { },
}