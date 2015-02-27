var reducer = require("../core/reducer");
var _ = require("underscore");

module.exports = {
    name: "cartage",
    title: "Cartage",
    description: "Cities upkeep requirements for farms are not confined to local Regions.",
    points: 2,
    cost: { 'tribes': 2 },
    resources: [ 'stone' ],
    requires: [ ],
    required_by: [ 'roadbuilding' ],
    events: { },
    actions: { },
    phases: {
        'city_support.post': function(ctx) {
            var areas = this.map.areas;
            ctx.supported = ctx.supported || [];
            var farmCount = _.reduce(areas, function(memo, area, ak) {
                if (area.farm)
                    return memo + 1;
                return memo;
            }, 0);
            var cityCount = _.reduce(areas, function(memo, area, ak) {
                if (area.city > 0 && !_.contains(ctx.supported, ak))
                    return memo + 1;
                return memo;
            }, 0);
            console.log("There is total of "+farmCount+" farms and total of "+cityCount+" unsupported cities")
            ctx.reset();
            if (farmCount < cityCount)
            {
                var initial = {};
                _.each(this.map.areas, function(a, k) {
                    if (a.city > 0 && !_.contains(ctx.supported, k))
                        initial[k] = a;
                });
                
                var opts = {
                    map: this.map.areas,
                    initial: initial,
                    amount: cityCount - farmCount,
                    shows: ['farm', 'city'],
                    edits: [],
                    reduce: function(key) {
                        this.amount--;
                        return { 'city': this.initial[key].city - 1 };
                    }
                };
                var rdc = new reducer.Reducer(opts);
                this.reducer(rdc, function(ok) {
                    ctx.change(ok.changes);
                    ctx.done && ctx.done();
                });
            } else 
                ctx.done && ctx.done();
        }
    }
}