var reducer = require("../core/reducer");
var _ = require("underscore");

module.exports = {
    name: "cartage",
    title: "Cartage",
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
            var farmCount = _.reduce(_.values(areas), function(memo, area) {
                if (area.farm)
                    return memo + 1;
                return memo;
            }, 0);
            var cityCount = _.reduce(_.values(areas), function(memo, area) {
                if (area.city > 0)
                    return memo + 1;
                return memo;
            }, 0);
            console.log("There is total of "+farmCount+" farms and total of "+cityCount+" cities")
            ctx.changes = {};
            if (farmCount < cityCount)
            {
                var rdc = new reducer.Reducer();
                rdc.mode = reducer.Modes.Overall;
                rdc.startAmount = cityCount - farmCount;
                rdc.areas = function() {
                    return _.object(_.filter(_.map(areas, function(area, key) {
                        if (area.city > 0)
                            return [key, area];
                    }), function(arr) { return arr !== undefined; }));
                }
                rdc.reduce = function(r, area) {
                    console.log("reduce")
                    console.log(this.changes)
                    if (this.visited.indexOf(area.id) == -1 && r.city === -1)
                    {
                        this.amount--;
                        return { 'city': '-1' };
                    }
                    return;
                }
                this.reducer(rdc, function(chg) {
                    ctx.changes = chg;
                    ctx.done && ctx.done();
                });
            } else 
                ctx.done && ctx.done();
        }
    }
}