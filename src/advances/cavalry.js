var _ = require("underscore");

module.exports = {
    name: "cavalry",
    title: "Cavalry",
    description: "A single Tribe counts as 2 when going on an Expedition to the Frontier",
    points: 8,
    cost: { 'tribes': 6, 'gold': 8 },
    resources: [ 'wood' ],
    requires: [ 'equestrian' ],
    required_by: [],
    events: { },
    actions: { },
    phases: { },
    acquired: function() {
        this.params.expedition_frontier_force = 2;
    }
}