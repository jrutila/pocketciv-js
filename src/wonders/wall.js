var _ = require('underscore');
module.exports = {
    name: "wall",
    title: "Great Wall of Solitude",
    description: "Must built in a Region bordering the Frontier. \
Don't perform Visitionation Events when Visitations \
happen in Regions with the Great Wall. \
Expeditions cannot be started from this Region.",
    points: 25,
    cost: {
        tribes: 6,
        gold: 25
    },
    requirements: function(ctx) {
        return true;
    },
    can_acquire: function(area) {
        return _.contains(area.neighbours, "frontier");
    },
    events: {
        "visitation": {
            // TODO: Implement!
        } 
    }
}