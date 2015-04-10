var _ = require('underscore');
module.exports = {
    name: "giant_statue",
    title: "Giant Gilded Statue of Yourself",
    description: "You must have Arts",
    points: 18,
    cost: {
        tribes: 6,
        gold: 25
    },
    requirements: function(ctx) {
        var engine = this;
        return _.contains(engine.acquired, "arts");
    },
    can_acquire: function(area) {
        return true;
    }
}