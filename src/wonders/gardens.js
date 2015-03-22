var _ = require('underscore');
module.exports = {
    name: "gardens",
    title: "Hanging Gardens",
    description: "You must have Irrigation. You must have Arts.",
    points: 20,
    cost: {
        tribes: 4,
        gold: 20
    },
    requirements: function(ctx) {
        var engine = this;
        return _.contains(engine.acquired, "arts") &&
        _.contains(engine.acquired, "irrigation");
    },
    can_acquire: function(area) {
        return true;
    }
}