var _ = require('underscore');
module.exports = {
    name: "coliseum",
    title: "Coliseum of Death",
    description: "Must be built in a Region with a City. \
    You must have Theater.",
    points: 25,
    cost: {
        tribes: 6,
        gold: 25
    },
    requirements: function(ctx) {
        var engine = this;
        return _.contains(engine.acquired, "theater");
    },
    can_acquire: function(area) {
        return area.city > 0;
    }
}