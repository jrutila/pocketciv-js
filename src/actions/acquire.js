var _ = require("underscore")

module.exports = {
    title: "Acquire Advances",
    run: function() {
        var engine = this;
        engine.round.acquired = engine.round.acquired || {};
        engine.advanceAcquirer(engine, function(acquires) {
            console.log("ACQUIRING ")
            console.log(acquires)
            var changes = { };
            acquires = _.omit(acquires, _.keys(engine.round.acquired));
            for (var area in acquires)
            {
                if (_.has(acquires[area].cost, 'tribes'))
                    changes[area] = { 'tribes': '-'+acquires[area].cost.tribes };
                if (_.has(acquires[area].cost, 'gold'))
                    changes['gold'] = '-'+acquires[area].cost.gold;
            }
            engine.areaChange(changes, function() {
                _.each(_.values(acquires), function(a) {
                    engine.acquire(a.name);
                });
                engine.round.acquired = _.extend(engine.round.acquired, acquires);
            });
        });
    }
}