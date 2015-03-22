var _ = require('underscore');
module.exports = {
    name: "justice",
    title: "Hall of Justice",
    description: "Must be built in a region with a City. You must have Law.",
    points: 40,
    cost: {
        tribes: 8,
        gold: 20
    },
    requirements: function(ctx) {
        var engine = this;
        return _.contains(engine.acquired, "law");
    },
    can_acquire: function(area) {
        return area.city > 0;
    }
}