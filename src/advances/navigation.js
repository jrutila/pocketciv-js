var reducer = require("../core/reducer");
var _ = require('underscore')

module.exports = {
    name: "navigation",
    title: "Navigation",
    description: " Tribes that border the Sea may go on Expeditions (to the Sea). \
You may move your Tribes between any Regions that \
border the Sea at the cost of 1 Tribe.",
    points: 5,
    cost: { 'tribes': 3 },
    resources: [ 'wood' ],
    requires: [ ],
    required_by: [ 'shipping', 'sails_and_rigging' ],
    events: { },
    phases: { },
    acquired: function() {
        this.params.sea_move = true;
        this.params.sea_cost = this.params.sea_cost == 0 ? 0 : 1;
        this.params.sea_expedition = true;
    },
    actions: { },
}