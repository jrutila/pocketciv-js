var _ = require('underscore');
module.exports = {
    name: "citadel",
    title: "Mountain Citadel",
    description: "Must be built in a region with a Mountain/Volcano.",
    points: 45,
    cost: {
        tribes: 12,
        gold: 30
    },
    can_acquire: function(area) {
        return area.mountain || area.volcano;
    }
}