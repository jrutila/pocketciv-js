var reducer = require("../core/reducer");
var _ = require("underscore");

module.exports = {
    name: "roadbuilding",
    title: "Roadbuilding",
    description: "Tribes may move across two borders",
    points: 6,
    cost: { 'tribes': 1 },
    resources: [ 'stone', 'wood' ],
    requires: [ 'cartage' ],
    required_by: [ 'common_tongue' ],
    events: {
        'epidemic': {
            }
        },
    actions: { },
    phases: { },
    acquired: function() {
        this.params.moveLimit = 2;
    },
}