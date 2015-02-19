var _ = require("underscore");

module.exports = {
    name: "sails_and_rigging",
    title: "Sails and Rigging",
    description: "A single Tribe counts as 2 when going on an Expedition to the Sea",
    points: 6,
    cost: { 'tribes': 6, 'gold': 4 },
    resources: [ 'wood' ],
    requires: [ 'navigation', 'astronomy' ],
    required_by: [],
    events: { },
    actions: { },
    phases: { },
    acquired: function() {
        this.params.expedition_sea_force = 2;
    }
}