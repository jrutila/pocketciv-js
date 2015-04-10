var _ = require('underscore');
module.exports = {
    name: "atlantis",
    title: "City of Atlantis",
    description: "You must be a Trading Partner with Atlatea. \
You must turn a City in a Region that Neighbors the Sea into a City of Atlantis. \
This City still follows City rules, but is also a Wonder.",
    points: 50,
    cost: {
        tribes: 8,
        gold: 25
    },
    requirements: function(ctx) {
        var engine = this;
        return _.contains(engine.trading, "atlatea");
    },
    can_acquire: function(area) {
        return area.city > 0;
    }
}