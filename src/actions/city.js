var reducer = require("../core/reducer");
var _ = require("underscore");

module.exports = {
    title: "Build a City",
    log: "Built a city to {{ regions changes }}",
    params: {
        city_cost: 4,
    },
    run: function(ctx) {
        var engine = this;
        
        var city_cost = ctx.params.city_cost || 4;
        
        var initial = _.pick(ctx.initial, function(area) {
            return !area.city && area.tribes >= city_cost;
        });
        
        var opts = {
            map: engine.map.areas,
            initial: initial,
            shows: ['tribes', 'farm'],
            edits: [],
            amount: 0,
            reduce: function(key) {
                return { city: 1, tribes: this.initial[key].tribes - city_cost };
            }
        }
        engine.reducer(new reducer.Reducer(opts), function(rdc) {
            _.each(rdc.chg, function(key) {
                ctx.target(key, {city: 1 });
                ctx.change(key, {tribes: city_cost*-1 });
            },this)
            ctx.done && ctx.done();
        });
    }
}